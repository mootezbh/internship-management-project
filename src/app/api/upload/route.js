
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { utapi } from 'uploadthing/server';

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
    // Uploadthing expects a File object, so we pass it directly
    const uploadResponse = await utapi.uploadFiles([file]);
    const uploadedFile = uploadResponse[0];
    if (!uploadedFile || !uploadedFile.url) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
    // If it's a profile picture, update Clerk user profile
    if (fileType === 'profile') {
      try {
        await clerkClient.users.updateUser(userId, {
          profileImageUrl: uploadedFile.url
        });
      } catch (clerkError) {
        // Silently handle Clerk update error
      }
    }
    return NextResponse.json({ 
      url: uploadedFile.url,
      key: uploadedFile.key,
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
  return NextResponse.json({ message: "Uploadthing upload endpoint ready" });
}
