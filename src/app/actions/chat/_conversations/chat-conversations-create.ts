"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";

import type { ConversationWithParticipants } from "../_types/chat-types";

import {
  buildUnclearUpdateData,
  createNewConversation,
  determineParticipantIds,
  findExistingConversation,
  needsUnclear,
  unClearConversation,
} from "./chat-conversations-create-helpers";
import { transformConversation } from "./chat-conversations-helpers";

/**
 * Get or create a conversation
 * For client: otherUserId is PIC ID
 * For PIC: otherUserId can be Client ID or PIC ID
 */
export async function getOrCreateConversation(
  otherUserId: string,
  projectId?: string | null
): Promise<{ conversation: ConversationWithParticipants | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversation: null, error: "Unauthorized" };
    }

    // Determine participant IDs
    const {
      clientId,
      picId,
      projectId: finalProjectId,
      error,
    } = await determineParticipantIds(user, otherUserId, projectId);
    if (error) {
      return { conversation: null, error };
    }

    // Try to find existing conversation
    let conversation = await findExistingConversation(clientId, picId, finalProjectId);

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await createNewConversation(clientId, picId, finalProjectId);
    } else {
      // Un-clear conversation if it was cleared
      const updateData = buildUnclearUpdateData(user, conversation);
      if (needsUnclear(updateData, conversation)) {
        conversation = await unClearConversation(conversation.id, updateData);
      }
    }

    const conversationWithParticipants = await transformConversation(conversation, user.id);

    revalidatePath("/dashboard/chat");
    return { conversation: conversationWithParticipants };
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    return { conversation: null, error: "Failed to get or create conversation" };
  }
}
