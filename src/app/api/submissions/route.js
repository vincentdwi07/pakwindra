import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }

        let body;
        try {
            body = await request.json()
        } catch (error) {
            console.error('Failed to parse request body:', error);
            return NextResponse.json({ 
                error: 'Invalid request format' 
            }, { status: 400 })
        }

        console.log('Received data:', body);

        const { answer, quizId, examId } = body
        if (!answer || !quizId || !examId) {
            return NextResponse.json({ 
                error: 'Missing required fields',
                received: { answer, quizId, examId }
            }, { status: 400 })
        }

        try {
            const existingSubmission = await db.quizSubmission.findFirst({
                where: {
                    quizId: parseInt(quizId),
                    studentId: user.id
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })

            let submission;
            if (existingSubmission) {
                submission = await db.quizSubmission.update({
                    where: { id: existingSubmission.id },
                    data: {
                        answer: answer,
                        status: 'GRADING',
                        isCorrect: null,
                        aiVerdict: null,
                        aiNote: null,
                        feedback: null,
                        score: null,
                        updatedAt: new Date()
                    }
                })
            } else {
                submission = await db.quizSubmission.create({
                    data: {
                        answer: answer,
                        studentId: user.id,
                        quizId: parseInt(quizId),
                        status: 'GRADING',
                        isCorrect: null,
                        aiVerdict: null,
                        aiNote: null,
                        feedback: null,
                        score: null
                    }
                })
            }

            // Revalidate cache
            revalidateTag('exam-submission')
            revalidatePath(`/exam/${examId}`)

            console.log('Submission saved:', submission);

            return NextResponse.json({
                message: 'Submission successful',
                submission: submission
            }, { status: 200 })

        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ 
                error: 'Database operation failed',
                details: dbError.message
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ 
            error: 'Server error',
            details: error.message
        }, { status: 500 })
    }
}