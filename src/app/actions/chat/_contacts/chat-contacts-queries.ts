"use server";

import { prisma } from "@/lib/prisma";

import type { Contact } from "../_types";

// Query helpers for getting contacts data from database

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

export async function getPICContacts(picId: string): Promise<Contact[]> {
  // PIC can see all Clients and all other PICs
  const [clients, otherPics] = await Promise.all([
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
  ]);

  // Get conversations
  const clientIds = clients.map(c => c.id);
  const picIds = otherPics.map(p => p.id);

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

  return [...clientContacts, ...picContacts];
}

export async function getAdminContacts(): Promise<Contact[]> {
  // Admin can see everyone (clients and PICs)
  const [clients, pics] = await Promise.all([
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
      where: { role: "pic" },
      select: {
        id: true,
        fullname: true,
        avatarColor: true,
        email: true,
      },
      orderBy: { fullname: "asc" },
    }),
  ]);

  const contacts: Contact[] = [
    ...clients.map(c => ({
      id: c.id,
      name: c.fullname,
      avatar: c.avatarColor ?? undefined,
      email: c.email,
      role: "client" as const,
      hasConversation: false,
      unreadCount: 0,
    })),
    ...pics.map(p => ({
      id: p.id,
      name: p.fullname,
      avatar: p.avatarColor ?? undefined,
      email: p.email,
      role: "pic" as const,
      hasConversation: false,
      unreadCount: 0,
    })),
  ];

  return contacts;
}

export async function getAvailablePICsForClient(): Promise<
  Array<{
    id: string;
    name: string;
    avatar?: string;
    email: string;
  }>
> {
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

  return pics.map(pic => ({
    id: pic.id,
    name: pic.fullname,
    avatar: pic.avatarColor ?? undefined,
    email: pic.email,
  }));
}
