import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT_SECRET environment variable kontrolü
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is missing!');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export async function middleware(request: NextRequest) {
  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sayfasına erişim için token kontrolü yapma
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // JWT_SECRET kontrolü
    if (!jwtSecret) {
      console.error('JWT_SECRET missing, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Token kontrolü
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token geçersiz - login'e yönlendir
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      return response;
    }
  }

  // Security headers for all pages
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP header - daha kısıtlayıcı
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "frame-src https://www.google.com; " +
    "connect-src 'self' https:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  return response;
}

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
} 