import { useEffect, useRef } from "react";

import type { MessageWithSender } from "@/app/actions/chat";

export function useAutoScroll(
  messages: MessageWithSender[],
  isLoading: boolean,
  conversationId: string
) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [conversationId]);

  useEffect(() => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;

    if (isInitialLoad.current && messages.length > 0 && !isLoading) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          isInitialLoad.current = false;
        }
      }, 100);
    } else if (!isInitialLoad.current && messages.length > 0) {
      // Always scroll to bottom when new message arrives (for Realtime and optimistic updates)
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  }, [messages, isLoading, conversationId]);

  return { messagesEndRef, scrollContainerRef };
}
