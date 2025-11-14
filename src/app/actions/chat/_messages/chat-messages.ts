"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { MessageWithSender } from "../_types";

import { buildUnclearUpdateData } from "./chat-messages-send-helpers";

// Get messages for a conversation
export async function getMessages(
  conversationId: string
): Promise<{ messages: MessageWithSender[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { messages: [], error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    // Note: We allow access even if cleared (like WhatsApp - messages still accessible)
    // Clearing only hides conversation from contact list, not from direct access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { messages: [], error: "Conversation not found" };
    }

    // Get all messages (including deleted ones, so we can show "deleted" indicator)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const messagesWithSender: MessageWithSender[] = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender.fullname,
      senderAvatar: msg.sender.avatarColor ?? undefined,
      content: msg.content,
      isDeleted: msg.isDeleted,
      editedAt: msg.editedAt,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
    }));

    return { messages: messagesWithSender };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to fetch messages" };
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ message: MessageWithSender | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { message: null, error: "Unauthorized" };
    }

    if (!content.trim()) {
      return { message: null, error: "Message content is required" };
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { message: null, error: "Conversation not found" };
    }

    // If conversation was cleared, un-clear it when user sends a message (like WhatsApp)
    const updateData = buildUnclearUpdateData(user, conversation);

    // Create message first
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    // Update conversation: un-clear and update lastMessageAt in one query
    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    const messageWithSender: MessageWithSender = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.sender.fullname,
      senderAvatar: message.sender.avatarColor ?? undefined,
      content: message.content,
      isDeleted: message.isDeleted || false,
      editedAt: message.editedAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };

    revalidatePath("/dashboard/chat");
    return { message: messageWithSender };
  } catch (error) {
    console.error("Error sending message:", error);
    return { message: null, error: "Failed to send message" };
  }
}

// Delete a message (soft delete)
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user owns this message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
      },
    });

    if (!message) {
      return { success: false, error: "Message not found or unauthorized" };
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    // Update conversation lastMessageAt if this was the last message
    const lastMessage = await prisma.message.findFirst({
      where: {
        conversationId: message.conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { lastMessageAt: lastMessage?.createdAt ?? null },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

// Edit a message
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<{ message: MessageWithSender | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { message: null, error: "Unauthorized" };
    }

    if (!newContent.trim()) {
      return { message: null, error: "Message content cannot be empty" };
    }

    // Verify user owns this message
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
        isDeleted: false,
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    if (!existingMessage) {
      return { message: null, error: "Message not found or unauthorized" };
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent.trim(),
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    const messageWithSender: MessageWithSender = {
      id: updatedMessage.id,
      conversationId: updatedMessage.conversationId,
      senderId: updatedMessage.senderId,
      senderName: updatedMessage.sender.fullname,
      senderAvatar: updatedMessage.sender.avatarColor ?? undefined,
      content: updatedMessage.content,
      isDeleted: updatedMessage.isDeleted ?? false,
      editedAt: updatedMessage.editedAt,
      readAt: updatedMessage.readAt,
      createdAt: updatedMessage.createdAt,
    };

    revalidatePath("/dashboard/chat");
    return { message: messageWithSender };
  } catch (error) {
    console.error("Error editing message:", error);
    return { message: null, error: "Failed to edit message" };
  }
}

// Mark messages as read
export async function markMessagesAsRead(
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
      return { success: false, error: "Conversation not found" };
    }

    // Mark all unread messages from other participants as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}
