import {createExam} from "./examFactory";
import {faker} from "@faker-js/faker";

export const createQuizSubmission = (studentId: number, quizId: number) => {
    const fileExtension = faker.helpers.arrayElement([
        '.py', '.js', '.java', '.cpp', '.txt'
    ])
    const fileName = `submission_${faker.string.alphanumeric(8)}${fileExtension}`

    return {
        fileUrl: `https://storage.example.com/submissions/${faker.string.uuid()}/${fileName}`,
        fileName,
        score: faker.helpers.maybe(() => faker.number.float({ min: 0, max: 100, fractionDigits: 1 })),
        feedback: faker.helpers.maybe(() => faker.lorem.paragraph()),
        isCorrect: faker.helpers.maybe(() => faker.datatype.boolean()),
        aiVerdict: faker.helpers.maybe(() => faker.datatype.boolean()),
        aiNote: faker.helpers.maybe(() => faker.lorem.paragraph()),
        studentId,
        quizId,
    }
}