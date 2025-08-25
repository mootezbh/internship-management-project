import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
    }

    // Check if user exists in database and get their role
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    })

    // If user doesn't exist in database, create them with default INTERN role
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          role: 'INTERN'
        },
        select: { role: true, id: true }
      })
    }

    // Redirect based on role
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    if (dbUser.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', baseUrl))
    } else {
      // For INTERN role or any other role, redirect to regular dashboard
      return NextResponse.redirect(new URL('/dashboard', baseUrl))
    }

  } catch (error) {
    console.error('Error in auth redirect:', error)
    // Fallback to regular dashboard on error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(new URL('/dashboard', baseUrl))
  } finally {
    await prisma.$disconnect()
  }
}
