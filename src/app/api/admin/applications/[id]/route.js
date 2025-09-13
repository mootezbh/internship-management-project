import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/applications/[id] - Get single application details
export async function GET(request, { params }) {
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

    console.log('Fetching application with ID:', id)

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true,
            createdAt: true
          }
        },
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
        },
        responses: {
          include: {
            field: true
          }
        }
      }
    })

    console.log('Application found:', application ? 'Yes' : 'No')

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application details', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/applications/[id] - Update application status with action
export async function PATCH(request, { params }) {
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

    // Await params as required by Next.js 15
    const { id } = await params

    const body = await request.json()
    const { action } = body

    // Convert action to status
    let status
    switch (action) {
      case 'accept':
        status = 'ACCEPTED'
        break
      case 'reject':
        status = 'REJECTED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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

    return NextResponse.json({ application }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/applications/[id] - Update application status and feedback
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

    // Await params as required by Next.js 15
    const { id } = await params

    const body = await request.json()
    const { status, feedback } = body

    // Validate status
    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        feedback: feedback || null,
        reviewedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
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

    return NextResponse.json({ application }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}
