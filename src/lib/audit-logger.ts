import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "CREATE_PROJECT"
  | "UPDATE_PROJECT"
  | "DELETE_PROJECT"
  | "APPROVE_PROJECT"
  | "DECLINE_PROJECT"
  | "CREATE_APPOINTMENT"
  | "UPDATE_APPOINTMENT"
  | "DELETE_APPOINTMENT"
  | "CANCEL_APPOINTMENT"
  | "COMPLETE_APPOINTMENT"
  | "CREATE_COMPANY"
  | "UPDATE_COMPANY"
  | "DELETE_COMPANY"
  | "SEND_MESSAGE"
  | "DELETE_MESSAGE"
  | "CREATE_KANBAN_TASK"
  | "UPDATE_KANBAN_TASK"
  | "DELETE_KANBAN_TASK"
  | "SYSTEM_ERROR";

export type AuditEntityType =
  | "USER"
  | "PROJECT"
  | "APPOINTMENT"
  | "COMPANY"
  | "MESSAGE"
  | "KANBAN_TASK"
  | "SYSTEM";

interface AuditLogOptions {
  userId?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Log an audit entry to the database
 */
export async function logAudit(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        details: options.details ? (options.details as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        success: options.success ?? true,
        errorMessage: options.errorMessage,
      },
    });
  } catch (error) {
    // Don't throw errors from audit logging to prevent breaking the main flow
    console.error("[AuditLogger] Failed to log audit entry:", error);
  }
}

/**
 * Extract IP address and user agent from request headers
 */
export function getRequestInfo(headers: Headers): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? "unknown";
  const userAgent = headers.get("user-agent") ?? "unknown";

  return { ipAddress, userAgent };
}
