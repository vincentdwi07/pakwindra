import { QuizStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'


export const createQuiz = (examId: number) => ({
    title: faker.lorem.sentence(),
    instruction: faker.lorem.paragraph(),
    question: faker.lorem.paragraphs(2),
    filename: faker.system.fileName(),
    status: faker.helpers.arrayElement([
        QuizStatus.OPEN,
        QuizStatus.GRADING,
        QuizStatus.GRADED
    ]),
    maxScore: faker.number.float({ min: 80, max: 100, fractionDigits: 1 }),
    examId,
})