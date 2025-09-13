import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/admin/submissions/[id] - Get specific submission details
export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const adminEmails = ['admin@example.com', 'tensorphobia@example.com']
    const isAdmin = adminEmails.includes(user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const submissionId = params.id

    // Fetch submission with all related data
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            profilePictureUrl: true,
            university: true,
            degree: true,
            major: true
          }
        },
        task: {
          include: {
            learningPath: {
              include: {
                internships: {
                  include: {
                    applications: {
                      where: {
                        userId: {
                          equals: undefined // Will be set below
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Get the user's application for this internship
    const application = await prisma.application.findFirst({
      where: {
        userId: submission.user.id,
        internshipId: {
          in: submission.task.learningPath.internships.map(i => i.id)
        }
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            capacity: true,
            location: true,
            field: true
          }
        }
      }
    })

    // Get other submissions from this user for context
    const userSubmissions = await prisma.submission.findMany({
      where: {
        userId: submission.user.id,
        task: {
          learningPath: {
            internships: {
              some: {
                id: application?.internshipId
              }
            }
          }
        }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({
      submission,
      application,
      userSubmissions
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch submission details', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/submissions/[id] - Review submission (approve/reject/request changes)
export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const adminEmails = ['admin@example.com', 'tensorphobia@example.com']
    const isAdmin = adminEmails.includes(user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const submissionId = params.id
    const body = await request.json()
    const { action, feedback, adminComment } = body

    // Validate action
    const validActions = ['approve', 'reject', 'request_changes']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            order: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Determine new status
    let newStatus
    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        break
      case 'reject':
        newStatus = 'REJECTED'
        break
      case 'request_changes':
        newStatus = 'REQUIRES_CHANGES'
        break
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        feedback: feedback || adminComment || null,
        adminComment: feedback || adminComment || null,
        reviewedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    })
    return NextResponse.json(updatedSubmission)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to review submission', details: error.message },
      { status: 500 }
    )
  }
}
