import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // This is a simple middleware to handle client-side redirects
  // A more robust authentication solution would be needed for a production app
  
  // Skip middleware for API routes and static files
  if (request.nextUrl.pathname.startsWith('/api') || 
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Let the login page pass through
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // For server-side protection, but real auth would be needed
  // Note: This is just a placeholder as actual auth checks will be done client-side
  // since we're using localStorage in this simple app
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};