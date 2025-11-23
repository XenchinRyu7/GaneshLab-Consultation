"use server";

import { prisma } from "@/lib/prisma";

import type { Contact } from "../_types";

export async function getPICContacts(picId: string): Promise<Contact[]> {
  // PIC can see all Clients, all other PICs, and all Admins
  const [clients, otherPics, admins] = await Promise.all([
    prisma.userProfile.findMany({
      where: { role: "client" },
      select: {
        id: true,
        fullname: true,
        avatarColor: true,
        email: true,
      },
      orderBy: { fullname: "asc" },
    }),
    prisma.userProfile.findMany({
      where: {
        role: "pic",
        id: { not: picId }, // Exclude self
      },
      select: {
        id: true,
        fullname: true,
        avatarColor: true,
        email: true,
      },
      orderBy: { fullname: "asc" },
    }),
    prisma.userProfile.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        fullname: true,
        avatarColor: true,
        email: true,
      },
      orderBy: { fullname: "asc" },
    }),
  ]);

  // Get conversations
  const clientIds = clients.map(c => c.id);
  const picIds = otherPics.map(p => p.id);
  const adminIds = admins.map(a => a.id);

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        // PIC-Client conversations where current user is PIC (exclude cleared by PIC)
        {
          clientId: { in: clientIds },
          picId: picId,
          clearedByPicAt: null,
        },
        // PIC-PIC conversations - current user as PIC (exclude cleared by PIC)
        {
          AND: [{ clientId: { in: picIds } }, { picId: picId }, { clearedByPicAt: null }],
        },
        // PIC-PIC conversations - current user as Client (exclude cleared by client)
        {
          AND: [{ picId: { in: picIds } }, { clientId: picId }, { clearedByClientAt: null }],
        },
        // PIC-Admin conversations where current user is PIC (exclude cleared by PIC)
        {
          clientId: { in: adminIds },
          picId: picId,
          clearedByPicAt: null,
        },
        // PIC-Admin conversations where current user is Client (exclude cleared by client)
        {
          picId: { in: adminIds },
          clientId: picId,
          clearedByClientAt: null,
        },
      ],
    },
    include: {
      client: {
        select: { id: true },
      },
      pic: {
        select: { id: true },
      },
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
              senderId: { not: picId },
              readAt: null,
              isDeleted: false,
            },
          },
        },
      },
    },
  });

  // Create conversation map
  // Key: other user's ID, Value: conversation
  type ConversationType = (typeof conversations)[0];
  const conversationMap = new Map<string, ConversationType>();
  conversations.forEach(conv => {
    let otherUserId: string;
    if (conv.clientId === picId) {
      otherUserId = conv.picId;
    } else if (conv.picId === picId) {
      otherUserId = conv.clientId;
    } else {
      return; // Shouldn't happen, but skip if it does
    }
    conversationMap.set(otherUserId, conv);
  });

  // Map clients
  const clientContacts: Contact[] = clients.map(client => {
    const conv = conversationMap.get(client.id);
    const lastMsg = conv?.messages[0];
    return {
      id: client.id,
      name: client.fullname,
      avatar: client.avatarColor ?? undefined,
      email: client.email,
      role: "client" as const,
      hasConversation: !!conv,
      conversationId: conv?.id,
      lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
      lastMessageAt: conv?.lastMessageAt ?? undefined,
      // eslint-disable-next-line no-underscore-dangle
      unreadCount: conv?._count.messages ?? 0,
    };
  });

  // Map PICs
  const picContacts: Contact[] = otherPics.map(pic => {
    const conv = conversationMap.get(pic.id);
    const lastMsg = conv?.messages[0];
    return {
      id: pic.id,
      name: pic.fullname,
      avatar: pic.avatarColor ?? undefined,
      email: pic.email,
      role: "pic" as const,
      hasConversation: !!conv,
      conversationId: conv?.id,
      lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
      lastMessageAt: conv?.lastMessageAt ?? undefined,
      // eslint-disable-next-line no-underscore-dangle
      unreadCount: conv?._count.messages ?? 0,
    };
  });

  // Map Admins
  const adminContacts: Contact[] = admins.map(admin => {
    const conv = conversationMap.get(admin.id);
    const lastMsg = conv?.messages[0];
    return {
      id: admin.id,
      name: admin.fullname,
      avatar: admin.avatarColor ?? undefined,
      email: admin.email,
      role: "admin" as const,
      hasConversation: !!conv,
      conversationId: conv?.id,
      lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
      lastMessageAt: conv?.lastMessageAt ?? undefined,
      // eslint-disable-next-line no-underscore-dangle
      unreadCount: conv?._count.messages ?? 0,
    };
  });

  return [...clientContacts, ...picContacts, ...adminContacts];
}
