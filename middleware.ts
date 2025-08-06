import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// TODO: Replace this with actual session validation logic
// This function should check if the session cookie sent by the browser
// corresponds to a valid, active session on the PHP backend.
// This might involve making an API call to a PHP endpoint like `check_session.php`.
async function validateSession(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('PHPSESSID'); // Adjust cookie name if different

  if (!sessionCookie) {
    console.log('Middleware: No session cookie found.');
    return false;
  }

  // --- Placeholder Logic ---
  // In a real app, you'd verify the session ID with your PHP backend.
  // For this example, we'll assume any PHPSESSID cookie means logged in.
  // Replace this with a fetch call to your backend validator.
  console.log('Middleware: Found session cookie:', sessionCookie.value, 'Assuming valid for now.');
  // Example fetch (replace with your actual endpoint):
  // try {
  //   const response = await fetch('http://your-php-backend.com/api/check_session.php', {
  //     headers: {
  //       'Cookie': `PHPSESSID=${sessionCookie.value}`
  //     }
  //   });
  //   if (response.ok) {
  //      const data = await response.json();
  //      return data.is_valid === true;
  //   }
  //   return false;
  // } catch (error) {
  //   console.error("Session validation error:", error);
  //   return false;
  // }
  return true; // Assume valid for placeholder
  // --- End Placeholder Logic ---
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = await validateSession(request);

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/quiz') || pathname.startsWith('/review') || pathname.startsWith('/profile');

  // If logged in and trying to access login/register, redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
    console.log('Middleware: Logged in, redirecting from auth route to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not logged in and trying to access a protected app route, redirect to login
  if (!isLoggedIn && isAppRoute) {
     console.log('Middleware: Not logged in, redirecting from app route to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

   // If accessing the root path
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
     * - api (API routes) - assuming your PHP backend handles API, not Next.js /api
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - placeholder-user.jpg (example image)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|placeholder-user.jpg).*)',
  ],
};
