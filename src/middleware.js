import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/onboarding',
  '/auth-redirect',
  '/api/webhooks/clerk(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  // If user is authenticated and visits root, redirect to auth-redirect for proper role-based routing
  if (userId && url.pathname === '/') {
    url.pathname = '/auth-redirect';
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and tries to access private routes, redirect to root
  // where they can use the Clerk modal to sign in
  if (!isPublicRoute(req) && !userId) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};