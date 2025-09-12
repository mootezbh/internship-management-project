import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/internships - Get all internships with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const field = searchParams.get('field')

    // Build where clause for filtering
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { field: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(field && field !== 'all' && { field: field })
    }

    const internships = await prisma.internship.findMany({
      where,
      include: {
        learningPath: {
          include: {
            tasks: {
              select: {
                id: true,
                title: true,
                order: true
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        applications: {
          select: {
            id: true,
            status: true,
            userId: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate available spots for each internship
    const internshipsWithAvailability = internships.map(internship => ({
      ...internship,
      spotsRemaining: internship.capacity - internship._count.applications,
      tasksCount: internship.learningPath?.tasks?.length || 0
    }))

    return NextResponse.json({ internships: internshipsWithAvailability }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch internships', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/internships - Create new internship (Admin only)
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (both ADMIN and SUPER_ADMIN can create internships)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      duration,
      capacity,
      location,
      field,
      startDate,
      endDate,
      learningPathId
    } = body

    const internship = await prisma.internship.create({
      data: {
        title,
        description,
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        location,
        field,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        learningPathId
      },
      include: {
        learningPath: true
      }
    })
    return NextResponse.json({ internship }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create internship', details: error.message },
      { status: 500 }
    )
  }
}
