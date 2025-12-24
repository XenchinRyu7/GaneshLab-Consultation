import { useState, useRef, useEffect } from "react";

import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Send, Smile, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

interface ChatMessageInputProps {
  messageInput: string;
  setMessageInput: (value: string | ((prev: string) => string)) => void;
  isSending: boolean;
  onSend: () => Promise<void>;
}

export function ChatMessageInput({
  messageInput,
  setMessageInput,
  isSending,
  onSend,
}: ChatMessageInputProps) {
  const t = useTranslations("Chat");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const themeMode = usePreferencesStore(state => state.themeMode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiTheme: Theme = (themeMode === "dark" ? "dark" : "light") as Theme;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim() && !isSending) {
        onSend();
      }
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = messageInput;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setMessageInput(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessageInput(prev => prev + emoji);
    }
    setEmojiPickerOpen(false);
  };

  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;

    setMessageInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSend();
  };

  return (
    <div className="bg-background flex-shrink-0 border-t p-3 md:p-4">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={t("typeMessage")}
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="max-h-[200px] min-h-[50px] flex-1 resize-none text-sm md:min-h-[60px] md:text-base"
          rows={1}
        />
        <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={isSending}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-0 p-0 shadow-lg" align="end">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={emojiTheme}
              width={typeof window !== "undefined" && window.innerWidth < 768 ? 280 : 350}
              height={400}
              previewConfig={{
                showPreview: false,
              }}
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleSend}
          disabled={!messageInput.trim() || isSending}
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
