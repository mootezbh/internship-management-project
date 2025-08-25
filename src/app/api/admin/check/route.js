import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isSuperAdmin = user.role === 'SUPER_ADMIN'

    return NextResponse.json({ 
      isAdmin,
      isSuperAdmin,
      role: user.role,
      email: user.email
    })

  } catch (error) {return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}
