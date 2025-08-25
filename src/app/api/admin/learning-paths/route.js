import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/learning-paths - Get all learning paths
export async function GET(request) {
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

    const learningPaths = await prisma.learningPath.findMany({
      include: {
        tasks: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            internships: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ learningPaths }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to fetch learning paths', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/learning-paths - Create new learning path
export async function POST(request) {
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

    const learningPath = await prisma.learningPath.create({
      data: {
        title,
        description
      }
    })

    return NextResponse.json({ learningPath }, { status: 201 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to create learning path', details: error.message },
      { status: 500 }
    )
  }
}
