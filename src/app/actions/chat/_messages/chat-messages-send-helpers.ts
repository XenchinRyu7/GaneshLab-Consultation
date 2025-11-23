/**
 * Helper functions for sending messages
 */
"use server";

import type { User } from "@/lib/auth";

interface Conversation {
  id: string;
  clientId: string;
  picId: string;
  clearedByClientAt: Date | null;
  clearedByPicAt: Date | null;
}

/**
 * Build update data to un-clear conversation when sending message
 */
export async function buildUnclearUpdateData(
  user: User,
  conversation: Conversation
): Promise<{
  lastMessageAt: Date;
  clearedByClientAt?: null;
  clearedByPicAt?: null;
}> {
  const updateData: {
    lastMessageAt: Date;
    clearedByClientAt?: null;
    clearedByPicAt?: null;
  } = {
    lastMessageAt: new Date(),
  };

  // Un-clear conversation for the sender (restore conversation)
  if (user.role === "client" && conversation.clientId === user.id) {
    updateData.clearedByClientAt = null;
  } else if (user.role === "pic" && conversation.picId === user.id) {
    updateData.clearedByPicAt = null;
  } else {
    // Handle edge cases
    if (conversation.clientId === user.id) {
      updateData.clearedByClientAt = null;
    } else if (conversation.picId === user.id) {
      updateData.clearedByPicAt = null;
    }
  }

  return updateData;
}
