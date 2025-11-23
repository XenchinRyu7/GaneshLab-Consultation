"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Clear conversation (hide conversation for current user only, like WhatsApp)
// This doesn't delete the conversation, just marks it as cleared for the current user
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found or unauthorized" };
    }

    // Mark conversation as cleared for the current user (doesn't delete, just hides it)
    // Like WhatsApp: clearing only affects the user who clears it
    const updateData: { clearedByClientAt?: Date; clearedByPicAt?: Date } = {};

    if (user.role === "client" && conversation.clientId === user.id) {
      updateData.clearedByClientAt = new Date();
    } else if (user.role === "pic" && conversation.picId === user.id) {
      updateData.clearedByPicAt = new Date();
    } else {
      // Handle edge case: PIC might be in client position in some conversations
      if (conversation.clientId === user.id) {
        updateData.clearedByClientAt = new Date();
      } else if (conversation.picId === user.id) {
        updateData.clearedByPicAt = new Date();
      }
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return { success: false, error: "Failed to clear conversation" };
  }
}
