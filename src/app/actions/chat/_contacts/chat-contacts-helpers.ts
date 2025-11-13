"use server";

import type { Contact } from "../_types";

import { getClientContacts, getPICContacts, getAdminContacts } from "./chat-contacts-queries";

// Business logic helpers for contacts

export async function getContactsForUser(
  userId: string,
  userRole: "client" | "pic" | "admin"
): Promise<Contact[]> {
  switch (userRole) {
    case "client":
      return getClientContacts(userId);
    case "pic":
      return getPICContacts(userId);
    case "admin":
      return getAdminContacts();
    default:
      throw new Error("Invalid user role");
  }
}

// Helper to calculate unread message counts for contacts
export async function calculateUnreadCounts(contacts: Contact[]): Promise<Contact[]> {
  // This would require additional database queries to count unread messages
  // For now, returning contacts as-is with unreadCount = 0
  // TODO: Implement unread count calculation when needed
  return contacts.map(contact => ({
    ...contact,
    unreadCount: 0,
  }));
}

// Helper to sort contacts (conversations first, then by lastMessageAt, then by name)
export async function sortContacts(contacts: Contact[]): Promise<Contact[]> {
  return contacts.sort((a, b) => {
    // Conversations come first
    if (a.hasConversation !== b.hasConversation) {
      return a.hasConversation ? -1 : 1;
    }

    // Then sort by lastMessageAt (most recent first)
    if (a.lastMessageAt && b.lastMessageAt) {
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    }
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;

    // Finally, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}
