import { PrismaClient } from '@prisma/client'
import { createEducator, createStudent } from './factories/userFactory'
import { createExam } from './factories/examFactory'
import { createQuiz } from './factories/quizFactory'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
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
                return prisma.exam.create({
                    data: {
                        ...createExam(educator.id),
                        students: {
                            connect: students
                                .slice(0, faker.number.int({ min: 3, max: 8 }))
                                .map(student => ({ id: student.id }))
                        }
                    }
                })
            })
        )

        // Create quizzes for each exam
        for (const exam of exams) {
            await Promise.all(
                Array(5).fill(null).map(async () => {
                    return prisma.quiz.create({
                        data: {
                            ...createQuiz(exam.id),
                            submissions: {
                                connect: students
                                    .slice(0, faker.number.int({ min: 2, max: 6 }))
                                    .map(student => ({ id: student.id }))
                            }
                        }
                    })
                })
            )
        }
    }

    console.log('🌱 Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })