import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    //prisma: typeof client;
    prisma: PrismaClient;
};

export const db =
    globalForPrisma.prisma ||
    //client
    new PrismaClient({
        //log: ['query'],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;