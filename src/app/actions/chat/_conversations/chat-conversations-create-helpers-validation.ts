/**
 * Validation functions for conversation creation
 */

import type { User } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Validate client-PIC conversation
 */
export async function validateClientPICConversation(
  user: User,
  otherUserId: string,
  projectId: string | null
): Promise<{ valid: boolean; error?: string }> {
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId: user.id,
        picId: otherUserId,
      },
    });

    if (!project) {
      return { valid: false, error: "Project not found" };
    }
  }

  return { valid: true };
}

/**
 * Validate PIC-PIC conversation
 */
export function validatePICPICConversation(
  userId: string,
  otherUserId: string
): {
  clientId: string;
  picId: string;
} {
  const ids = [userId, otherUserId].sort();
  return { clientId: ids[0], picId: ids[1] };
}
