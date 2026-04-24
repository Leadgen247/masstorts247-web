import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/api/user/:path*',
    '/signin/:path*',
    '/sign-up/:path*',
  ],
};
