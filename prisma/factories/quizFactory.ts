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
    ai_note: faker.lorem.paragraph(),
    educator_not: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
    ai_is_correct: faker.datatype.boolean(),
    educator_is_correct: faker.helpers.maybe(() => faker.datatype.boolean(), { probability: 0.6 }),
    examId,
})