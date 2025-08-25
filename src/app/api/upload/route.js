import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('type'); // 'profile' or 'cv'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'internship-uploads',
          public_id: fileType === 'profile' ? `profile_${userId}_${Date.now()}` : `cv_${userId}_${Date.now()}`,
          access_mode: 'public', // Make files publicly accessible
          secure: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // If it's a profile picture, update Clerk user profile
    if (fileType === 'profile') {
      try {
        // Get current user info
        const currentUser = await clerkClient.users.getUser(userId);
        
        // For users with Google/OAuth, try to clear the profile image first
        if (currentUser.externalAccounts?.length > 0) {
          try {
            await clerkClient.users.updateUser(userId, {
              profileImageUrl: ""
            });
            
            // Wait a moment before setting new image
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (clearError) {
            // Continue if clearing fails
          }
        }
        
        // Update the profile image
        await clerkClient.users.updateUser(userId, {
          profileImageUrl: result.secure_url
        });
        
      } catch (clerkError) {
        // Silently handle Clerk update error
      }
    }

    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id,
      type: fileType 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Cloudinary upload endpoint ready" });
}
