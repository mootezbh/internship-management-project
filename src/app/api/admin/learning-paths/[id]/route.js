import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/learning-paths/[id] - Get specific learning path
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

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            internships: true
          }
        }
      }
    })

    if (!learningPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }

    return NextResponse.json({ learningPath }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to fetch learning path', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/learning-paths/[id] - Update learning path
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

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    const learningPath = await prisma.learningPath.update({
      where: { id: params.id },
      data: {
        title,
        description
      }
    })

    return NextResponse.json({ learningPath }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to update learning path', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/learning-paths/[id] - Update learning path
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

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    const learningPath = await prisma.learningPath.update({
      where: { id: params.id },
      data: {
        title,
        description
      }
    })

    return NextResponse.json({ learningPath }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to update learning path', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/learning-paths/[id] - Delete learning path
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if learning path is linked to any internships
    const linkedInternships = await prisma.internship.count({
      where: { learningPathId: params.id }
    })

    if (linkedInternships > 0) {
      return NextResponse.json(
        { error: 'Cannot delete learning path that is linked to internships' },
        { status: 400 }
      )
    }

    await prisma.learningPath.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Learning path deleted successfully' }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to delete learning path', details: error.message },
      { status: 500 }
    )
  }
}
