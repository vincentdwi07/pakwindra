import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
    try {
        const { examId, studentId } = params

        // Log incoming request params
        console.log('API Request:', { examId, studentId })

        // Get student data
        const student = await db.user.findUnique({
            where: {
                id: parseInt(studentId)
            },
            select: {
                id: true,
                name: true
            }
        })

        // Log student data
        console.log('Found student:', student)

        if (!student) {
            return NextResponse.json({ 
                error: 'Student not found',
                params: { examId, studentId }
            }, { status: 404 })
        }

        // Get exam and quiz data
        const examWithQuizzes = await db.exam.findUnique({
            where: { 
                id: parseInt(examId)
            },
            include: {
                quizzes: true
            }
        })

        // Log exam data
        console.log('Found exam:', examWithQuizzes)

        if (!examWithQuizzes) {
            return NextResponse.json({ 
                error: 'Exam not found',
                params: { examId, studentId }
            }, { status: 404 })
        }

        // Get submissions
        const submissions = await db.quizSubmission.findMany({
            where: {
                quizId: { 
                    in: examWithQuizzes.quizzes.map(q => q.id)
                },
                studentId: parseInt(studentId)
            }
        })

        // Log submissions
        console.log('Found submissions:', submissions)

        // Combine data
        const quizzes = examWithQuizzes.quizzes.map(quiz => {
            const submission = submissions.find(sub => sub.quizId === quiz.id)
            return {
                quizId: quiz.id,
                instruction: quiz.instruction,
                maxScore: quiz.maxScore,
                language: quiz.language || 'python',
                submissionId: submission?.id,
                status: submission?.status || 'OPEN',
                answer: submission?.answer || '',
                feedback: submission?.feedback || null,
                aiNote: submission?.aiNote || null,
                isCorrect: submission?.isCorrect || false
            }
        })

        // Return response
        return NextResponse.json({
            student,
            quizzes
        }, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        })

    } catch (error) {
        // Log server error
        console.error('API Error:', {
            message: error.message,
            stack: error.stack,
            params: params
        })

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            params: params
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}