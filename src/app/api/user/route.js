import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { apiResponse, handleApiError } from '@/lib/api-utils'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        apiResponse(null, 'Unauthorized'), 
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        applications: true,
        submissions: true
      }
    })

    if (!user) {
      return NextResponse.json(
        apiResponse(null, 'User not found'), 
        { status: 404 }
      )
    }

    return NextResponse.json(apiResponse(user))
  } catch (error) {
    return NextResponse.json(
      handleApiError(error), 
      { status: 500 }
    )
  }
}
