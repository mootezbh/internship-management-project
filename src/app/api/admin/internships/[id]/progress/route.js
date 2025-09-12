import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const internshipId = params.id

    // Fetch internship with learning path and accepted applications
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        learningPath: {
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          }
        },
        applications: {
          where: { status: 'ACCEPTED' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePictureUrl: true
              }
            }
          }
        }
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Get all submissions for tasks in this learning path
    const taskIds = internship.learningPath?.tasks.map(task => task.id) || []
    const userIds = internship.applications.map(app => app.userId)

    const submissions = await prisma.submission.findMany({
      where: {
        taskId: { in: taskIds },
        userId: { in: userIds }
      },
      include: {
        task: true
      }
    })

    // Get all deadline adjustments for tasks in this learning path
    const deadlineAdjustments = await prisma.deadlineAdjustment.findMany({
      where: {
        taskId: { in: taskIds },
        userId: { in: userIds }
      }
    })

    // Calculate progress for each intern
    const interns = internship.applications.map(application => {
      const intern = application.user
      const internTasks = internship.learningPath?.tasks || []
      const internSubmissions = submissions.filter(sub => sub.userId === intern.id)
      const internDeadlineAdjustments = deadlineAdjustments.filter(adj => adj.userId === intern.id)

      // Calculate task statuses and deadlines
      const tasksWithStatus = internTasks.map(task => {
        const submission = internSubmissions.find(sub => sub.taskId === task.id)
        const deadlineAdjustment = internDeadlineAdjustments.find(adj => adj.taskId === task.id)
        
        const startDate = new Date(internship.startDate || new Date())
        const deadline = new Date(startDate)
        
        // Use adjusted deadline if it exists, otherwise use default
        const deadlineOffset = deadlineAdjustment ? deadlineAdjustment.newDeadlineOffset : task.deadlineOffset
        deadline.setDate(deadline.getDate() + deadlineOffset)

        let status = 'pending'
        if (submission) {
          switch (submission.status) {
            case 'APPROVED':
              status = 'completed'
              break
            case 'PENDING':
              status = 'pending'
              break
            case 'REQUIRES_CHANGES':
              status = 'requires_changes'
              break
          }
        } else if (new Date() > deadline) {
          status = 'overdue'
        }

        // Check if task is currently active (previous tasks completed)
        const previousTaskIndex = internTasks.findIndex(t => t.id === task.id) - 1
        const isPreviousCompleted = previousTaskIndex < 0 || 
          internSubmissions.find(sub => 
            sub.taskId === internTasks[previousTaskIndex].id && 
            sub.status === 'APPROVED'
          )

        if (status === 'pending' && isPreviousCompleted && new Date() <= deadline) {
          status = 'in-progress'
        }

        return {
          ...task,
          status,
          deadline: deadline.toISOString().split('T')[0],
          deadlineOffset: deadlineOffset, // Include the actual deadline offset used
          isDeadlineAdjusted: !!deadlineAdjustment,
          deadlineAdjustment: deadlineAdjustment || null,
          submission: submission || null
        }
      })

      // Calculate overall progress and status
      const completedTasks = tasksWithStatus.filter(t => t.status === 'completed').length
      const totalTasks = tasksWithStatus.length
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

      const overdueTasks = tasksWithStatus.filter(t => t.status === 'overdue').length
      const pendingReview = tasksWithStatus.filter(t => t.status === 'pending' && t.submission).length

      let overallStatus = 'on-track'
      if (overdueTasks > 0) {
        overallStatus = 'behind'
      } else if (progressPercentage < 70 && internTasks.length > 0) {
        // If less than 70% complete and has tasks, mark as at-risk
        const currentDate = new Date()
        const startDate = new Date(internship.startDate || new Date())
        const endDate = new Date(internship.endDate || new Date())
        const totalDuration = endDate.getTime() - startDate.getTime()
        const elapsed = currentDate.getTime() - startDate.getTime()
        const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
        
        if (timeProgress > progressPercentage + 20) {
          overallStatus = 'at-risk'
        }
      }

      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        profilePictureUrl: intern.profilePictureUrl,
        tasks: tasksWithStatus,
        progressPercentage: Math.round(progressPercentage),
        overallStatus,
        completedTasks,
        totalTasks,
        overdueTasks,
        pendingReview,
        applicationId: application.id
      }
    })

    // Sort interns by status priority (behind first, then at-risk, then on-track)
    const statusPriority = { 'behind': 0, 'at-risk': 1, 'on-track': 2 }
    interns.sort((a, b) => statusPriority[a.overallStatus] - statusPriority[b.overallStatus])

    return NextResponse.json({
      internship: {
        id: internship.id,
        title: internship.title,
        description: internship.description,
        startDate: internship.startDate,
        endDate: internship.endDate,
        learningPath: internship.learningPath
      },
      interns,
      summary: {
        totalInterns: interns.length,
        onTrack: interns.filter(i => i.overallStatus === 'on-track').length,
        atRisk: interns.filter(i => i.overallStatus === 'at-risk').length,
        behind: interns.filter(i => i.overallStatus === 'behind').length,
        averageProgress: interns.length > 0 ? 
          Math.round(interns.reduce((acc, i) => acc + i.progressPercentage, 0) / interns.length) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching internship progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch internship progress' },
      { status: 500 }
    )
  }
}
