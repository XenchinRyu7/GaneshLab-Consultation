import { useState, useEffect, useRef } from "react";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { MessageWithSender } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ChatEditDialogProps {
  editingMessage: MessageWithSender | null;
  onClose: () => void;
  onSave: (messageId: string, newContent: string) => Promise<void>;
}

export function ChatEditDialog({ editingMessage, onClose, onSave }: ChatEditDialogProps) {
  const t = useTranslations("Chat");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingMessage) {
      setEditContent(editingMessage.content);
      setIsEditing(false);
    }
  }, [editingMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editContent]);

  const handleSave = async () => {
    if (!editingMessage || !editContent.trim() || isEditing) return;

    setIsEditing(true);
    try {
      await onSave(editingMessage.id, editContent.trim());
      onClose();
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={!!editingMessage} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editMessage")}</DialogTitle>
        </DialogHeader>
        <Textarea
          ref={textareaRef}
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[100px]"
          placeholder={t("editMessagePlaceholder")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!editContent.trim() || isEditing}>
            {isEditing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
