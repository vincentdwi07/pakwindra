import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const quizId = searchParams.get('quizId')

        if (!quizId) {
            return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const submission = await db.quizSubmission.findFirst({
            where: {
                quizId: parseInt(quizId),
                studentId: user.id
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
        }

        if (submission.status !== 'GRADING') {
            revalidateTag('exam-submission')
        }

        return NextResponse.json({
            status: submission.status,
            // isCorrect: submission.isCorrect,
            feedback: submission.feedback,
            aiNote: submission.aiNote,
            score: submission.score
        })

    } catch (error) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}