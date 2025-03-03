import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import path from 'path'
import { writeFile } from 'fs/promises'

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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file')
        const quizId = parseInt(formData.get('quizId'))
        const examId = parseInt(formData.get('examId'))
        const status = formData.get('status') || 'GRADING'

        if (!file || !quizId || !examId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const timeStamp = new Date().getTime();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const fileName = `${user.id}_${quizId}_${timeStamp}${extension}`

        const uploadPath = path.join(process.cwd(), 'public/quizSubmissions');
        const filePath = path.join(uploadPath, fileName);

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        await writeFile(filePath, buffer)

        const fileUrl = `/quizSubmissions/${fileName}`

        // const data = await response.json()

        // if (!response.ok) {
        //     throw new Error(data.error || 'Failed to submit')
        // }

        // First, check if submission exists
        const existingSubmission = await db.QuizSubmission.findFirst({
            where: {
                quizId: quizId,
                studentId: user.id
            }
        })

        let submission;
        
        if (existingSubmission) {
            // Update existing submission
            submission = await db.QuizSubmission.update({
                where: {
                    id: existingSubmission.id // Use the unique ID instead
                },
                data: {
                    fileUrl: fileUrl, // Replace with actual file upload URL
                    fileName: originalName,
                    updatedAt: new Date()
                }
            })
        } else {
            // Create new submission
            submission = await db.QuizSubmission.create({
                data: {
                    fileUrl: fileUrl, // Replace with actual file upload URL
                    fileName: originalName,
                    studentId: user.id,
                    quizId: quizId,
                }
            })
        }

        // Update quiz status
        await db.Quiz.update({
            where: {
                id: quizId
            },
            data: { 
                status: status,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ 
            message: 'Submission successful',
            submission 
        }, { status: 200 })

    } catch (error) {
        console.error('Submission error:', error)
        return NextResponse.json(
            { error: 'Failed to submit quiz: ' + error.message },
            { status: 500 }
        )
    }
}