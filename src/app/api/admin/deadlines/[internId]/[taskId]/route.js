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

    // Check if there's an existing deadline adjustment for this intern and task
    let deadlineAdjustment = await prisma.deadlineAdjustment.findUnique({
      where: {
        userId_taskId: {
          userId: internId,
          taskId: taskId
        }
      }
    })

    if (deadlineAdjustment) {
      // Update existing deadline adjustment
      deadlineAdjustment = await prisma.deadlineAdjustment.update({
        where: { id: deadlineAdjustment.id },
        data: {
          newDeadlineOffset: deadlineOffset,
          reason: reason,
          adjustedAt: new Date()
        }
      })
    } else {
      // Create new deadline adjustment
      deadlineAdjustment = await prisma.deadlineAdjustment.create({
        data: {
          userId: internId,
          taskId: taskId,
          newDeadlineOffset: deadlineOffset,
          reason: reason
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Deadline adjusted successfully',
      deadlineAdjustment: deadlineAdjustment
    })

  } catch (error) {
    console.error('Error adjusting deadline:', error)
    return NextResponse.json(
      { error: 'Failed to adjust deadline' },
      { status: 500 }
    )
  }
}
