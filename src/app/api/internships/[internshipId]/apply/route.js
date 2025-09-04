// GET /api/internships/[internshipId]/apply
export async function GET(request, { params }) {
  const { internshipId } = params
  if (!internshipId) {
    return NextResponse.json({ error: 'Internship ID required' }, { status: 400 })
  }
  // Validate user using Clerk
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Find the user in the DB
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  // Find application for this user and internship
  const application = await prisma.application.findUnique({
    where: {
      userId_internshipId: {
        userId: user.id,
        internshipId,
      },
    },
    include: {
      responses: true,
    },
  })
  if (!application) {
    return NextResponse.json({ applied: false }, { status: 200 })
  }
  return NextResponse.json({ applied: true, status: application.status, responses: application.responses }, { status: 200 })
}
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// POST /api/internships/[internshipId]/apply
export async function POST(request, { params }) {
  try {
    const { internshipId } = params
    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID required' }, { status: 400 })
    }
    
    // Validate user using Clerk
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Find the user in the DB
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if user has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_internshipId: {
          userId: user.id,
          internshipId,
        },
      },
    })
    
    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this internship' }, { status: 400 })
    }
    
    const body = await request.json()
    const { answers } = body
    
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers must be an array.' }, { status: 400 })
    }
    
    // Save application to DB
    const application = await prisma.application.create({
      data: {
        userId: user.id,
        internshipId,
        status: 'PENDING',
        appliedAt: new Date(),
      }
    })
    
    // Save responses only if there are answers
    const responses = []
    if (answers.length > 0) {
      for (const answer of answers) {
        if (answer.fieldId && answer.value !== undefined && answer.value !== null && answer.value !== '') {
          try {
            const response = await prisma.applicationResponse.create({
              data: {
                applicationId: application.id,
                fieldId: answer.fieldId,
                value: typeof answer.value === 'object' ? JSON.stringify(answer.value) : String(answer.value)
              },
              include: {
                field: true
              }
            })
            responses.push(response)
          } catch (responseError) {
            console.error('Error creating response for field:', answer.fieldId, responseError)
            // Continue with other responses even if one fails
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, application, responses }, { status: 201 })
    
  } catch (error) {
    console.error('Error in application submission:', error)
    return NextResponse.json({ error: 'Failed to submit application: ' + error.message }, { status: 500 })
  }
}
