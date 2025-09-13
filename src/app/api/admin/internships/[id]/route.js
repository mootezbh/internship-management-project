import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/internships/[id] - Get single internship
export async function GET(request, { params }) {
  try {
    const authResult = await auth();
    console.log('Auth result:', authResult);
    const { userId } = authResult;
    if (!userId) {
      console.error('No userId from auth:', authResult);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    console.log('Prisma user:', user);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      console.error('User not admin:', user);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const internshipId = params.id;
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true
          }
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                clerkId: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                phone: true,
                bio: true,
                linkedinUrl: true,
                profilePictureUrl: true,
                cvUrl: true,
                education: true,
                university: true,
                degree: true,
                graduationYear: true,
                major: true,
                skills: true,
                interests: true,
                lookingFor: true,
                preferredFields: true,
                availabilityType: true,
                preferredDuration: true,
                remotePreference: true,
                profileComplete: true,
                applications: true,
                submissions: true,
                _count: true
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    console.log('Prisma internship:', internship);
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    return NextResponse.json({ internship });
  } catch (error) {
    console.error('Error fetching internship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/internships/[id] - Update internship
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
    
    const {
      title,
      description,
      duration,
      capacity,
      location,
      requirements,
      benefits,
      applicationDeadline,
      isActive,
      learningPathId,
      applicationFormFields
    } = body

    // Check if internship exists
    const existingInternship = await prisma.internship.findUnique({
      where: { id: internshipId }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // If learningPathId is provided, verify it exists
    if (learningPathId) {
      const learningPath = await prisma.learningPath.findUnique({
        where: { id: learningPathId }
      })

      if (!learningPath) {
        return NextResponse.json({ error: 'Learning path not found' }, { status: 400 })
      }
    }

    // Update internship
    const updatedInternship = await prisma.internship.update({
      where: { id: internshipId },
      data: {
        title,
        description,
        duration,
        capacity,
        location,
        requirements,
        benefits,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        isActive,
        learningPathId,
        applicationFormFields
      },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Internship updated successfully',
      internship: updatedInternship 
    })
  } catch (error) {
    console.error('Error updating internship:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/internships/[id] - Delete internship
export async function DELETE(request, { params }) {
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

    // Check if internship exists
    const existingInternship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        applications: true
      }
    })

    if (!existingInternship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 })
    }

    // Check if there are any applications
    if (existingInternship.applications.length > 0) {
      // Only SUPER_ADMIN can delete internships with applications
      if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { 
            error: 'Cannot delete internship with existing applications',
            details: `This internship has ${existingInternship.applications.length} application(s). Only SUPER_ADMIN can delete internships with applications.`
          },
          { status: 400 }
        )
      }
      
      // For SUPER_ADMIN, delete applications first (cascade delete)
      console.log(`SUPER_ADMIN deleting internship ${internshipId} with ${existingInternship.applications.length} applications`)
      
      // Delete all applications first
      await prisma.application.deleteMany({
        where: { internshipId: internshipId }
      })
    }

    // Delete internship
    await prisma.internship.delete({
      where: { id: internshipId }
    })

    return NextResponse.json({ 
      message: 'Internship deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting internship:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
