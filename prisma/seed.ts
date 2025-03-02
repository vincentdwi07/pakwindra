import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import {createEducator, createStudent} from "./factories/userFactory";
import {createExam} from "./factories/examFactory";
import {createQuiz} from "./factories/quizFactory";
import {createQuizSubmission} from "./factories/quizSubmissionFactory";

const prisma = new PrismaClient()

async function main() {
    // Set a fixed seed for reproducible data
    //faker.seed(42)

    // Create educators
    const educators = await Promise.all(
        Array(3).fill(null).map(async () => {
            return prisma.user.create({
                data: await createEducator()
            })
        })
    )

    // Create students
    const students = await Promise.all(
        Array(10).fill(null).map(async () => {
            return prisma.user.create({
                data: await createStudent()
            })
        })
    )

    // Create exams for each educator
    for (const educator of educators) {
        const exams = await Promise.all(
            Array(3).fill(null).map(async () => {
                // Get random number of students for this exam
                const numStudents = faker.number.int({ min: 3, max: 8 })
                const examStudents = faker.helpers.arrayElements(students, numStudents)

                return prisma.exam.create({
                    data: {
                        ...createExam(educator.id),
                        students: {
                            connect: examStudents.map(student => ({ id: student.id }))
                        }
                    }
                })
            })
        )

        // Create quizzes and submissions for each exam
        for (const exam of exams) {
            const quizzes = await Promise.all(
                Array(5).fill(null).map(async () => {
                    return prisma.quiz.create({
                        data: createQuiz(exam.id)
                    })
                })
            )

            // Get enrolled students for this exam
            const enrolledStudents = await prisma.user.findMany({
                where: {
                    examsEnrolled: {
                        some: {
                            id: exam.id
                        }
                    }
                }
            })

            // Create submissions for each quiz
            for (const quiz of quizzes) {
                // Randomly select some enrolled students to submit
                const submittingStudents = faker.helpers.arrayElements(
                    enrolledStudents,
                    faker.number.int({
                        min: Math.min(2, enrolledStudents.length),
                        max: enrolledStudents.length
                    })
                )

                await Promise.all(
                    submittingStudents.map(student =>
                        prisma.quizSubmission.create({
                            data: createQuizSubmission(student.id, quiz.id)
                        })
                    )
                )
            }
        }
    }

    // Print summary
    const summary = await getSeedingSummary()
    console.log('🌱 Seeding completed!')
    console.log('Summary:')
    console.log(`- Educators created: ${summary.educatorCount}`)
    console.log(`- Students created: ${summary.studentCount}`)
    console.log(`- Exams created: ${summary.examCount}`)
    console.log(`- Quizzes created: ${summary.quizCount}`)
    console.log(`- Submissions created: ${summary.submissionCount}`)
}

async function getSeedingSummary() {
    const [
        educatorCount,
        studentCount,
        examCount,
        quizCount,
        submissionCount
    ] = await Promise.all([
        prisma.user.count({ where: { role: 'EDUCATOR' } }),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.exam.count(),
        prisma.quiz.count(),
        prisma.quizSubmission.count()
    ])

    return {
        educatorCount,
        studentCount,
        examCount,
        quizCount,
        submissionCount
    }
}

main()
    .catch(e => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

