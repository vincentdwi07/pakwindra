import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Super detailed logging
    console.log('🔍 MIDDLEWARE EXECUTION:', {
        timestamp: new Date().toISOString(),
        currentURL: request.url,
        pathname: request.nextUrl.pathname,
        token: {
            exists: !!token,
            role: token?.role,
            fullToken: token // log full token for debugging
        },
        headers: {
            cookie: request.headers.get('cookie'),
            authorization: request.headers.get('authorization')
        }
    })

    const path = request.nextUrl.pathname

    if (token && (path === '/auth/login' || path === '/auth/register')) {
        const redirectURL = token.role === 'EDUCATOR' 
            ? '/mentor/dashboard' 
            : '/'

        console.log('🚀 REDIRECT ATTEMPT:', {
            from: path,
            to: redirectURL,
            role: token.role,
            tokenInfo: token
        })

        // Construct absolute URL for redirect
        const baseURL = request.nextUrl.origin
        const fullRedirectURL = new URL(redirectURL, baseURL)

        console.log('📍 Redirecting to:', fullRedirectURL.toString())

        return NextResponse.redirect(fullRedirectURL)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/auth/login',
        '/auth/register',
        '/mentor/dashboard/:path*'
    ]
}