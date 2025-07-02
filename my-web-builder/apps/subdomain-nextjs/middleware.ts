import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  console.log('Middleware - hostname:', hostname);
  
  // 포트 제거 후 서브도메인 추출 (예: 2ews41.localhost:3001 -> 2ews41)
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');
  
  if (parts.length > 1) {
    const subdomain = parts[0];
    console.log('Middleware - subdomain:', subdomain);
    
    // localhost가 아닌 서브도메인인 경우
    if (subdomain !== 'localhost' && subdomain !== 'www') {
      console.log('Middleware - rewriting to:', `/${subdomain}`);
      return NextResponse.rewrite(new URL(`/${subdomain}`, request.url));
    }
  }
  
  return NextResponse.next();
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