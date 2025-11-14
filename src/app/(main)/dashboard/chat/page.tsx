import { getContacts } from "@/app/actions/chat";
import { getCurrentUser } from "@/lib/auth";

import { ChatClient } from "./_components/chat-client";

export default async function ChatPage() {
  const user = await getCurrentUser();
  const { contacts } = await getContacts();

  return (
    <div className="-m-4 h-[calc(100vh-4rem)] overflow-hidden md:-m-6">
      <ChatClient initialContacts={contacts} currentUser={user} />
    </div>
  );
}
