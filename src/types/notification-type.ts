/**
 * Notification type enum
 * Corresponds to NotificationType in prisma/schema.prisma
 */

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  APPOINTMENT = "APPOINTMENT",
  MESSAGE = "MESSAGE",
  SYSTEM = "SYSTEM",
}

export type NotificationTypeString = keyof typeof NotificationType;
