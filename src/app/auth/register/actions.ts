'use server'

import db from '@/lib/db'
import { RegisterInput } from '@/lib/validation/auth'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { createSession } from '@/lib/session'

export async function register(data: RegisterInput) {
    try {
        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: {
                email: data.email,
            },
        })

        if (existingUser) {
            return { error: 'Email already registered' }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12)

        // Create user
        const user = await db.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
            },
        })

        // Get client information
        const headersList = await headers()
        const userAgent = headersList.get('user-agent')
        const ip = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            '127.0.0.1'

        // Create session
        await createSession(
            user.user_id,
            userAgent ?? undefined,
            ip ?? undefined
        )

        return {
            
            success: true,
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        }
    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'An error occurred during registration' }
    }
}