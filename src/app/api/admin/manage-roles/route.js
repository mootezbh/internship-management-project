import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, action } = body

    if (!email || !action) {
      return NextResponse.json({ error: 'Email and action are required' }, { status: 400 })
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user role
    const newRole = action === 'promote' ? 'ADMIN' : 'INTERN'
    
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({
      message: `User ${action === 'promote' ? 'promoted to admin' : 'demoted to intern'} successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    )
  }
}
