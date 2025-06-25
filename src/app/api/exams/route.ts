import { NextResponse } from 'next/server'
import { getExams } from '@/lib/actions/exams'
import { getServerSession } from 'next-auth'
import {authOptions} from "@/lib/auth";


export async function GET(request: Request) {
    try {
        // Ambil session user dari NextAuth
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = session.user.id
        const userRole = session.user.role

        const exams = await getExams(userId, userRole)

        return NextResponse.json({ exams })
    } catch (error) {
        console.error('Failed to fetch exams:', error)
        return NextResponse.json(
            { error: 'Failed to fetch exams' },
            { status: 500 }
        )
    }
}
