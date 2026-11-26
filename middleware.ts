import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const searchParams = request.nextUrl.searchParams;
  const siteQuery = searchParams.get('site');
  const siteCookie = request.cookies.get('x-site-context')?.value;
  
  const cleanHost = host.split(':')[0].toLowerCase();

  // Detect site context:
  // Priority: 1. URL search param ?site= (useful for testing/dev)
  //           2. Host domain (megaman.cc, hk.megaman.cc, uk.megaman.cc, megamanuk.com)
  //           3. Cookie override
  let siteContext: 'hk' | 'uk' | 'international' = 'international';

  if (siteQuery === 'hk' || siteQuery === 'uk' || siteQuery === 'international') {
    siteContext = siteQuery;
  } else if (
    cleanHost.includes('megamanuk.com') ||
    cleanHost === 'uk.megaman.cc' ||
    cleanHost.startsWith('uk.')
  ) {
    siteContext = 'uk';
  } else if (
    cleanHost === 'hk.megaman.cc' ||
    cleanHost.startsWith('hk.')
  ) {
    siteContext = 'hk';
  } else if (
    cleanHost === 'megaman.cc' ||
    cleanHost === 'www.megaman.cc'
  ) {
    siteContext = 'international';
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
