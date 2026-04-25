import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
  '/api/stripe(.*)',
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
    '/api/stripe/:path*',
    '/api/watchlist',
    '/api/watchlist/:path*',
    '/api/webhooks/:path*',
    '/signin/:path*',
    '/sign-up/:path*',
  ],
};
