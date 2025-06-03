import { db } from '@/lib/db'
import { cache } from 'react'

export const getExams = cache(async (userId, userRole) => {
    const now = new Date() // Using provided current time

    const baseQuery = {
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            students: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            quizzes: {
                include: {
                    submissions: {
                        where: userRole === 'STUDENT' ? {
                            studentId: userId
                        } : undefined,
                        select: {
                            id: true,
                            studentId: true,
                            score: true,
                            isCorrect: true,
                            createdAt: true
                        }
                    }
                }
            }
        },
        orderBy: [
            {
                // status: 'asc'
            },
            {
                startDate: 'asc'
            }
        ]
    }

    if (userRole === 'EDUCATOR') {
        return db.exam.findMany({
            ...baseQuery,
            where: {
                creatorId: userId
            }
        })
    }

    // For students
    return db.exam.findMany({
        ...baseQuery,
        where: {
            students: {
                some: {
                    id: userId
                }
            }
        }
    })
}, { next: {tags : ['exam']}})

export const processExamForDisplay = (
    exam,
    userId,
    currentTime = new Date('2025-03-02T09:30:24Z')
) => {
    const hasStarted = currentTime >= new Date(exam.startDate)
    const hasEnded = currentTime >= new Date(exam.endDate)

    // Calculate student's progress
    const studentSubmissions = exam.quizzes.flatMap(quiz =>
        quiz.submissions.filter(sub => sub.studentId === userId)
    )

    const totalQuizzes = exam.quizzes.length
    const submittedQuizzes = studentSubmissions.length
    const gradedSubmissions = studentSubmissions.filter(sub => sub.score !== null)

    const averageScore = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / gradedSubmissions.length
        : null

    return {
        ...exam,
        progress: {
            totalQuizzes,
            submittedQuizzes,
            completionRate: (submittedQuizzes / totalQuizzes) * 100,
            averageScore,
            isPassing: averageScore !== null ? averageScore >= exam.minScore : null
        },
        timing: {
            hasStarted,
            hasEnded,
            status: !hasStarted ? 'upcoming' : hasEnded ? 'ended' : 'active'
        }
    }
}

export const getCurrentUserExams = cache(async (userId, userRole) => {
    const exams = await getExams(userId, userRole)
    const currentTime = new Date('2025-03-02T09:30:24Z')

    return exams.map(exam => processExamForDisplay(exam, userId, currentTime))
})

export const getExamById = cache(async (examId, userId, userRole) => {
    const now = new Date()

    const exam = await db.exam.findFirst({
        where: {
            id: examId,
            creatorId: userRole === 'EDUCATOR' ? userId : undefined
            /*AND: [
                {
                    OR: [
                        { creatorId: userRole === 'EDUCATOR' ? userId : undefined },
                        {
                            students: {
                                some: {
                                    id: userRole === 'STUDENT' ? userId : undefined
                                }
                            }
                        }
                    ]
                },
                userRole === 'STUDENT'
                    ? {
                        startDate: {
                            lte: now
                        }
                    }
                    : {}
            ]*/
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            students: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            examSubmissions: {
                select: {
                    id: true,
                    studentId: true,
                    status: true,
                    score: true,
                    feedback: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            quizzes: {
                orderBy: {
                    id: 'asc'
                },
                include: {
                    submissions: {
                        where: {
                            studentId: userRole === 'STUDENT' ? userId : undefined
                        },
                        select: {
                            id: true,
                            studentId: true,
                            score: true,
                            isCorrect: true,
                            feedback: true,
                            aiNote: true,
                            answer: true,
                            status: true,
                            createdAt: true,
                            updatedAt: true
                        },
                        orderBy: {
                            updatedAt: 'desc'
                        },
                        take: 1 // Gunakan take: 1 sebagai pengganti slice
                    }
                }
            }
        }
    })

    if (!exam) {
        return null
    }

    // Process exam data
    const processedExam = {
        ...exam,
        quizzes: exam.quizzes.map(quiz => ({
            ...quiz,
            // Tidak perlu slice karena sudah menggunakan take: 1
            submissions: quiz.submissions || []
        })),
        progress: calculateExamProgress(exam, userId),
        timing: getExamTiming(exam, now)
    }

    return processedExam
}, { 
    tags: ['examId', 'exam-submission']
})


// Helper function to calculate exam progress
const calculateExamProgress = (exam, userId) => {
    const totalQuizzes = exam.quizzes.length
    const submittedQuizzes = exam.quizzes.filter(quiz =>
        quiz.submissions.some(sub => sub.studentId === userId)
    ).length

    const submissions = exam.quizzes.flatMap(quiz =>
        quiz.submissions.filter(sub => sub.studentId === userId)
    )

    const gradedSubmissions = submissions.filter(sub => sub.score !== null)

    const averageScore = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / gradedSubmissions.length
        : null

    return {
        totalQuizzes,
        submittedQuizzes,
        completionRate: (submittedQuizzes / totalQuizzes) * 100,
        averageScore,
        isPassing: averageScore !== null ? averageScore >= exam.minScore : null,
        gradedCount: gradedSubmissions.length
    }
}

// Helper function to determine exam timing status
const getExamTiming = (exam, currentTime) => {
    const startDate = new Date(exam.startDate)
    const endDate = new Date(exam.endDate)

    const hasStarted = currentTime >= startDate
    const hasEnded = currentTime >= endDate

    return {
        hasStarted,
        hasEnded,
        status: !hasStarted ? 'upcoming' : hasEnded ? 'ended' : 'active',
        timeRemaining: hasEnded ? 0 : endDate.getTime() - currentTime.getTime(),
        startDate,
        endDate
    }
}

export async function getStudentQuizSubmissionsByExam(examId, studentId) {
    // 1. Ambil semua quizId dari exam
    const exam = await db.exam.findUnique({
        where: { id: Number(examId) },
        include: { quizzes: { select: { id: true } } }
    });
    if (!exam) return [];

    const quizIds = exam.quizzes.map(q => q.id);

    // 2. Ambil semua QuizSubmission untuk studentId dan quizId tsb
    return db.quizSubmission.findMany({
        where: {
            quizId: { in: quizIds },
            studentId: Number(studentId)
        },
        orderBy: { createdAt: 'desc' }
    });
}