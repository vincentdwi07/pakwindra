import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'
import {evaluateCode} from "@/lib/ai/code-evaluator";

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

        const { answer, quizId, examId, aiNote, isCorrect } = body
        if (!answer || !quizId || !examId || !aiNote || !isCorrect) {
            return NextResponse.json({ 
                error: 'Missing required fields',
                received: { answer, quizId, examId, aiNote, isCorrect }
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

            // evaluating the code
            const question = `Dengan penggalan program berikut:
a = [3, 1, 5, 3, 8, 1, 0]
b = [3, 1, 5, 3, 8, 2, 0]
Uji apakah kedua array memiliki elemen yang sama. Jika sama, tampilkan sama, jika ada 1 saja yang tidak sama, tampilkan tidak sama.`;
            const generatedResponse = await evaluateCode(answer, question);
            console.log(generatedResponse)

            let submission;
            if (existingSubmission) {
                submission = await db.quizSubmission.update({
                    where: { id: existingSubmission.id },
                    data: {
                        answer: answer,
                        status: 'GRADED',
                        isCorrect: isCorrect,
                        // aiVerdict: null,
                        aiNote: aiNote,
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
                        status: 'GRADED',
                        isCorrect: isCorrect,
                        // aiVerdict: null,
                        aiNote: aiNote,
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
            // console.error('Database error:', dbError);
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

// ...existing code...

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');
        const studentId = searchParams.get('studentId');

        if (!examId || !studentId) {
            return NextResponse.json({ 
                error: 'Missing examId or studentId' 
            }, { status: 400 });
        }

        // 1. Ambil semua quiz dari exam
        const exam = await db.exam.findUnique({
            where: { id: Number(examId) },
            include: { quizzes: true }
        });

        if (!exam) {
            return NextResponse.json({ 
                error: 'Exam not found' 
            }, { status: 404 });
        }

        // 2. Ambil submissions untuk quiz-quiz tersebut
        const submissions = await db.quizSubmission.findMany({
            where: {
                quizId: { in: exam.quizzes.map(q => q.id) },
                studentId: Number(studentId)
            }
        });

        // 3. Gabungkan data quiz dan submission
        const result = exam.quizzes.map(quiz => {
            const submission = submissions.find(sub => sub.quizId === quiz.id);
            return {
                quizId: quiz.id,
                instruksi: quiz.instruksi,
                status: submission?.status || 'OPEN',
                code: submission?.answer || '',
                aiFeedback: submission?.aiNote || '',
                isCorrect: submission?.isCorrect || false,
                language: quiz.language || 'python'
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ 
            error: 'Server error',
            details: error.message 
        }, { status: 500 });
    }
}