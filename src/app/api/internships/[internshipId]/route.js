import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/internships/[internshipId] - Get internship details by internshipId
export async function GET(request, { params }) {
  try {
    const { internshipId } = params
    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID required' }, { status: 400 })
    }
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        applications: {
          where: { status: 'ACCEPTED' },
          select: {
            userId: true,
            status: true,
            reviewedAt: true,
            appliedAt: true
          }
        },
        learningPath: {
          include: {
            tasks: {
              select: {
                id: true,
                title: true,
                order: true,
                description: true,
                content: true,
                responseRequirements: true,
                deadlineOffset: true,
                createdAt: true,
                updatedAt: true
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }
    return NextResponse.json(internship, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch internship', details: error.message }, { status: 500 })
  }
}
