import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const withPgbouncerParam = (databaseUrl?: string) => {
  if (!databaseUrl) return undefined

  const shouldDisablePgbouncer = process.env.PRISMA_DISABLE_PGBOUNCER === 'true'
  if (shouldDisablePgbouncer) return databaseUrl

  try {
    const url = new URL(databaseUrl)

    if ((url.protocol === 'postgres:' || url.protocol === 'postgresql:') && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }

    return url.toString()
  } catch {
    return databaseUrl
  }
}

const createPrismaClient = () => {
  const databaseUrl = withPgbouncerParam(process.env.DATABASE_URL)

  const config: Prisma.PrismaClientOptions = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }

  if (databaseUrl) {
    config.datasources = {
      db: {
        url: databaseUrl,
      },
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[prisma] DATABASE_URL is not set. Prisma will use the default datasource configuration.')
  }

  return new PrismaClient(config)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
