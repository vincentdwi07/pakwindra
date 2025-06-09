import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'
import { evaluateCode } from "@/lib/ai/code-evaluator"

export async function POST(request) {
    console.log('API Route: POST /api/submissions called')
    
    try {
        // Authentication checks
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            console.log('No session found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: { user_id: true, role: true }
        })

        if (!user) {
            console.log('User not found in database')
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }

        // Parse request body
        let body
        try {
            const rawText = await request.text()
            console.log('Raw request body:', rawText)
            body = JSON.parse(rawText)
            console.log('Parsed body:', body)
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError)
            return NextResponse.json({ 
                error: 'Invalid request body',
                details: 'Request body must be valid JSON'
            }, { status: 400 })
        }

        if (!body) {
            return NextResponse.json({ 
                error: 'Empty request body'
            }, { status: 400 })
        }

        const { answer, quizId, examId } = body
        
        if (!answer || !quizId || !examId) {
            return NextResponse.json({ 
                error: 'Missing required fields',
                details: 'answer, quizId, and examId are required'
            }, { status: 400 })
        }

        // Database operations
        try {
            const existingSubmission = await db.quizSubmission.findFirst({
                where: {
                    AND: [
                        { quizId: parseInt(quizId) },
                        { studentId: user.user_id }
                    ]
                }
            });

            let submission;
            
            if (existingSubmission) {
                submission = await db.quizSubmission.update({
                    where: {
                        quiz_submission_id: existingSubmission.quiz_submission_id
                    },
                    data: {
                        answer: answer,
                        status: 'GRADING',
                        isCorrect: false,
                        aiNote: 'AI evaluation in progress...',
                        feedback: null,
                        score: null,
                        updatedAt: new Date()
                    }
                });
            } else {
                submission = await db.quizSubmission.create({
                    data: {
                        answer: answer,
                        studentId: user.user_id,
                        quizId: parseInt(quizId),
                        status: 'GRADING',
                        isCorrect: false,
                        aiNote: 'AI evaluation in progress...',
                        feedback: null,
                        score: null
                    }
                });
            }

            // Return immediate response
            const response = NextResponse.json({
                success: true,
                message: 'Submission saved, evaluation in progress',
                submission: {
                    id: submission.quiz_submission_id,
                    status: 'GRADING'
                }
            })

            // Start background AI evaluation
            const question = `Dengan penggalan program berikut:
                a = [3, 1, 5, 3, 8, 1, 0]
                b = [3, 1, 5, 3, 8, 2, 0]
                Uji apakah kedua array memiliki elemen yang sama. Jika sama, tampilkan sama, jika ada 1 saja yang tidak sama, tampilkan tidak sama.`

            // Use Promise to handle background processing
            Promise.resolve().then(async () => {
                try {
                    const aiResponse = await evaluateCode(answer, question)
                    
                    await db.quizSubmission.update({
                        where: { 
                            quiz_submission_id: submission.quiz_submission_id 
                        },
                        data: {
                            status: 'GRADED',
                            aiNote: aiResponse,
                            isCorrect: true,
                            updatedAt: new Date()
                        }
                    })

                    revalidateTag(`exam-${examId}`)
                    revalidateTag('exam-submission')
                    revalidatePath(`/exam/${examId}`)
                    
                } catch (aiError) {
                    console.error('AI evaluation failed:', aiError)
                    await db.quizSubmission.update({
                        where: { 
                            quiz_submission_id: submission.quiz_submission_id 
                        },
                        data: {
                            status: 'GRADED',
                            aiNote: 'AI evaluation failed, please try again later',
                            isCorrect: false,
                            updatedAt: new Date()
                        }
                    })
                }
            }).catch(console.error)

            return response

        } catch (dbError) {
            console.error('Database operation failed:', dbError)
            return NextResponse.json({ 
                error: 'Database operation failed',
                details: dbError.message
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500 })
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const examId = searchParams.get('examId')
        const studentId = searchParams.get('studentId')

        if (!examId || !studentId) {
            return NextResponse.json({ 
                error: 'Missing examId or studentId'
            }, { status: 400 })
        }

        const examIdNum = Number(examId)
        const studentIdNum = Number(studentId)
        
        if (isNaN(examIdNum) || isNaN(studentIdNum)) {
            return NextResponse.json({ 
                error: 'Invalid ID format'
            }, { status: 400 })
        }

        const exam = await db.exam.findUnique({
            where: { exam_id: examIdNum },
            include: { 
                quizzes: {
                    orderBy: { quiz_id: 'asc' }
                }
            }
        })

        if (!exam) {
            return NextResponse.json({ 
                error: 'Exam not found'
            }, { status: 404 })
        }

        const submissions = await db.quizSubmission.findMany({
            where: {
                quizId: { in: exam.quizzes.map(q => q.quiz_id) },
                studentId: studentIdNum
            },
            orderBy: { updatedAt: 'desc' }
        })

        const result = exam.quizzes.map(quiz => {
            const submission = submissions.find(sub => sub.quizId === quiz.quiz_id)
            return {
                quiz_id: quiz.quiz_id,
                instruction: quiz.instruction,
                status: submission?.status || 'OPEN',
                submitted_code: submission?.answer || '',
                ai_note: submission?.aiNote || '',
                educator_note: submission?.feedback || '',
                is_correct: submission?.isCorrect || false,
                score: submission?.score || null,
                submission_id: submission?.quiz_submission_id || null,
                createdAt: submission?.createdAt || null,
                updatedAt: submission?.updatedAt || null
            }
        })

        return NextResponse.json({
            exam_id: exam.exam_id,
            title: exam.title,
            quizzes: result
        })

    } catch (error) {
        console.error('GET request error:', error)
        return NextResponse.json({ 
            error: 'Server error'
        }, { status: 500 })
    }
}