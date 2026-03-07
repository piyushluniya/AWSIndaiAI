import { NextRequest, NextResponse } from "next/server"

const protectedPaths = ["/dashboard", "/cards", "/policies", "/chat", "/onboarding", "/profile"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  // Fast cookie check: Amplify stores Cognito tokens in cookies with this prefix
  // This avoids a round-trip to AWS Cognito on every request
  const cookies = request.cookies
  const hasAuthToken = [...cookies.getAll()].some(
    (c) =>
      c.name.includes("CognitoIdentityServiceProvider") &&
      (c.name.endsWith(".accessToken") || c.name.endsWith(".idToken"))
  )

  if (hasAuthToken) return NextResponse.next()

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cards/:path*",
    "/policies/:path*",
    "/chat/:path*",
    "/onboarding/:path*",
    "/profile/:path*"
  ]
}
