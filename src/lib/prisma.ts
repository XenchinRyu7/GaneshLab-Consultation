import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SSL configuration for Supabase with self-signed certificates
// Prisma 7 requires explicit SSL configuration for self-signed certs
// Modify connection string to disable SSL mode
const connectionString =
  process.env.POSTGRES_PRISMA_URL?.replace("sslmode=require", "sslmode=disable") ?? "";

const pool = new Pool({
  connectionString,
  ssl: false, // Completely disable SSL for development
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
