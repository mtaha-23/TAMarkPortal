import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Protect dashboard route
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Note: In a real app, you'd check for a secure session token
    // This is a simplified version for demonstration
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
