import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // -------------------------------------------------------------------
  // FIX: Robust check for EITHER the custom OR any NextAuth cookie.
  // -------------------------------------------------------------------
  const isCustomSession = request.cookies.has('user-session');
  
  // Check if any cookie name contains 'session-token', which is guaranteed to exist
  // for any active NextAuth session (Google or Credentials) regardless of the prefix.
  const isNextAuthSession = Array.from(request.cookies.keys()).some(name => 
    name.includes('session-token')
  );

  const isLoggedIn = isCustomSession || isNextAuthSession;
  // -------------------------------------------------------------------

  // Define public-only routes (Auth + Home)
  const isPublicOnlyRoute = pathname === '/' || 
                            pathname.startsWith('/login') || 
                            pathname.startsWith('/register') ||
                            pathname.startsWith('/forgot-password') || 
                            pathname.startsWith('/reset-password');
  
  // Define protected application routes
  const isAppRoute = pathname.startsWith('/dashboard') || 
                     pathname.startsWith('/quiz') || 
                     pathname.startsWith('/review') || 
                     pathname.startsWith('/profile');

  // Rule 1: Logged In -> Redirect away from Public/Auth routes to Dashboard
  if (isLoggedIn && isPublicOnlyRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Rule 2: Not Logged In -> Redirect away from Protected/Root routes to Login
  if (!isLoggedIn && (isAppRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow all other requests (e.g., /about, /faq) to proceed.
  return NextResponse.next();
}

// Define the paths middleware should run on (unchanged)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|placeholder-user.jpg).*)',
  ],
};