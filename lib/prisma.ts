import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// In Prisma 7, configuration is often loaded from prisma.config.ts automatically by the CLI.
// However, for the runtime client, if 'url' is removed from schema, we might need to pass it here
// OR rely on environment variables if using standard behavior. 
// Given the error message about "pass either 'adapter' ... or 'accelerateUrl'", 
// let's try to pass the URL via datasources for now, or assume it's set via ENV if not managed by new config loader at runtime.
// If using SQLite file, we can specify it explicitly.

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: "file:./dev.db", // Ensuring runtime connection knows the DB location
            },
        },
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
