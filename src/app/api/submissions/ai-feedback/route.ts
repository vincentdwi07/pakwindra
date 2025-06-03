// api/submissions/ai-feedback/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {evaluateCode} from "@/lib/ai/code-evaluator";

export async function POST(request: Request) {
    try {
        // Validasi session
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse request body
        const { instruction, answer, submissionId } = await request.json()

        if (!instruction || !answer || !submissionId) {
            return NextResponse.json({ 
                error: 'Missing required fields' 
            }, { status: 400 })
        }

        // Validate submission belongs to user
        const submission = await db.quizSubmission.findUnique({
            where: { id: submissionId },
            include: {
                student: true
            }
        })

        if (!submission || submission.student.email !== session.user.email) {
            return NextResponse.json({ 
                error: 'Submission not found or unauthorized' 
            }, { status: 404 })
        }

        try {
            // TODO: Change the question to be from the database instead
            const defaultQuestion = `Dengan penggalan program berikut:
a = [3, 1, 5, 3, 8, 1, 0]
b = [3, 1, 5, 3, 8, 2, 0]
Uji apakah kedua array memiliki elemen yang sama. Jika sama, tampilkan sama, jika ada 1 saja yang tidak sama, tampilkan tidak sama.`;

            // const evaluation = await generateAIFeedback(instruction, answer);
            const generatedResponse = await evaluateCode(answer, defaultQuestion);
            const {
                correctnessAnalysis,
                testCaseResults,
                errors,
                feedbackAndImprovements,
                overallJudgment
            } = generatedResponse;
            
            // OPSI 2: Tetap menggunakan Ollama langsung
            // const aiFeedbackRaw = await callOllama(prompt)
            // ... parsing manual seperti sebelumnya ...

            // Update submission dengan feedback dan status

            /*const updatedSubmission = await db.quizSubmission.update({
                where: { id: submissionId },
                data: { 
                    aiNote: evaluation.overall,
                    isCorrect: evaluation.isCorrect,
                    status: 'GRADED'
                }
            })

            return NextResponse.json({
                message: 'AI feedback generated successfully',
                aiNote: evaluation.feedback,
                isCorrect: evaluation.isCorrect,
                status: 'GRADED'
            })*/

        } catch (aiError) {
            console.error('AI Processing error:', aiError)
            return NextResponse.json({ 
                error: 'Failed to generate AI feedback',
                details: aiError
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ 
            error: 'Server error' 
        }, { status: 500 })
    }
}