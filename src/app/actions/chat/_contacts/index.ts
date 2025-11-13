// Clean exports for chat contacts
export { getContacts, getAvailablePICs } from "./chat-contacts";

// Re-export helpers for internal use
export { getContactsForUser, sortContacts } from "./chat-contacts-helpers";
export { getClientContacts, getPICContacts, getAdminContacts } from "./chat-contacts-queries";
