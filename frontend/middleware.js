import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export async function middleware(request) {
  const cookieAuth = request.cookies.get('cookieAuth');

  if (!cookieAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(cookieAuth.value, SECRET_KEY);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
