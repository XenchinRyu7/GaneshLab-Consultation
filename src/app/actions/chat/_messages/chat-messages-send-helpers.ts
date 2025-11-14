/**
 * Helper functions for sending messages
 */

import type { User } from "@/lib/auth";

interface Conversation {
  id: string;
  clientId: string;
  picId: string;
  clearedByClientAt: Date | null;
  clearedByPICAt: Date | null;
}

/**
 * Build update data to un-clear conversation when sending message
 */
export function buildUnclearUpdateData(
  user: User,
  conversation: Conversation
): {
  lastMessageAt: Date;
  clearedByClientAt?: null;
  clearedByPICAt?: null;
} {
  const updateData: {
    lastMessageAt: Date;
    clearedByClientAt?: null;
    clearedByPICAt?: null;
  } = {
    lastMessageAt: new Date(),
  };

  // Un-clear conversation for the sender (restore conversation)
  if (user.role === "client" && conversation.clientId === user.id) {
    updateData.clearedByClientAt = null;
  } else if (user.role === "pic" && conversation.picId === user.id) {
    updateData.clearedByPICAt = null;
  } else {
    // Handle edge cases
    if (conversation.clientId === user.id) {
      updateData.clearedByClientAt = null;
    } else if (conversation.picId === user.id) {
      updateData.clearedByPICAt = null;
    }
  }

  return updateData;
}
