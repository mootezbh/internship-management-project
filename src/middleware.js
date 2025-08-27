import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/onboarding',
  '/auth-redirect',
  '/api/webhooks/clerk(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl.clone();

  // Only redirect to /auth-redirect after login/signup, not on every visit to /
  if (userId && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect private routes
  if (!isPublicRoute(req) && !userId) {
    url.pathname = '/sign-in';
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