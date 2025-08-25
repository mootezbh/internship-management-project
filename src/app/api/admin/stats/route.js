import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get comprehensive statistics
    const [
      totalUsers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      totalInternships,
      totalSubmissions,
      pendingSubmissions,
      recentApplications
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total applications
      prisma.application.count(),
      
      // Pending applications
      prisma.application.count({
        where: { status: 'PENDING' }
      }),
      
      // Accepted applications
      prisma.application.count({
        where: { status: 'ACCEPTED' }
      }),
      
      // Total internships
      prisma.internship.count(),
      
      // Total submissions
      prisma.submission.count(),
      
      // Pending submissions
      prisma.submission.count({
        where: { status: 'PENDING' }
      }),
      
      // Recent applications (last 10)
      prisma.application.findMany({
        take: 10,
        orderBy: { appliedAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          internship: {
            select: { title: true, description: true }
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        totalInternships,
        totalSubmissions,
        pendingSubmissions
      },
      recentApplications
    })

  } catch (error) {return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}
