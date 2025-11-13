"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { ConversationWithParticipants } from "../_types/chat-types";

import {
  transformConversation,
  transformConversationWithLastMessage,
} from "./chat-conversations-helpers";

// Get all conversations for current user
export async function getConversations(): Promise<{
  conversations: ConversationWithParticipants[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversations: [], error: "Unauthorized" };
    }

    let conversations;

    if (user.role === "client") {
      // Client sees conversations with all PICs (exclude cleared conversations)
      conversations = await prisma.conversation.findMany({
        where: {
          clientId: user.id,
          clearedByClientAt: null, // Exclude cleared conversations
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    } else if (user.role === "pic") {
      // PIC sees conversations with all clients and other PICs (exclude cleared conversations)
      conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            {
              picId: user.id,
              clearedByPICAt: null, // Exclude if cleared by PIC
            },
            {
              clientId: user.id,
              clearedByClientAt: null, // Exclude if cleared by client (when PIC is in client position)
            },
          ],
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    } else {
      // Admin can see all conversations
      conversations = await prisma.conversation.findMany({
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    }

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async conv => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            readAt: null,
          },
        });

        return transformConversationWithLastMessage(conv, unreadCount);
      })
    );

    return { conversations: conversationsWithUnread };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { conversations: [], error: "Failed to fetch conversations" };
  }
}

// Get conversation by ID
export async function getConversationById(
  conversationId: string
): Promise<{ conversation: ConversationWithParticipants | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversation: null, error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    // Note: We allow access even if cleared, so user can see conversation details
    // But getContacts will filter it out from the list
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
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

    if (!conversation) {
      return { conversation: null, error: "Conversation not found" };
    }

    const conversationWithParticipants = await transformConversation(conversation, user.id);

    return { conversation: conversationWithParticipants };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { conversation: null, error: "Failed to fetch conversation" };
  }
}
