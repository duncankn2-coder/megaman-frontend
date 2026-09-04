import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const searchParams = request.nextUrl.searchParams;
  const siteQuery = searchParams.get('site');
  const siteCookie = request.cookies.get('x-site-context')?.value;
  
  // Detect site context:
  // Priority: 1. URL search param ?site= (useful for testing/dev)
  //           2. Host domain (megamanuk.com, uk.megaman.cc, hk.megaman.cc)
  //           3. Cookie override
  let siteContext: 'hk' | 'uk' | 'international' = 'international';

  if (siteQuery === 'hk' || siteQuery === 'uk' || siteQuery === 'international') {
    siteContext = siteQuery;
  } else if (
    host.includes('megamanuk.com') ||
    host.includes('uk.megaman.cc') ||
    host.startsWith('uk.')
  ) {
    siteContext = 'uk';
  } else if (
    host.includes('hk.megaman.cc') ||
    host.startsWith('hk.')
  ) {
    siteContext = 'hk';
  } else if (siteCookie === 'hk' || siteCookie === 'uk' || siteCookie === 'international') {
    siteContext = siteCookie;
  }

  // Clone headers and set custom site header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-context', siteContext);

  // We return NextResponse.next with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (siteQuery && (siteQuery === 'hk' || siteQuery === 'uk' || siteQuery === 'international')) {
    response.cookies.set('x-site-context', siteContext, { path: '/' });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets and api routes
    '/((?!_next/static|_next/image|favicon.ico|api|images|assets).*)',
  ],
};
