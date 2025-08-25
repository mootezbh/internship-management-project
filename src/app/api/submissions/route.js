import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/submissions - Get user submissions for tasks
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }// Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all submissions for this user
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            order: true,
            learningPath: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })
    return NextResponse.json({ submissions })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/submissions - Create new task submission
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, githubUrl } = body// Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        learningPath: {
          include: {
            internships: {
              include: {
                applications: {
                  where: {
                    userId: user.id,
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

    // Check if user has access to this task (must have accepted application)
    const hasAccess = task.learningPath.internships.some(
      internship => internship.applications.length > 0
    )

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if user already submitted this task
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        taskId: taskId
      }
    })

    if (existingSubmission) {
      // Allow resubmission only if the task requires changes
      if (existingSubmission.status === 'REQUIRES_CHANGES') {
        // Update the existing submission
        const updatedSubmission = await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            githubUrl: githubUrl,
            status: 'PENDING',
            submittedAt: new Date(),
            feedback: null, // Clear previous feedback
            reviewedAt: null,
            adminComment: null // Clear admin comment
          },
          include: {
            task: {
              select: {
                title: true,
                order: true
              }
            }
          }
        })
        return NextResponse.json(updatedSubmission, { status: 200 })
      } else {
        return NextResponse.json({ error: 'Task already submitted' }, { status: 400 })
      }
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        taskId: taskId,
        githubUrl: githubUrl,
        status: 'PENDING'
      },
      include: {
        task: {
          select: {
            title: true,
            order: true
          }
        }
      }
    })
    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create submission', details: error.message },
      { status: 500 }
    )
  }
}
