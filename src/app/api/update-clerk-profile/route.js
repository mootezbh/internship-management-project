import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profilePictureUrl } = await request.json()

    if (!profilePictureUrl) {
      return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 })
    }

    // Update Clerk user's profile image
    const client = await clerkClient()
    await client.users.updateUser(userId, {
      publicMetadata: {
        customProfileImageUrl: profilePictureUrl
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating Clerk profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}
