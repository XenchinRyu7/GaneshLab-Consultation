"use server";

import { getCurrentUser } from "@/lib/auth";

import type { Contact } from "../_types";

import { getContactsForUser, sortContacts } from "./chat-contacts-helpers";
import { getAvailablePICsForClient } from "./chat-contacts-queries";

// Get contacts (users that current user can chat with)
export async function getContacts(): Promise<{
  contacts: Contact[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { contacts: [], error: "Unauthorized" };
    }

    if (!["client", "pic", "admin"].includes(user.role)) {
      return { contacts: [], error: "Invalid user role" };
    }

    // Get contacts based on user role
    const contacts = await getContactsForUser(user.id, user.role);

    // Sort contacts (conversations first, then by lastMessageAt, then by name)
    const sortedContacts = await sortContacts(contacts);

    return { contacts: sortedContacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { contacts: [], error: "Failed to fetch contacts" };
  }
}

// Get available PICs for client to start conversation (deprecated, use getContacts instead)
export async function getAvailablePICs(): Promise<{
  pics: Array<{ id: string; name: string; avatar?: string; email: string }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { pics: [], error: "Unauthorized" };
    }

    const pics = await getAvailablePICsForClient();

    return { pics };
  } catch (error) {
    console.error("Error fetching PICs:", error);
    return { pics: [], error: "Failed to fetch PICs" };
  }
}
