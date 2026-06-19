import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('hirebox_token')?.value
  const { pathname } = request.nextUrl

  // Check if we are heading to dashboard layouts
  const isDashboardRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/jobs') || 
    pathname.startsWith('/candidates') || 
    pathname.startsWith('/interviews') || 
    pathname.startsWith('/reports') || 
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings')

  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already authenticated users from login back to dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/jobs/:path*',
    '/candidates/:path*',
    '/interviews/:path*',
    '/reports/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/login'
  ],
}
