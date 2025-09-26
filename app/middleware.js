import { NextResponse } from 'next/server';

const protectedRoutes = ['/home', '/profile'];
const authRoutes = ['/login', '/signup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Simple token check - in production, you might want to verify the token
  const token = request.cookies.get('expense_tracker_access_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with token, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
