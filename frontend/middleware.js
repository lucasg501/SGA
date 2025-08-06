import { NextResponse } from 'next/server';

export function middleware(request) {
  const cookieAuth = request.cookies.get('cookieAuth');

  // Verifica se o cookie existe e tem o valor esperado (ex: token123)
  if (!cookieAuth || cookieAuth.value !== 'token123') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Se o cookie é válido, continua normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Protege rotas que começam com /admin/
};
