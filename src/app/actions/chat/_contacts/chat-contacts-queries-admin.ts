"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { Contact } from "../_types";

export async function getAdminContacts(): Promise<Contact[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }

  // Admin can see everyone (clients, PICs, and other admins) except themselves
  const [clients, pics, admins] = await Promise.all([
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
    prisma.userProfile.findMany({
      where: {
        role: "admin",
        id: { not: currentUser.id }, // Exclude current admin
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
    ...admins.map(a => ({
      id: a.id,
      name: a.fullname,
      avatar: a.avatarColor ?? undefined,
      email: a.email,
      role: "admin" as const,
      hasConversation: false,
      unreadCount: 0,
    })),
  ];

  return contacts;
}
