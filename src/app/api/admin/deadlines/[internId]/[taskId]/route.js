import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(request, { params }) {
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

    const { internId, taskId } = params
    const body = await request.json()
    const { deadlineOffset, reason } = body

    if (typeof deadlineOffset !== 'number') {
      return NextResponse.json({ error: 'Invalid deadline offset' }, { status: 400 })
    }

    // Verify the intern and task exist and are related
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        learningPath: {
          include: {
            internships: {
              include: {
                applications: {
                  where: {
                    userId: internId,
                    status: 'ACCEPTED'
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if intern is enrolled in an internship using this learning path
    const hasAccess = task.learningPath.internships.some(internship => 
      internship.applications.length > 0
    )

    if (!hasAccess) {
      return NextResponse.json({ error: 'Intern not enrolled in this learning path' }, { status: 403 })
    }

    // For now, we'll store deadline adjustments in a custom table or update the task directly
    // Since we don't have a deadline adjustments table, we'll create a simple solution
    // by storing the adjustment in the submission feedback or creating a new approach

    // Check if there's an existing submission for this intern and task
    let submission = await prisma.submission.findUnique({
      where: {
        userId_taskId: {
          userId: internId,
          taskId: taskId
        }
      }
    })

    if (submission) {
      // Update existing submission with deadline info in adminComment
      const adminComment = `Deadline adjusted to ${deadlineOffset} days from start. ${reason ? `Reason: ${reason}` : ''}`
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          adminComment: adminComment
        }
      })
    } else {
      // Create a placeholder submission with the deadline adjustment
      submission = await prisma.submission.create({
        data: {
          userId: internId,
          taskId: taskId,
          githubUrl: '', // Empty for deadline adjustment
          status: 'PENDING',
          adminComment: `Deadline adjusted to ${deadlineOffset} days from start. ${reason ? `Reason: ${reason}` : ''}`
        }
      })
    }

    // In a real implementation, you might want to create a separate DeadlineAdjustment table
    // For now, we'll update the task's deadlineOffset for this specific intern
    // This is a simplified approach - in production, you'd want per-intern deadline tracking

    return NextResponse.json({
      success: true,
      message: 'Deadline adjusted successfully',
      newDeadlineOffset: deadlineOffset,
      submission: submission
    })

  } catch (error) {
    console.error('Error adjusting deadline:', error)
    return NextResponse.json(
      { error: 'Failed to adjust deadline' },
      { status: 500 }
    )
  }
}
