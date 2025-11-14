import type { Contact, ConversationWithParticipants } from "@/app/actions/chat";
import type { User } from "@/lib/auth";

/**
 * Determine client ID based on user and contact roles
 */
function getClientId(user: User, contact: Contact): string {
  if (user.role === "client") return user.id;
  if (contact.role === "client") return contact.id;
  return user.id;
}

/**
 * Determine client name based on user and contact roles
 */
function getClientName(user: User, contact: Contact): string {
  if (user.role === "client") return user.name;
  if (contact.role === "client") return contact.name;
  return user.name || "";
}

/**
 * Determine client avatar based on user and contact roles
 */
function getClientAvatar(user: User, contact: Contact): string | undefined {
  if (user.role === "client") return user.avatar ?? undefined;
  if (contact.role === "client") return contact.avatar ?? undefined;
  return user.avatar ?? undefined;
}

/**
 * Determine PIC ID based on user and contact roles
 */
function getPicId(user: User, contact: Contact): string {
  if (user.role === "pic") return user.id;
  if (contact.role === "pic") return contact.id;
  return user.id;
}

/**
 * Determine PIC name based on user and contact roles
 */
function getPicName(user: User, contact: Contact): string {
  if (user.role === "pic") return user.name;
  if (contact.role === "pic") return contact.name;
  return user.name;
}

/**
 * Determine PIC avatar based on user and contact roles
 */
function getPicAvatar(user: User, contact: Contact): string | undefined {
  if (user.role === "pic") return user.avatar ?? undefined;
  if (contact.role === "pic") return contact.avatar ?? undefined;
  return user.avatar ?? undefined;
}

/**
 * Build conversation object for chat window
 */
export function buildConversationForWindow(
  selectedConversation: ConversationWithParticipants | null,
  selectedContact: Contact | null,
  user: User | null
): ConversationWithParticipants | null {
  if (selectedConversation) {
    return selectedConversation;
  }

  if (!selectedContact || !user) {
    return null;
  }

  return {
    id: selectedContact.conversationId ?? "temp",
    clientId: getClientId(user, selectedContact),
    clientName: getClientName(user, selectedContact),
    clientAvatar: getClientAvatar(user, selectedContact),
    picId: getPicId(user, selectedContact),
    picName: getPicName(user, selectedContact),
    picAvatar: getPicAvatar(user, selectedContact),
    projectId: null,
    projectName: null,
    lastMessage: selectedContact.lastMessage ?? null,
    lastMessageAt: selectedContact.lastMessageAt ?? null,
    unreadCount: selectedContact.unreadCount,
    createdAt: new Date(),
  };
}

export function filterContacts(contacts: Contact[], searchQuery: string): Contact[] {
  if (!searchQuery) return contacts;
  const search = searchQuery.toLowerCase();
  return contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.lastMessage?.toLowerCase().includes(search)
  );
}
