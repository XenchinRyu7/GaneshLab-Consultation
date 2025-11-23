/**
 * Helper functions for creating conversations
 */

import type { User } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { handleClientRole, handlePICRole } from "./chat-conversations-create-helpers-role-handlers";

/**
 * Determine client and PIC IDs based on user roles
 */
export async function determineParticipantIds(
  user: User,
  otherUserId: string,
  projectId?: string | null
): Promise<{ clientId: string; picId: string; projectId: string | null; error?: string }> {
  const otherUser = await prisma.userProfile.findFirst({
    where: { id: otherUserId },
  });

  if (!otherUser) {
    return { clientId: "", picId: "", projectId: null, error: "User not found" };
  }

  if (user.role === "client") {
    if (otherUser.role !== "pic") {
      return { clientId: "", picId: "", projectId: null, error: "Client can only chat with PIC" };
    }
    return handleClientRole(user, otherUserId, projectId ?? null);
  }

  if (user.role === "pic") {
    return handlePICRole(user, otherUserId, otherUser.role, projectId ?? null);
  }

  return { clientId: "", picId: "", projectId: null, error: "Admin cannot create conversations" };
}

/**
 * Find existing conversation
 */
export async function findExistingConversation(
  clientId: string,
  picId: string,
  projectId: string | null
) {
  return prisma.conversation.findFirst({
    where: {
      clientId: clientId,
      picId: picId,
      projectId: projectId,
    },
    include: {
      client: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      pic: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Create new conversation
 */
export async function createNewConversation(
  clientId: string,
  picId: string,
  projectId: string | null
) {
  return prisma.conversation.create({
    data: {
      clientId: clientId,
      picId: picId,
      projectId: projectId,
      clearedByClientAt: null,
      clearedByPicAt: null,
    },
    include: {
      client: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      pic: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });
}

/**
 * Build update data to un-clear conversation
 */
export function buildUnclearUpdateData(
  user: User,
  conversation: {
    clientId: string;
    picId: string;
    clearedByClientAt: Date | null;
    clearedByPicAt: Date | null;
  }
): { clearedByClientAt?: null; clearedByPicAt?: null } {
  const updateData: { clearedByClientAt?: null; clearedByPicAt?: null } = {};

  if (user.role === "client" && conversation.clientId === user.id) {
    updateData.clearedByClientAt = null;
  } else if (user.role === "pic" && conversation.picId === user.id) {
    updateData.clearedByPicAt = null;
  } else {
    // Handle edge cases: check by actual ID position
    if (conversation.clientId === user.id) {
      updateData.clearedByClientAt = null;
    } else if (conversation.picId === user.id) {
      updateData.clearedByPicAt = null;
    }
  }

  return updateData;
}

/**
 * Check if conversation needs to be un-cleared
 */
export function needsUnclear(
  updateData: { clearedByClientAt?: null; clearedByPicAt?: null },
  conversation: { clearedByClientAt: Date | null; clearedByPicAt: Date | null }
): boolean {
  if (Object.keys(updateData).length === 0) {
    return false;
  }

  return (
    (updateData.clearedByClientAt === null && conversation.clearedByClientAt !== null) ||
    (updateData.clearedByPicAt === null && conversation.clearedByPicAt !== null)
  );
}

/**
 * Update conversation to un-clear it
 */
export async function unClearConversation(
  conversationId: string,
  updateData: { clearedByClientAt?: null; clearedByPicAt?: null }
) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: updateData,
    include: {
      client: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      pic: {
        select: { id: true, fullname: true, avatarColor: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });
}
