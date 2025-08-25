import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for the user session cookie
  const sessionCookie = request.cookies.get('user-session');
  const isLoggedIn = !!sessionCookie;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/quiz') || pathname.startsWith('/review') || pathname.startsWith('/profile');

  // If logged in and trying to access login/register, redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
    console.log('Middleware: User is logged in. Redirecting from auth route to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not logged in and trying to access a protected app route, redirect to login
  if (!isLoggedIn && isAppRoute) {
     console.log('Middleware: User is not logged in. Redirecting from app route to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

   // If accessing the root path, redirect based on login status
   if (pathname === '/') {
       if (isLoggedIn) {
         console.log('Middleware: Accessing root, logged in, redirecting to /dashboard');
         return NextResponse.redirect(new URL('/dashboard', request.url));
       } else {
          console.log('Middleware: Accessing root, not logged in, redirecting to /login');
         return NextResponse.redirect(new URL('/login', request.url));
       }
   }

  // Allow the request to proceed if none of the above conditions are met
  return NextResponse.next();
}

// Define the paths middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - placeholder-user.jpg (example image)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|placeholder-user.jpg).*)',
  ],
};