import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';

  // any path on shubhamrajpal.flipfolios.com → permanent redirect
  if (host === 'shubhamrajpal.flipfolios.com') {
    return NextResponse.redirect(
      new URL(
        '/folio/shubham_rajpal_portfolio_showcase-njaeze',
        'https://flipfolios.com',
      ),
      301,                     // permanent
    );
  }

  return NextResponse.next();
}

/* run on every route (you can limit to ['/', '/(.*)'] if preferred) */
export const config = { matcher: '/:path*' };
