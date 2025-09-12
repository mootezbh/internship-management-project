import { createUploadthing } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

export const fileRouter = {
  profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // You can update Clerk profile here if needed
      return { url: file.url, userId: metadata.userId };
    }),
  
  taskImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.url, userId: metadata.userId };
    }),
    
  taskPdf: f({ pdf: { maxFileSize: '16MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.url, userId: metadata.userId };
    }),
    
  taskFile: f({ 
    blob: { maxFileSize: '16MB', maxFileCount: 1 },
    'application/pdf': { maxFileSize: '16MB', maxFileCount: 1 },
    'text/plain': { maxFileSize: '2MB', maxFileCount: 1 },
    'application/json': { maxFileSize: '2MB', maxFileCount: 1 }
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.url, userId: metadata.userId };
    }),
    
  generalFile: f({ blob: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new Error('Unauthorized');
      return { userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return { url: file.url, userId: metadata.userId };
    }),
};

// Type export removed for JS compatibility
