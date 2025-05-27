// api/submissions/ai-feedback/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
// import { callOllama } from '@/lib/ollama' // Metode lama
import { generateAIFeedback } from '@/lib/ollama-langchain' // Metode baru dengan LangChain

export async function POST(request) {
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
            // OPSI 1: Menggunakan LangChain (Rekomendasi)
            const evaluation = await generateAIFeedback(instruction, answer);
            
            // OPSI 2: Tetap menggunakan Ollama langsung
            // const aiFeedbackRaw = await callOllama(prompt)
            // ... parsing manual seperti sebelumnya ...

            // Update submission dengan feedback dan status
            const updatedSubmission = await db.quizSubmission.update({
                where: { id: submissionId },
                data: { 
                    aiNote: evaluation.feedback,
                    isCorrect: evaluation.isCorrect,
                    status: 'GRADED'
                }
            })

            return NextResponse.json({
                message: 'AI feedback generated successfully',
                aiNote: evaluation.feedback,
                isCorrect: evaluation.isCorrect,
                status: 'GRADED'
            })

        } catch (aiError) {
            console.error('AI Processing error:', aiError)
            return NextResponse.json({ 
                error: 'Failed to generate AI feedback',
                details: aiError.message 
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ 
            error: 'Server error' 
        }, { status: 500 })
    }
}