import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const withPoolerCompatibility = (databaseUrl?: string) => {
  if (!databaseUrl) return undefined

  try {
    const url = new URL(databaseUrl)
    const isSupabaseHost = url.hostname.includes('supabase')
    const isPoolerPort = url.port === '6543'

    if ((isSupabaseHost || isPoolerPort) && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }

    return url.toString()
  } catch {
    return databaseUrl
  }
}

const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: withPoolerCompatibility(process.env.DATABASE_URL),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
