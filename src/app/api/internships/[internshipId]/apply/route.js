import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// POST /api/internships/[internshipId]/apply
export async function POST(request, { params }) {
  const { internshipId } = params
  if (!internshipId) {
    return NextResponse.json({ error: 'Internship ID required' }, { status: 400 })
  }
  // Validate user using Clerk
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const { answers } = body
  // Save application to DB
  const application = await prisma.application.create({
    data: {
      userId,
      internshipId,
      answers: answers || [],
      status: 'PENDING',
    }
  })
  return NextResponse.json({ success: true, application }, { status: 201 })
}
