import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }// Check if user profile exists and is completed
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { profileComplete: true }
    })

    return NextResponse.json({ 
      profileCompleted: user?.profileComplete || false 
    }, { status: 200 })
  } catch (error) {return NextResponse.json(
      { error: 'Failed to check profile' },
      { status: 500 }
    )
  }
}
