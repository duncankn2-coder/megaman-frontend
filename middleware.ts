import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Detect site context:
  // If host contains hk.megaman.cc or hk.localhost, or matches an environment override
  const isHk = host.includes('hk.megaman.cc') || host.startsWith('hk.');
  const siteContext = isHk ? 'hk' : 'international';

  // Clone headers and set custom site header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-context', siteContext);

  // We return NextResponse.next with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets and api routes
    '/((?!_next/static|_next/image|favicon.ico|api|images|assets).*)',
  ],
};
