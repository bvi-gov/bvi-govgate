import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client for PostgreSQL (Supabase).
 * Works on Vercel serverless — no native addons needed.
 */
function createDb() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

  globalForPrisma.prisma = client
  return client
}

export const db = createDb()
