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

  /**
   * Verify tokens with backend /auth/me endpoint.
   * Returns the backend response so we can forward any Set-Cookie headers.
   */
  const verifyTokens = async (): Promise<Response | null> => {
    try {
      return await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include',
      });
    } catch {
      return null;
    }
  };

  /** Forward Set-Cookie headers from backend response to the outgoing Next.js response */
  const appendSetCookies = (backendRes: Response, nextRes: NextResponse) => {
    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextRes.headers.append('set-cookie', value);
      }
    });
  };

  // 1. Always allow /login (handled separately below)
  if (pathname === '/login') {
    if (hasTokens) {
      const backendRes = await verifyTokens();
      if (backendRes && backendRes.ok) {
        const homeUrl = new URL('/', request.url);
        const redirectResp = NextResponse.redirect(homeUrl);
        appendSetCookies(backendRes, redirectResp);
        return redirectResp;
      }
    }
    return NextResponse.next();
  }

  // 2. For every other route we require *valid* tokens.
  if (!hasTokens) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Validate with backend; if invalid → redirect
  const backendRes = await verifyTokens();
  if (!backendRes || !backendRes.ok) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Everything checks out → continue, forwarding any refreshed cookies
  const nextResp = NextResponse.next();
  appendSetCookies(backendRes, nextResp);
  return nextResp;
}

export const config = {
  matcher: [
    // Apply middleware to everything except Next.js internals and favicon
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ],
};
