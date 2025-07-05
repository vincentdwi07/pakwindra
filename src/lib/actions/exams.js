import { db } from '@/lib/db'
import { cache } from 'react'

export const getExams = cache(async (userId, userRole) => {
    const now = new Date()

    const baseQuery = {
        include: {
            creator: {
                select: {
                    user_id: true,
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
                            quiz_submission_id: true,
                            studentId: true,
                            score: true,
                            isCorrect: true,
                            createdAt: true 
                        }
                    }
                }
            }, 
            examSubmissions: {
                where: userRole === 'STUDENT' ? {
                    studentId: userId
                } : undefined,
                select: {
                    exam_submission_id: true,
                    studentId: true,
                    status: true,
                    score: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    }

    if (userRole === 'EDUCATOR') {
        return db.exam.findMany({
            ...baseQuery,
            where: {
                creatorId: userId
            }
        })
    }

    const exams = await db.exam.findMany(baseQuery)
    
    return exams.map(exam => {
        const studentExamSubmission = exam.examSubmissions?.find(sub => sub.studentId === userId) || null;
        return {
            ...exam,
            timing: getExamTiming(exam, now, studentExamSubmission)
        }
    })
})

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
    console.log('getExamById params:', { examId, userId, userRole });
    const now = new Date()

    const exam = await db.exam.findFirst({
        where: {
            exam_id: examId,
            // creatorId: userRole === 'EDUCATOR' ? userId : undefined
            ...(userRole === 'EDUCATOR' ? { creatorId: userId } : {})
        },
        include: {
            creator: {
                select: {
                    user_id: true,
                    name: true,
                    email: true
                }
            },
            examSubmissions: {
                select: {
                    exam_submission_id: true,
                    studentId: true,
                    status: true,
                    score: true,
                    createdAt: true,
                    updatedAt: true,
                    student: {  
                        select: {
                            user_id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            quizzes: {
                orderBy: {
                    quiz_id: 'asc'
                },
                include: {
                    submissions: {
                        where: {
                            studentId: userRole === 'STUDENT' ? userId : undefined
                        },
                        select: {
                            quiz_submission_id: true,
                            studentId: true,
                            score: true,
                            isCorrect: true,
                            feedback: true,
                            aiNote: true,
                            answer: true,
                            status: true,
                            createdAt: true,
                            updatedAt: true,
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
    console.log('Raw exam data:', exam);
    if (!exam) {
        console.log('No exam found with criteria:', {
            exam_id: examId,
            creatorId: userRole === 'EDUCATOR' ? userId : 'not checked'
        });
        return null;
    }

    // Process exam data
    const studentExamSubmission = exam.examSubmissions.find(sub => sub.studentId === userId) || null;
    const processedExam = {
        ...exam,
        students: exam.examSubmissions.map(submission => submission.student),
        quizzes: exam.quizzes.map(quiz => ({
            ...quiz,
            submissions: quiz.submissions || []
        })),
        examSubmission: exam.examSubmissions.find(sub => sub.studentId === userId) || null,
        // progress: calculateExamProgress(exam, userId),
        timing: getExamTiming(exam, now, studentExamSubmission)
    }

    return processedExam
}, { 
    tags: ['examId', 'exam-submission']
})


// Helper function to calculate exam progress
// const calculateExamProgress = (exam, userId) => {
//     const totalQuizzes = exam.quizzes.length
//     const submittedQuizzes = exam.quizzes.filter(quiz =>
//         quiz.submissions.some(sub => sub.studentId === userId)
//     ).length

//     const submissions = exam.quizzes.flatMap(quiz =>
//         quiz.submissions.filter(sub => sub.studentId === userId)
//     )

//     const gradedSubmissions = submissions.filter(sub => sub.score !== null)

//     const averageScore = gradedSubmissions.length > 0
//         ? gradedSubmissions.reduce((acc, sub) => acc + (sub.score || 0), 0) / gradedSubmissions.length
//         : null

//     return {
//         totalQuizzes,
//         submittedQuizzes,
//         completionRate: (submittedQuizzes / totalQuizzes) * 100,
//         averageScore,
//         isPassing: averageScore !== null ? averageScore >= exam.minScore : null,
//         gradedCount: gradedSubmissions.length
//     }
// }

// Helper function to determine exam timing status
const getExamTiming = (exam, currentTime, examSubmission) => {
    const startDate = new Date(exam.startDate)
    const endDate = new Date(exam.endDate)

    const hasStarted = currentTime >= startDate
    const hasEnded = currentTime >= endDate

    let status = !hasStarted ? 'upcoming' : hasEnded ? 'ended' : 'active'

    if (
        hasEnded &&
        examSubmission &&
        (examSubmission.status === 'OPEN' || examSubmission.status === 'GRADING')
    ) {
        status = 'ended'
    }

    return {
        hasStarted,
        hasEnded,
        status,
        timeRemaining: hasEnded ? 0 : endDate.getTime() - currentTime.getTime(),
        startDate,
        endDate
    }
}

export async function getStudentQuizSubmissionsByExam(examId, studentId) {
    // 1. Ambil semua quizId dari exam
    const exam = await db.exam.findUnique({
        where: { exam_id: Number(examId) },
        include: { quizzes: { select: { quiz_id: true } } }
    });
    if (!exam) return [];

    const quizIds = exam.quizzes.map(q => q.quiz_id);

    // 2. Ambil semua QuizSubmission untuk studentId dan quizId tsb
    return db.quizSubmission.findMany({
        where: {
            quizId: { in: quizIds },
            studentId: Number(studentId)
        },
        orderBy: { createdAt: 'desc' }
    });
}