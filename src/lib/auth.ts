import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import {NextAuthOptions} from "next-auth";
import { UAParser } from 'ua-parser-js'
import { db } from "./db";

import {compare} from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    throw new Error("User not found");
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                // Store user agent and IP in env for the signIn event
                process.env.UA_STRING = req.headers?.['user-agent']
                process.env.IP_ADDRESS = req.headers?.['x-forwarded-for']?.split(',')[0] ||
                  req.socket?.remoteAddress

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        //strategy: "database",
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
        //error: '/auth/error',
        verifyRequest: "/verify-request",
        signOut: '/logout',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token, user }) {
            if (session?.user) {
                session.user.id = user.id
                session.user.role = user.role
            }
            return session
        }
    },
    events: {
        async signIn({ user, account, isNewUser, profile }) {
            console.log("Signed in!", { user });// Update last activity and create session
            // Update last activity and create session
            const userAgent = process.env.UA_STRING
            const ip = process.env.IP_ADDRESS // You'll need to pass these from the request

            if (userAgent) {
                const ua = new UAParser(userAgent)
                const parsedUa = ua.getResult()

                await db.session.create({
                    data: {
                        userId: parseInt(user.id),
                        token: account?.access_token || '',
                        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        userAgent: `${parsedUa.browser.name} ${parsedUa.os.name}`,
                        ipAddress: ip,
                    },
                })
            }
        },

        async signOut({ session, token }) {
            console.log("Signed out!", { session });
            // Delete the session when user signs out
            if (session?.id) {
                await db.session.delete({
                    where: { id: session.id },
                })
            }
        },
        async createUser(message) {
            console.log("User created!", { message });
        }
    }
};
