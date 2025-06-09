'use server'

import db from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ExamStatus } from "@prisma/client"

export async function getExams() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return { error: "Unauthorized" }
        }

        const currentDate = new Date()

        const exams = await db.exam.findMany({
            /*where: {
                // If student, show enrolled exams
                ...(session.user.role === 'STUDENT' ? {
                    students: {
                        some: {
                            id: parseInt(session.user.id)
                        }
                    }
                } : {}),
                // If educator, show exams they created
                ...(session.user.role === 'EDUCATOR' ? {
                    creatorId: parseInt(session.user.id)
                } : {})
            },*/
            include: {
                creator: {
                    select: {
                        name: true
                    }
                },
                quizzes: {
                    select: {
                        // status: true,
                        submissions: {
                            where: {
                                studentId: parseInt(session.user.id)
                            }
                        }
                    }
                }
            },
            orderBy: {
                endDate: 'asc'
            }
        })

        return {
            exams: exams.map(exam => {
                // Calculate status based on dates and quiz submissions
                // let status = exam.status
                const isExpired = new Date(exam.endDate) < currentDate
                const isNotStarted = new Date(exam.startDate) > currentDate

                // For students, calculate their progress
                let studentProgress = null
                if (session.user.role === 'STUDENT') {
                    const totalQuizzes = exam.quizzes.length
                    const submittedQuizzes = exam.quizzes.filter(quiz =>
                        quiz.submissions.length > 0
                    ).length
                    studentProgress = `${submittedQuizzes}/${totalQuizzes} submitted`
                }

                return {
                    key: exam.exam_id,
                    title: exam.title,
                    description: exam.description || '',
                    // status: exam.status,
                    start_date: exam.startDate.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    end_date: exam.endDate.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    min_score: exam.minScore,
                    creator_name: exam.creator.name,
                    is_expired: isExpired,
                    is_not_started: isNotStarted,
                    progress: studentProgress,
                    quiz_count: exam.quizzes.length,
                    score: exam.quizzes.length / exam.quizzes.length * 100
                }
            })
        }
    } catch (error) {
        console.error('Error fetching exams:', error)
        return { error: "Failed to fetch exams" }
    }
}