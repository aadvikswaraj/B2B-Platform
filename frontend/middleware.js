import { NextResponse } from 'next/server'

// List of paths that don't require seller layout/authentication
const PUBLIC_PATHS = [
  '/seller/login',
  '/seller/registration',
  '/seller/forgot-password'
]

export function middleware(request) {
  // Check if the current path is in the public paths list
  const isPublicPath = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    // For public paths, we want to bypass the seller layout
    // We can do this by setting a header that our layout.js will check
    const response = NextResponse.next()
    response.headers.set('x-bypass-layout', '1')
    return response
  }

  // For all other seller routes, proceed with normal layout
  return NextResponse.next()
}

export const config = {
  matcher: '/seller/:path*'
}