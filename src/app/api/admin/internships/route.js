import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/admin/internships - Get all internships (Admin only)
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const internships = await prisma.internship.findMany({
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
  } catch (error) {return NextResponse.json(
      { error: 'Failed to fetch internships', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/internships - Create new internship (Admin only)
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      location, 
      duration, 
      capacity, 
      field,
      startDate,
      endDate,
      learningPathId
    } = body

    // Validate required fields
    if (!title || !description || !duration || !capacity || !field) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create internship
    const internship = await prisma.internship.create({
      data: {
        title,
        description,
        location: location || '',
        duration: parseInt(duration),
        capacity: parseInt(capacity),
        field,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(learningPathId && { learningPathId })
      }
    })

    return NextResponse.json({ 
      success: true, 
      internship,
      message: 'Internship created successfully' 
    })

  } catch (error) {return NextResponse.json({ 
      error: 'Failed to create internship',
      details: error.message 
    }, { status: 500 })
  }
}
