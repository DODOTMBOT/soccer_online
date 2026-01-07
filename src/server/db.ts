import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// --- ГЛОБАЛЬНЫЙ ПАТЧ ДЛЯ BIGINT ---
// Это нужно, чтобы JSON.stringify не ломался на полях типа BigInt (balance, price)
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;