import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileComplete: true,
        phone: true,
        bio: true,
        linkedinUrl: true,
        profilePictureUrl: true,
        education: true,
        university: true,
        degree: true,
        graduationYear: true,
        major: true,
        cvUrl: true,
        cvParsed: true,
        skills: true,
        interests: true,
        lookingFor: true,
        preferredFields: true,
        availabilityType: true,
        preferredDuration: true,
        remotePreference: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle JSON request body
    const body = await request.json()
    
    const {
      phone,
      bio,
      linkedinUrl,
      profilePictureUrl,
      education,
      university,
      degree,
      graduationYear,
      major,
      cvUrl,
      cvParsed,
      skills,
      interests,
      lookingFor,
      preferredFields,
      availabilityType,
      preferredDuration,
      remotePreference
    } = body

    // Get user data from Clerk for creating if not exists
    let clerkUser
    try {
      const client = await clerkClient()
      clerkUser = await client.users.getUser(userId)
    } catch (clerkError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use upsert to handle both new and existing users
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        phone,
        bio,
        linkedinUrl,
        profilePictureUrl,
        education,
        university,
        degree,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        major,
        cvUrl,
        cvParsed,
        skills,
        interests,
        lookingFor,
        preferredFields,
        availabilityType,
        preferredDuration,
        remotePreference,
        profileComplete: true,
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.emailAddresses[0]?.emailAddress || '',
        phone,
        bio,
        linkedinUrl,
        profilePictureUrl,
        education,
        university,
        degree,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        major,
        cvUrl,
        cvParsed,
        skills,
        interests,
        lookingFor,
        preferredFields,
        availabilityType,
        preferredDuration,
        remotePreference,
        profileComplete: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}
