import { ExamStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

export const createExam = (creatorId: number) => {
    const startDate = faker.date.future()
    return {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement([
            ExamStatus.OPEN,
            ExamStatus.GRADING,
            ExamStatus.GRADED
        ]),
        startDate,
        endDate: faker.date.between({
            from: startDate,
            to: faker.date.future({ years: 1, refDate: startDate })
        }),
        minScore: faker.number.float({ min: 60, max: 90 }),
        creatorId,
    }
}