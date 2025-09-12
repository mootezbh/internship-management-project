import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// GET /api/admin/users/[id] - Get user details
export async function GET(request, { params }) {
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

    const { id } = await params

    console.log('Fetching user with ID:', id, 'Type:', typeof id)

    // First try a simple user lookup without includes
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id }
      });
      console.log('Basic user found:', user ? 'Yes' : 'No');
      
      if (user) {
        // If basic lookup works, try with applications
        try {
          user = await prisma.user.findUnique({
            where: { id },
            include: {
              applications: {
                include: {
                  internship: {
                    select: {
                      id: true,
                      title: true,
                      field: true,
                      startDate: true,
                      endDate: true
                    }
                  }
                },
                orderBy: {
                  createdAt: 'desc'
                }
              }
            }
          });
          console.log('User with applications found:', user ? 'Yes' : 'No');
        } catch (appError) {
          console.error('Error including applications:', appError);
          // Keep the basic user data if applications fail
        }
      }
    } catch (basicError) {
      console.error('Error with basic user lookup:', basicError);
      throw basicError;
    }

    console.log('Final user found:', user ? 'Yes' : 'No')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user role
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or super admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const { role } = await request.json()

    if (!role || !['ADMIN', 'INTERN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required (ADMIN, SUPER_ADMIN, or INTERN)' }, { status: 400 })
    }

    // Prevent same rank role changes
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }
    if (adminUser.role === targetUser.role) {
      return NextResponse.json({ error: 'You cannot change the role of a user with the same rank as you.' }, { status: 403 })
    }
    // Prevent admins from making super admins
    if (adminUser.role === 'ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admins cannot promote users to SUPER_ADMIN.' }, { status: 403 })
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: `User role updated to ${role} successfully`
    }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request, { params }) {
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

    const { id } = await params

    // Get user details before deletion
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (userToDelete.clerkId === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete from Clerk first
    try {
      const client = await clerkClient()
      await client.users.deleteUser(userToDelete.clerkId)
    } catch (clerkError) {// Continue with database deletion even if Clerk deletion fails
    }

    // Delete user from database (cascading will handle related records)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}
