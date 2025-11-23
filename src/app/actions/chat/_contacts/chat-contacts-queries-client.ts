"use server";

import { prisma } from "@/lib/prisma";

import type { Contact } from "../_types";

export async function getClientContacts(clientId: string): Promise<Contact[]> {
  // Client can see all PICs
  const pics = await prisma.userProfile.findMany({
    where: { role: "pic" },
    select: {
      id: true,
      fullname: true,
      avatarColor: true,
      email: true,
    },
    orderBy: { fullname: "asc" },
  });

  // Get conversations for these PICs (exclude cleared conversations for client)
  const conversations = await prisma.conversation.findMany({
    where: {
      clientId: clientId,
      picId: { in: pics.map(p => p.id) },
      clearedByClientAt: null, // Exclude conversations cleared by client
    },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          isDeleted: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: clientId },
              readAt: null,
              isDeleted: false,
            },
          },
        },
      },
    },
  });

  const conversationMap = new Map(conversations.map(conv => [conv.picId, conv]));

  // Create contacts with conversation data
  const contacts: Contact[] = pics.map(pic => {
    const conv = conversationMap.get(pic.id);
    const lastMsg = conv?.messages[0];

    return {
      id: pic.id,
      name: pic.fullname,
      avatar: pic.avatarColor ?? undefined,
      email: pic.email,
      role: "pic",
      hasConversation: !!conv,
      conversationId: conv?.id,
      lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
      lastMessageAt: conv?.lastMessageAt ?? undefined,
      // eslint-disable-next-line no-underscore-dangle
      unreadCount: conv?._count.messages ?? 0,
    };
  });

  return contacts;
}
