
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET /api/internships/[internshipId]/application-form
export async function GET(request, { params }) {
  const { internshipId } = params
  if (!internshipId) {
    return NextResponse.json({ error: 'Internship ID required' }, { status: 400 })
  }
  // Fetch the application form and its fields for this internship
  const form = await prisma.applicationForm.findUnique({
    where: { internshipId },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  })
  if (!form) {
    return NextResponse.json({ fields: [], message: 'No additional information required.' }, { status: 200 })
  }
  return NextResponse.json({
    id: form.id,
    title: form.title,
    description: form.description,
    fields: form.fields
  }, { status: 200 })
}
