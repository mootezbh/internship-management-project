import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { internshipId } = body

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if internship exists
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Check if user already applied to this internship
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: user.id,
        internshipId: internshipId
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this internship' }, { status: 400 })
    }

    // Create the application
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        internshipId: internshipId,
        status: 'PENDING'
      },
      include: {
        internship: {
          select: {
            title: true,
            field: true,
            location: true
          }
        }
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all applications for this user
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            location: true,
            duration: true,
            field: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })

    return NextResponse.json({ applications })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
