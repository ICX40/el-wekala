import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We check for tokens in cookies. These will be set during the Login process.
  const session = request.cookies.get('session')?.value;
  const userRole = request.cookies.get('userRole')?.value; // "Admin", "Seller", "Customer", etc.

  // 1. Protect Auth Routes (Login, Register, Forgot Password)
  const authRoutes = ['/login', '/register', '/forgot-password'];
  if (authRoutes.includes(pathname)) {
    if (session) {
      // If user is already logged in, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'Admin') {
      // If logged in but not Admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Protect Seller Routes
  if (pathname.startsWith('/seller')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow both Sellers and Admins to access seller dashboard
    if (userRole !== 'Seller' && userRole !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Protect Customer/Account Routes
  const protectedCustomerRoutes = ['/account', '/checkout'];
  const isProtectedCustomerRoute = protectedCustomerRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedCustomerRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Specify the paths where this middleware should run
export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ],
};