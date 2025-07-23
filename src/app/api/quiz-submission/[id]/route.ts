import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// app/api/quiz-submission/[id]/route.ts
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const quizSubmissionId = parseInt(params.id);
    const body = await req.json();
    const score = body.score;

    if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    // 1. Update nilai quizSubmission
    const updated = await db.quizSubmission.update({
        where: { quiz_submission_id: quizSubmissionId },
        data: { score },
        include: {
            quiz: {
                select: { examId: true },
            },
        }
    });

    const examId = updated.quiz.examId;

    const studentId = updated.studentId;

    // 2. Ambil semua quizSubmission untuk exam ini
    const allQuiz = await db.quiz.findMany({
        where: { examId },
        select: { quiz_id: true },
    });

    const allQuizIds = allQuiz.map(q => q.quiz_id);

    const allQuizSubmissions = await db.quizSubmission.findMany({
        where: {
            quizId: { in: allQuizIds },
            studentId: studentId
        }
    });

    // 3. Hitung ulang nilai rata-rata
    const total = allQuizSubmissions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = total / allQuiz.length;

    // 4. Update ke examSubmission
    await db.examSubmission.updateMany({
        where: {
            examId,
            studentId
        },
        data: {
            score: averageScore
        }
    });

    return NextResponse.json({ success: true });
}

