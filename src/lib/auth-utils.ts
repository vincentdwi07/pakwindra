import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export async function requireAuth(allowedRoles?: Array<'EDUCATOR' | 'STUDENT'>) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/login')
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        redirect(session.user.role === 'EDUCATOR' ? '/mentor/dashboard' : '/')
    }

    return session
}