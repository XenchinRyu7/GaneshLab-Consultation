/**
 * Helper functions for conversation actions
 */
"use server";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { ConversationWithParticipants } from "../_types";

/**
 * Transform Prisma conversation to ConversationWithParticipants
 */
export async function transformConversation(
  conversation: Prisma.ConversationGetPayload<{
    include: {
      client: { select: { id: true; fullname: true; avatarColor: true } };
      pic: { select: { id: true; fullname: true; avatarColor: true } };
      project: { select: { id: true; name: true } };
    };
  }>,
  userId: string
): Promise<ConversationWithParticipants> {
  // Get unread count
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderId: { not: userId },
      readAt: null,
    },
  });

  // Get last message (exclude deleted)
  const lastMessage = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: { content: true },
  });

  return {
    id: conversation.id,
    clientId: conversation.clientId,
    clientName: conversation.client.fullname,
    clientAvatar: conversation.client.avatarColor ?? undefined,
    picId: conversation.picId,
    picName: conversation.pic.fullname,
    picAvatar: conversation.pic.avatarColor ?? undefined,
    projectId: conversation.projectId,
    projectName: conversation.project?.name ?? null,
    lastMessage: lastMessage?.content ?? null,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    createdAt: conversation.createdAt,
  };
}

/**
 * Transform conversation with last message from Prisma query
 */
export async function transformConversationWithLastMessage(
  conversation: Prisma.ConversationGetPayload<{
    include: {
      client: { select: { id: true; fullname: true; avatarColor: true } };
      pic: { select: { id: true; fullname: true; avatarColor: true } };
      project: { select: { id: true; name: true } };
      messages: {
        include: { sender: { select: { id: true; fullname: true } } };
      };
    };
  }>,
  unreadCount: number
): Promise<ConversationWithParticipants> {
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    clientId: conversation.clientId,
    clientName: conversation.client.fullname,
    clientAvatar: conversation.client.avatarColor ?? undefined,
    picId: conversation.picId,
    picName: conversation.pic.fullname,
    picAvatar: conversation.pic.avatarColor ?? undefined,
    projectId: conversation.projectId,
    projectName: conversation.project?.name ?? null,
    lastMessage: lastMessage.content,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    createdAt: conversation.createdAt,
  };
}
