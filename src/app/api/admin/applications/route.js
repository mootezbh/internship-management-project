import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/applications - Get all applications for review
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

    const applications = await prisma.application.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            cvUrl: true,
            education: true,
            university: true,
            degree: true,
            graduationYear: true,
            major: true,
            skills: true,
            interests: true,
            lookingFor: true,
            preferredFields: true
          }
        },
        internship: {
          select: {
            id: true,
            title: true,
            field: true,
            description: true,
            location: true,
            capacity: true,
            duration: true
          }
        },
        responses: {
          include: {
            field: {
              select: {
                id: true,
                type: true,
                label: true,
                required: true,
                options: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    )
  }
}
