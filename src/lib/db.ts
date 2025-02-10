import { PrismaClient } from "@prisma/client";
//import { currentUser } from "@client-extension/lib/extensions/current-user";

//const client = new PrismaClient().$extends(currentUser());

const globalForPrisma = global as unknown as {
    //prisma: typeof client;
    prisma: PrismaClient;
};

export const db =
    globalForPrisma.prisma ||
    //client
    new PrismaClient({
        log: ['query'],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;