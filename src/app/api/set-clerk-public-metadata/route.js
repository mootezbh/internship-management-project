import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

// Create Clerk client with explicit configuration
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request) {
  try {
    // Check environment variables
    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json({ error: 'Clerk not properly configured' }, { status: 500 });
    }

    // Check auth
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    // Set the custom image URL in public metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { customProfileImageUrl: imageUrl }
    });

    // Also try to directly update the profile image
    try {
      await clerkClient.users.updateUser(userId, {
        profileImageUrl: imageUrl
      });
    } catch (directError) {
      // Continue if direct update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      details: error.toString()
    }, { status: 500 });
  }
}
