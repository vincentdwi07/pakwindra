import { Role } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'

export const createUser = async () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: await bcrypt.hash('Admin123', 10),
    role: faker.helpers.arrayElement([Role.EDUCATOR, Role.STUDENT]),
})

export const createEducator = async () => ({
    ...(await createUser()),
    role: Role.EDUCATOR,
})

export const createStudent = async () => ({
    ...(await createUser()),
    role: Role.STUDENT,
})