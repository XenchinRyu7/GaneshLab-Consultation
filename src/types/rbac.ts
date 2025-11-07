export type UserRole = "admin" | "pm" | "client";

export type Permission =
  | "calendar.view"
  | "calendar.create"
  | "calendar.edit"
  | "calendar.delete"
  | "calendar.confirm"
  | "appointment.view"
  | "appointment.create"
  | "appointment.edit"
  | "appointment.delete"
  | "appointment.confirm"
  | "pm.availability.manage"
  | "pm.availability.view"
  | "project.view"
  | "project.create"
  | "project.edit"
  | "users.manage"
  | "settings.manage";

export type RolePermissions = Record<UserRole, Permission[]>;

// Permission mapping per role
export const rolePermissions: RolePermissions = {
  admin: [
    "calendar.view",
    "calendar.create",
    "calendar.edit",
    "calendar.delete",
    "calendar.confirm",
    "appointment.view",
    "appointment.create",
    "appointment.edit",
    "appointment.delete",
    "appointment.confirm",
    "pm.availability.manage",
    "pm.availability.view",
    "project.view",
    "project.create",
    "project.edit",
    "users.manage",
    "settings.manage",
  ],
  pm: [
    "calendar.view",
    "appointment.view",
    "appointment.confirm",
    "appointment.edit",
    "pm.availability.manage",
    "pm.availability.view",
    "project.view",
    "project.edit",
  ],
  client: [
    "calendar.view",
    "appointment.view",
    "appointment.create",
    "appointment.edit",
    "appointment.delete",
    "pm.availability.view",
    "project.view",
  ],
};

