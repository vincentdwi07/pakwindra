import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    const path = request.nextUrl.pathname

    // Auth routes - if logged in, redirect to dashboard
    if (token && (path === '/auth/login' || path === '/auth/register')) {
        const role = token.role as 'EDUCATOR' | 'STUDENT'
        return NextResponse.redirect(
            new URL(
                role === 'EDUCATOR' ? '/dashboard/educator' : '/dashboard/student',
                request.url
            )
        )
    }

    // Protected routes - if not logged in, redirect to login
    // if (!token && path.startsWith('/dashboard')) {
    //     const url = new URL('/auth/login', request.url)
    //     url.searchParams.set('callbackUrl', path)
    //     return NextResponse.redirect(url)
    // }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/auth/login',
        '/auth/register',
        '/dashboard/:path*'
    ]
}