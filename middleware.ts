import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ルームページへのアクセス時にプレイヤー名が必要
  if (request.nextUrl.pathname.startsWith('/room/')) {
    const playerName = request.nextUrl.searchParams.get('player');
    if (!playerName) {
      return NextResponse.redirect(new URL('/join-room', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/room/:path*',
};