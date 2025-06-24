import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request, { params }) {
    const { quiz_submission_id } = params
    const { feedback } = await request.json()

    if (!feedback || !quiz_submission_id) {
        return NextResponse.json({ error: 'Missing feedback or quiz_submission_id' }, { status: 400 })
    }

    try {
        await db.quizSubmission.update({
            where: { quiz_submission_id: Number(quiz_submission_id) },
            data: { feedback }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}