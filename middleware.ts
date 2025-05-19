import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkUserAuthentication, checkUserAdmin } from '@/lib/api-request-utils';
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  // Ignorer les fichiers statiques, les ressources Next.js, les API, /login et /login/azure-callback
  if (
    pathname.startsWith('/_next/') || // Ressources Next.js (CSS, JS, etc.)
    pathname.startsWith('/static/') || // Ton dossier public/static
    pathname.startsWith('/api/') || // Tes endpoints API
    pathname.startsWith('/login') || // La page de connexion
    pathname.startsWith('/jobs') || // La page de connexion
    pathname.startsWith('/login/azure-callback') || // Le callback Azure 
    pathname.startsWith('/register') || // Le callback Azure 
    pathname.startsWith('/candidate-callback') || // Le callback de candidat
    pathname.startsWith('/candidate') || // La page candidate
    pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.gif') || pathname.endsWith('.svg') || pathname.endsWith('.css') || pathname.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    console.log('No access token found, redirecting to /login');
    const currentPath = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?redirectUrl=${currentPath}`, request.url));
  }

  const isAuthenticated = await checkUserAuthentication(accessToken);
  if (!isAuthenticated) {
    console.log('User is not authenticated, redirecting to /login');
    const currentPath = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?redirectUrl=${currentPath}`, request.url));
  }

  if (pathname.startsWith('/admin')) {
    const isAdmin = await checkUserAdmin(accessToken);
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// 🔥 Configuration du matcher pour exclure certaines routes
export const config = {
  matcher: '/((?!_next|static|api|login|login/azure-callback|candidate-callback|candidate).*)',
};