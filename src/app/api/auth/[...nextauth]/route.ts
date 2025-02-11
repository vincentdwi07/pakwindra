import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import db from "@/lib/db"

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "EDUCATOR" | "STUDENT"
      }
      return session
    }
  },
  events: {
    async signOut({ token }) {
      // You can perform cleanup here if needed
      // For example, update last activity timestamp
      try {
        await db.user.update({
          where: { id: parseInt(token.id as string) },
          data: { lastLoginAt: new Date() }
        })
      } catch (error) {
        console.error('Error updating user on signout:', error)
      }
    }
  }
})

export { handler as GET, handler as POST }