import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    // @ts-ignore - Prisma 7 requires passing the datasourceUrl if not in schema
    datasourceUrl: process.env.DATABASE_URL,
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
