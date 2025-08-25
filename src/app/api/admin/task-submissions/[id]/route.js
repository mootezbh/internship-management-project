import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/admin/task-submissions/[id] - Review task submission
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

  if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, feedback } = body

    // Validate status - use correct enum values from schema
    if (!['PENDING', 'APPROVED', 'REQUIRES_CHANGES'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        feedback: feedback || null,
        reviewedAt: new Date(),
        adminComment: feedback || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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
      }
    })

    return NextResponse.json({ submission }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to review submission', details: error.message },
      { status: 500 }
    )
  }
}
