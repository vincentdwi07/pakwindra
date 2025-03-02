'use server'

import db from '@/lib/db'  // Update this path according to your db file location
import { LoginInput } from '@/lib/validation/auth'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import {createSession, deleteAllUserSessions, deleteSession} from '@/lib/session'

export async function login(data: LoginInput) {
    try {
        const user = await db.user.findUnique({
            where: {
                email: data.email,
            },
        })

        if (!user) {
            return { error: 'Invalid credentials' }
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password)

        if (!isPasswordValid) {
            return { error: 'Invalid credentials' }
        }

        // Delete any existing sessions for this user
        await deleteAllUserSessions(user.id)

        // Get client information
        const headersList = await headers()
        const userAgent = headersList.get('user-agent')
        const ip = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            '127.0.0.1'

        // Create new session
        await createSession(
            user.id,
            userAgent ?? undefined,
            ip ?? undefined
        )

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'An error occurred during login' }
    }
}

export async function logout() {
    try {
        const headersList = await headers()
        const sessionToken = headersList.get('cookie')?.match(/session_token=([^;]+)/)?.[1]

        if (sessionToken) {
            await deleteSession(sessionToken)
        }return { success: true }


    } catch (error) {
        console.error('Logout error:', error)
        return { error: 'An error occurred during logout' }
    }
}