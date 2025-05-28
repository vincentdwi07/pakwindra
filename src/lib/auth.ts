import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import db from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        password: true,
                        role: true,
                    }
                })

                if (!user) {
                    throw new Error("Invalid credentials")
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials")
                }

                // Log user data for debugging
                console.log('Authorized user:', {
                    id: user.id,
                    email: user.email,
                    role: user.role
                })

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role, // Make sure role is included here
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // Initial sign in
                token.id = user.id
                token.role = user.role
                token.email = user.email
                token.name = user.name

                // Log token creation
                console.log('JWT callback - new token:', {
                    id: token.id,
                    role: token.role,
                    email: token.email
                })
            }

            // For subsequent requests, token already has the data
            return token
        },
        async session({ session, token }) {
            // Add role and id to session
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.email = token.email
                session.user.name = token.name

                // Log session creation
                console.log('Session callback:', {
                    userId: session.user.id,
                    userRole: session.user.role,
                    userEmail: session.user.email
                })
            }

            return session
        }
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug messages in development
}

// Add TypeScript types for session
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            role: "EDUCATOR" | "STUDENT"
        }
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        role: "EDUCATOR" | "STUDENT"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "EDUCATOR" | "STUDENT"
    }
}