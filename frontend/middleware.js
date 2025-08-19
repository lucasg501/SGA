// middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = process.env.JWT_SECRET; // use o MESMO nome do backend
if (!SECRET) {
  throw new Error('JWT_SECRET não definido no ambiente');
}
const SECRET_KEY = new TextEncoder().encode(SECRET);

export async function middleware(request: Request) {
  const cookieStore = (request as any).cookies ?? { get: () => null }; // compat
  // Em Next 13/14, você pode usar request.headers.get('cookie') e parsear, 
  // mas abaixo funciona bem com Next 14+ usando request.cookies.get:
  const auth = (request as any).cookies?.get?.('cookieAuth') ?? null;

  if (!auth) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(auth.value, SECRET_KEY); // exp também é verificada
    // (Opcional) Encaminhar o id/login adiante via cabeçalhos
    const requestHeaders = new Headers((request as any).headers);
    if (payload?.id) requestHeaders.set('x-user-id', String(payload.id));
    if (payload?.login) requestHeaders.set('x-user-login', String(payload.login));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
