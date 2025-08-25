import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/progress/[internshipId] - Get user progress for a specific internship
export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = params
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    // Check if user has accepted application for this internship
    const application = await prisma.application.findFirst({
      where: {
        userId: user.id,
        internshipId: id,
        status: 'ACCEPTED'
      }
    })
    if (!application) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    // Get all submissions for tasks in this internship's learning path
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        learningPath: {
          include: {
            tasks: {
              include: {
                submissions: {
                  where: { userId: user.id }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })
    if (!internship || !internship.learningPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }
    // Format progress data
    const progress = {}
    let completedTasks = 0
    let currentTaskIndex = 0
    let foundIncomplete = false
    internship.learningPath.tasks.forEach((task, index) => {
      const submission = task.submissions[0] // Get user's submission for this task
      const isCompleted = submission && submission.status === 'APPROVED'
      progress[task.id] = {
        taskId: task.id,
        completed: isCompleted,
        submission: submission || null,
        isAvailable: !foundIncomplete || isCompleted, // Task gating: only available if previous tasks completed
        order: task.order
      }
      if (isCompleted) {
        completedTasks++
      } else if (!foundIncomplete) {
        currentTaskIndex = index
        foundIncomplete = true
      }
    })
    const progressData = {
      internshipId: id,
      totalTasks: internship.learningPath.tasks.length,
      completedTasks,
      currentTaskIndex,
      progressPercentage: internship.learningPath.tasks.length > 0 
        ? Math.round((completedTasks / internship.learningPath.tasks.length) * 100)
        : 0,
      taskProgress: progress
    }
    return NextResponse.json(progressData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    )
  }
}
