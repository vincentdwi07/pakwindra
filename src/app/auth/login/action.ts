'use server'

import db from '@/lib/db'
import { LoginInput } from '@/lib/validation/auth'
import bcrypt from 'bcryptjs'
import { signIn } from 'next-auth/react'
import { headers } from 'next/headers'
import {createSession, deleteAllUserSessions, deleteSession} from '@/lib/session'

export async function login(data: LoginInput) {
    try {
        // Validate user exists
        const user = await db.user.findUnique({
            where: {
                email: data.email,
            },
            select: {
                user_id: true,
                email: true,
                name: true,
                password: true,
                role: true
            }
        })

        if (!user) {
            return { error: 'Invalid credentials' }
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(data.password, user.password)

        if (!isPasswordValid) {
            return { error: 'Invalid credentials' }
        }

        // Use NextAuth signIn
        const result = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        if (result?.error) {
            return { error: result.error }
        }

        // Return success with user data
        return {
            success: true,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
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