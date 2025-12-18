import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
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

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// ============================================================================
// Realtime Broadcast Extension (Notification model only)
// Using Prisma Client Extensions API (Prisma 5+)
// ============================================================================
const extendedPrisma = basePrisma.$extends({
  name: "realtimeNotifications",
  query: {
    notification: {
      async create({ args, query }) {
        const result = await query(args);

        // Broadcast new notification (best-effort, non-blocking)
        if (result?.id && result?.userId) {
          import("./realtime")
            .then(({ publishNotificationNew }) => {
              return publishNotificationNew(result.userId!, {
                id: result.id!,
                title: result.title!,
                message: result.message!,
                type: result.type!,
                isRead: result.isRead ?? false,
                actionUrl: result.actionUrl,
                createdAt: result.createdAt as any,
              });
            })
            .catch(error => {
              console.error("[Prisma Extension] Failed to broadcast notification:new", error);
            });
        }

        return result;
      },

      async update({ args, query }) {
        const result = await query(args);

        // Broadcast update (best-effort, non-blocking)
        if (result?.id && result?.userId) {
          import("./realtime")
            .then(({ publishNotificationUpdate }) => {
              return publishNotificationUpdate(result.userId!, {
                id: result.id!,
                isRead: result.isRead,
                title: result.title,
                message: result.message,
                type: result.type,
                actionUrl: result.actionUrl,
              });
            })
            .catch(error => {
              console.error("[Prisma Extension] Failed to broadcast notification:update", error);
            });
        }

        return result;
      },

      async updateMany({ args, query }) {
        const result = await query(args);

        // For updateMany, we can't get individual results
        // We'd need to fetch affected records before update
        // For now, skip broadcast (mark-as-read in bulk doesn't need instant broadcast)

        return result;
      },
    },
  },
});

export const prisma = (globalForPrisma.prisma ??= extendedPrisma as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
