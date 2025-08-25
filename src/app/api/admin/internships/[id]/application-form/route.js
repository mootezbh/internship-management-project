import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/admin/internships/[id]/application-form - Update application form configuration
export async function PUT(request, { params }) {
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
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const internshipId = params.id
    const body = await request.json()
    const { applicationFormFields } = body

    // Check if internship exists
    const existingInternship = await prisma.internship.findUnique({
      where: { id: internshipId }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Update the internship with new form fields
    const updatedInternship = await prisma.internship.update({
      where: { id: internshipId },
      data: {
        applicationFormFields: applicationFormFields
      }
    })

    return NextResponse.json({ 
      message: 'Application form updated successfully',
      internship: updatedInternship 
    })
  } catch (error) {
    console.error('Error updating application form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/internships/[id]/application-form - Get application form configuration
export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const internshipId = params.id

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      select: {
        id: true,
        title: true,
        applicationFormFields: true
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    return NextResponse.json({ internship })
  } catch (error) {
    console.error('Error fetching application form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
