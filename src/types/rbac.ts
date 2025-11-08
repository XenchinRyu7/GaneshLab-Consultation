export type UserRole = "admin" | "pic" | "client";

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
  | "pic.availability.manage"
  | "pic.availability.view"
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
    "pic.availability.manage",
    "pic.availability.view",
    "project.view",
    "project.create",
    "project.edit",
    "users.manage",
    "settings.manage",
  ],
  pic: [
    "calendar.view",
    "appointment.view",
    "appointment.confirm",
    "appointment.edit",
    "pic.availability.manage",
    "pic.availability.view",
    "project.view",
    "project.edit",
  ],
  client: [
    "calendar.view",
    "appointment.view",
    "appointment.create",
    "appointment.edit",
    "appointment.delete",
    "pic.availability.view",
    "project.view",
  ],
};

