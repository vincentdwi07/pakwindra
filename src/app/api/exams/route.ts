import { NextResponse } from 'next/server'
import { getExams, getActiveExams } from '@/lib/exam'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
    try {
        // In a real app, get these from your auth system
        const userId = 1 // example user ID
        const userRole = Role.STUDENT // or Role.EDUCATOR

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