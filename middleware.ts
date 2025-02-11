import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { NextRequestWithAuth } from "next-auth/middleware"

// Define paths that require specific roles
const educatorRoutes = ["/educator", "/create-exam", "/manage-exams"]
const studentRoutes = ["/student", "/my-exams", "/take-exam"]
const authRoutes = ["/login", "/register"]

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  const path = req.nextUrl.pathname

  // Check if the path is an auth route (login/register)
  if (authRoutes.includes(path)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    let callbackUrl = req.nextUrl.pathname
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, req.url)
    )
  }

  // Role-based access control
  if (educatorRoutes.some(route => path.startsWith(route))) {
    if (token.role !== "EDUCATOR") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  if (studentRoutes.some(route => path.startsWith(route))) {
    if (token.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}