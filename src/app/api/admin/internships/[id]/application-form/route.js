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
    const { fields, title = "Application Form", description } = body

    // Check if internship exists
    const existingInternship = await prisma.internship.findUnique({
      where: { id: internshipId }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Delete existing form and fields if they exist
    await prisma.formField.deleteMany({
      where: {
        form: {
          internshipId: internshipId
        }
      }
    })
    
    await prisma.applicationForm.deleteMany({
      where: { internshipId: internshipId }
    })

    // Create new form with fields
    const applicationForm = await prisma.applicationForm.create({
      data: {
        title,
        description,
        internshipId,
        fields: {
          create: fields.map((field, index) => ({
            label: field.label,
            type: field.type,
            placeholder: field.placeholder || '',
            helpText: field.helpText || '',
            required: field.required || false,
            options: field.options || [],
            order: index
          }))
        }
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Application form updated successfully',
      form: applicationForm 
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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const internshipId = params.id

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        applicationForm: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      internship: {
        id: internship.id,
        title: internship.title,
        applicationForm: internship.applicationForm
      }
    })
  } catch (error) {
    console.error('Error fetching application form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
