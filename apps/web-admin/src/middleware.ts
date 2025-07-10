import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets or internal routes that never require auth
  const isStaticRoute =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico';

  if (isStaticRoute) {
    return NextResponse.next();
  }

  // Check for authentication tokens
  const accessToken = request.cookies.get('Authentication');
  const refreshToken = request.cookies.get('Refresh');
  // Treat presence as simple boolean flags - either token type is sufficient
  const hasTokens = Boolean(accessToken) || Boolean(refreshToken);

  // Helper: verify tokens by asking backend. Uses minimal HEAD request for speed.
  const verifyTokens = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_USER_API_URL}/auth/me`,
        {
          method: 'GET',
          headers: {
            Cookie: request.headers.get('cookie') || '',
          },
          // A short timeout via AbortController could be added in prod.
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  };

  
console.log(await verifyTokens())
  // 1. Always allow /login (handled separately below)
  // Allow login page to render without additional checks
  if (pathname === '/login') {
    // If user already holds (valid) tokens, redirect them to home
    if (hasTokens && (await verifyTokens())) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 2. For every other route we require *valid* tokens.
  if (!hasTokens) {
    // no cookies at all → straight redirect
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Validate with backend; if invalid → redirect
  const valid = await verifyTokens();
  if (!valid) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Everything checks out → continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to everything except Next.js internals and favicon
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ],
};
