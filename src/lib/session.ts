import { cookies } from 'next/headers'
import db from '@/lib/db'
import { nanoid } from 'nanoid'
import {signOut} from "next-auth/react";

export async function createSession(userId: number, userAgent?: string, ipAddress?: string) {
    const token = nanoid(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    const session = await db.session.create({
        data: {
            userId,
            token,
            expires,
            userAgent,
            ipAddress,
        },
    })

    const cookieStore = await  cookies();

    cookieStore.set({
        name: 'session_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires,
    })

    return session
}

export async function getSession() {
    const cookieStore = await  cookies();
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
        return null
    }

    const session = await db.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
    })

    if (!session) {
        return null
    }

    // Check if session has expired
    if (new Date() > session.expires) {
        await deleteSession(sessionToken)
        return null
    }

    // Update last activity
    await db.session.update({
        where: { token: sessionToken },
        data: { lastActivity: new Date() },
    })

    return session
}

export async function deleteSession(token: string) {

    const cookieStore = await  cookies();
    await db.session.delete({
        where: { token },
    })

    cookieStore.set({
        name: 'session_token',
        value: '',
        expires: new Date(0),
    })

    //signOut()
}

export async function deleteAllUserSessions(userId: number) {
    await db.session.deleteMany({
        where: { userId },
    })
}