import { getCurrentUser } from "@/lib/auth";
import { getContacts } from "@/app/actions/chat";
import { ChatClient } from "./_components/chat-client";

export default async function ChatPage() {
  const user = await getCurrentUser();
  const { contacts } = await getContacts();

  return (
    <div className="h-[calc(100vh-4rem)] -m-4 md:-m-6 overflow-hidden">
      <ChatClient initialContacts={contacts} currentUser={user} />
    </div>
  );
}
