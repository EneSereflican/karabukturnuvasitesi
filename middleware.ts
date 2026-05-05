import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for login page
  if (pathname === '/admin/giris') {
    return NextResponse.next();
  }

  // Skip middleware for login API endpoint
  if (pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Check admin token for protected routes
  const token = request.cookies.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.redirect(new URL('/admin/giris', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
