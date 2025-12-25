/**
 * Project validation utilities for Projects page
 */

import { toast } from "sonner";

type UserWithRole = {
  role: string;
} | null;

/**
 * Validate if user can create projects
 */
export function validateUserForProjectCreation(
  currentUser: UserWithRole,
  t: (key: string) => string
): boolean {
  if (!currentUser || currentUser.role !== "client") {
    toast.error(t("onlyClientsCanCreate"));
    return false;
  }
  return true;
}

/**
 * Validate if user can edit projects
 */
export function validateUserForProjectEdit(
  currentUser: UserWithRole,
  t: (key: string) => string
): boolean {
  if (!currentUser || currentUser.role !== "client") {
    toast.error(t("onlyClientsCanEdit"));
    return false;
  }
  return true;
}
