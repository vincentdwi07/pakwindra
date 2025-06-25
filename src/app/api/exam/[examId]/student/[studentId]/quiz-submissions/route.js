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
                user_id: parseInt(studentId)
            },
            select: {
                user_id: true,
                name: true,
                email: true
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
                exam_id: parseInt(examId)
            },
            include: {
                quizzes: {
                    orderBy: {
                        quiz_id: 'asc'
                    },
                    select: {
                        quiz_id: true,
                        instruction: true,
                        filePath: true,
                        submission_limit: true
                    }
                }
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
                    in: examWithQuizzes.quizzes.map(q => q.quiz_id)
                },
                studentId: parseInt(studentId)
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Log submissions
        console.log('Found submissions:', submissions)

        // Combine data
        const quizzes = examWithQuizzes.quizzes.map(quiz => {
            const submission = submissions.find(sub => sub.quizId === quiz.quiz_id)
            return {
                quiz_id: quiz.quiz_id,
                instruction: quiz.instruction || '',
                filePath: quiz.filePath,
                submission_limit: quiz.submission_limit,
                submission: submission ? {
                    quiz_submission_id: submission.quiz_submission_id,
                    status: submission.status,
                    answer: submission.answer || '',
                    feedback: submission.feedback,
                    aiNote: submission.aiNote,
                    score: submission.score,
                    isCorrect: submission.isCorrect,
                    createdAt: submission.createdAt,
                    updatedAt: submission.updatedAt
                } : null
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