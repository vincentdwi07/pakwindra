import 'newrelic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'
import { evaluateCode } from "@/lib/ai/code-evaluator"
import { promises as fs } from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import {extractPDFText} from "@/lib/utils/pdfReader";
import {extractPDFTextFromUrl} from "@/lib/utils/pdfReader";

export async function POST(request) {
    
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

        if (user.role === 'EDUCATOR') {
            console.log('User role is educator, denied quiz submission!')
            return NextResponse.json({ error: 'Educator cannot submit exam, so user must be student only' }, { status: 401 })
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
            // get quiz data
            const quizData = await db.quiz.findFirst({
                where: {
                    quiz_id: parseInt(quizId)
                }
            });
            if (!quizData) {
                return NextResponse.json({
                    error: 'Quiz not found',
                    details: `Quiz with id ${quizId} not found.`
                }, { status: 404 })
            }

            /*const quizzesPath = process.env.QUIZZES_PATH
            const relativeFilePath = quizData.filePath; // e.g., '/instructionFiles/1750494325690-Example-questions-text-only4.pdf'
            const absoluteFilePath = path.join(process.cwd(), quizzesPath, relativeFilePath);
            console.log(absoluteFilePath)
            const pdfBuffer = await fs.readFile(absoluteFilePath);
            const data = await pdfParse(pdfBuffer);
            const questionText = data.text;

            console.log("Pdf read : " + questionText);*/

            // Section PDF Read
            // Extract PDF text using the utility function
            // Section PDF Read + Instruction Fallback
            let questionText = ''

            try {
                const hasPDF = quizData?.filePath && typeof quizData.fileUrl === 'string'
                const hasInstruction = typeof quizData?.instruction === 'string' && quizData.instruction.trim().length > 0

                let pdfText = ''
                let instructionText = ''

                // Coba ekstrak PDF
                if (hasPDF) {
                    try {
                        console.log('Extracting PDF content for quiz:', quizId)
                        pdfText = await extractPDFTextFromUrl(quizData.fileUrl)
                        console.log('PDF extraction successful. Text length:', pdfText.length)
                    } catch (pdfError) {
                        console.error('PDF extraction failed:', pdfError)
                    }
                }

                // Ambil instruction jika ada
                if (hasInstruction) {
                    instructionText = quizData.instruction.trim()
                }

                // Gabungkan keduanya jika ada
                questionText = [pdfText?.trim(), instructionText].filter(Boolean).join('\n\nInstruction:\n')

                // Jika tetap kosong, kirim error
                if (!questionText || questionText.trim().length === 0) {
                    return NextResponse.json({
                        error: 'No quiz content found',
                        details: 'Neither PDF content nor instruction was found'
                    }, { status: 500 })
                }

            } catch (error) {
                console.error('Failed to get quiz content:', error)
                return NextResponse.json({
                    error: 'Failed to read quiz content',
                    details: error.message
                }, { status: 500 })
            }


            // Validate that we have question content
            if (!questionText || questionText.trim().length === 0) {
                return NextResponse.json({
                    error: 'No quiz content found',
                    details: 'Unable to extract question text from the quiz file'
                }, { status: 500 })
            }
            // End Section PDF Read


            // get submission
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
                        updatedAt: new Date(),
                        submission_count: (existingSubmission.submission_count || 1) + 1
                    }
                });
                console.log('Updated submission ID:', submission.quiz_submission_id);
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
                        score: null,
                        submission_count: 1
                    }
                });
                console.log('Created submission ID:', submission.quiz_submission_id);
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
            // Use Promise to handle background processing
            Promise.resolve().then(async () => {
                try {
                    const { aiResponse, isCorrect, score } = await evaluateCode(answer, questionText, quizData.rubrik, quizData.language)
                    
                    await db.quizSubmission.update({
                        where: { 
                            quiz_submission_id: submission.quiz_submission_id 
                        },
                        data: {
                            status: 'GRADED',
                            aiNote: aiResponse,
                            isCorrect: isCorrect,
                            score: score,
                            updatedAt: new Date()
                        }
                    })

                    const examInfo = await db.exam.findUnique({
                        where: { exam_id: examId },
                        select: {
                            endDate: true,
                            quizzes: { select: { quiz_id: true } }
                        }
                    });
                    const examQuizIds = examInfo.quizzes.map(q => q.quiz_id);

                    const allQuizSubmissions = await db.quizSubmission.findMany({
                        where: {
                            quizId: { in: examQuizIds },
                            studentId: user.user_id
                        }
                    });
                    const allGraded = allQuizSubmissions.length === examQuizIds.length &&
                        allQuizSubmissions.every(q => q.status === "GRADED");
                    const now = new Date();
                    const isDue = now >= new Date(examInfo.endDate);

                    if ((allGraded || isDue) && allQuizSubmissions.length > 0) {
                        // Hitung score
                        const totalScore = allQuizSubmissions.reduce((sum, q) => sum + (q.score || 0), 0);
                        const score = totalScore / examQuizIds.length;


                        // Update examSubmission
                        await db.examSubmission.updateMany({
                            where: {
                                examId: examId,
                                studentId: user.user_id
                            },
                            data: {
                                status: allGraded ? "GRADED" : undefined,
                                score: score
                            }
                        });
                    }

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
                updatedAt: submission?.updatedAt || null,
                submission_count: submission?.submission_count || 0 // <-- tambahkan ini
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