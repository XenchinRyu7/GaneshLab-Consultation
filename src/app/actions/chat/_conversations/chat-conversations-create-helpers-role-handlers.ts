/**
 * Role-specific handlers for determining participant IDs
 */

import type { User } from "@/lib/auth";

import {
  validateClientPICConversation,
  validatePICPICConversation,
} from "./chat-conversations-create-helpers-validation";

/**
 * Handle client role participant determination
 */
export async function handleClientRole(
  user: User,
  otherUserId: string,
  projectId: string | null
): Promise<{ clientId: string; picId: string; projectId: string | null; error?: string }> {
  const validation = await validateClientPICConversation(user, otherUserId, projectId);
  if (!validation.valid) {
    return { clientId: "", picId: "", projectId: null, error: validation.error };
  }

  return { clientId: user.id, picId: otherUserId, projectId };
}

/**
 * Handle PIC role participant determination
 */
export async function handlePICRole(
  user: User,
  otherUserId: string,
  otherUserRole: string,
  projectId: string | null
): Promise<{ clientId: string; picId: string; projectId: string | null; error?: string }> {
  if (otherUserRole === "client") {
    return { clientId: otherUserId, picId: user.id, projectId };
  }

  if (otherUserRole === "pic") {
    const { clientId, picId } = validatePICPICConversation(user.id, otherUserId);
    return { clientId, picId, projectId: null };
  }

  return { clientId: "", picId: "", projectId: null, error: "Invalid user role" };
}
