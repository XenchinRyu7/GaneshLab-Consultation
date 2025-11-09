"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Clock, CheckCircle2, XCircle, Loader2, MoreVertical, Trash2, Edit2, Smile } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { cn, getInitials } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import type { ConversationWithParticipants, MessageWithSender } from "@/app/actions/chat";

interface ChatWindowProps {
  conversation: ConversationWithParticipants;
  messages: MessageWithSender[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  currentUserId: string;
}

export function ChatWindow({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  currentUserId,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoad = useRef(true);

  // Get emoji picker theme based on app theme
  // emoji-picker-react supports: "light", "dark", "auto"
  const emojiTheme: Theme = (themeMode === "dark" ? "dark" : "light") as Theme;

  const otherParticipant =
    currentUserId === conversation.clientId
      ? { name: conversation.picName, avatar: conversation.picAvatar }
      : { name: conversation.clientName, avatar: conversation.clientAvatar };

  // Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [conversation.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!scrollContainerRef.current || !messagesEndRef.current) return;
    
    if (isInitialLoad.current && messages.length > 0 && !isLoading) {
      // On initial load, scroll immediately to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          isInitialLoad.current = false;
        }
      }, 100);
    } else if (!isInitialLoad.current && messages.length > 0) {
      // On new messages, only scroll if user is near bottom
      const container = scrollContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      if (isNearBottom && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isLoading, conversation.id]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput, editContent]);

  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;

    const content = messageInput.trim();
    setMessageInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsSending(true);
    try {
      await onSendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (message: MessageWithSender) => {
    setEditingMessage(message);
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim() || isEditing) return;

    setIsEditing(true);
    try {
      await onEditMessage(editingMessage.id, editContent.trim());
      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await onDeleteMessage(messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditingMessage(null);
      setEditContent("");
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, MessageWithSender[]>);

  const getMessageStatusIcon = (message: MessageWithSender) => {
    if (message.status === "sending") {
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
    if (message.status === "error") {
      return <XCircle className="h-3 w-3 text-destructive" />;
    }
    if (message.readAt) {
      return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
    }
    return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-10 w-10"
              style={{
                backgroundColor: otherParticipant.avatar || "#3b82f6",
              }}
            >
              <AvatarFallback className="text-white text-sm">
                {getInitials(otherParticipant.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{otherParticipant.name}</p>
              {conversation.projectName && (
                <p className="text-sm text-muted-foreground">
                  {conversation.projectName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages - Scrollable Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 min-h-0"
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                      {format(new Date(date), "MMMM d, yyyy")}
                    </div>
                  </div>
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.senderId === currentUserId;
                    const showAvatar =
                      index === 0 ||
                      dateMessages[index - 1]?.senderId !== message.senderId;
                    const showTimestamp =
                      index === dateMessages.length - 1 ||
                      dateMessages[index + 1]?.senderId !== message.senderId;

                    return (
                      <div
                        key={message.tempId || message.id}
                        className={cn(
                          "flex gap-3 mb-2 group",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwnMessage && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar
                                className="h-8 w-8"
                                style={{
                                  backgroundColor:
                                    message.senderAvatar || "#3b82f6",
                                }}
                              >
                                <AvatarFallback className="text-white text-xs">
                                  {getInitials(message.senderName)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8" />
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex flex-col max-w-[70%]",
                            isOwnMessage ? "items-end" : "items-start"
                          )}
                        >
                          {showAvatar && !isOwnMessage && (
                            <p className="text-xs text-muted-foreground mb-1 px-2">
                              {message.senderName}
                            </p>
                          )}
                          <div className="flex items-end gap-2 group">
                            <div
                              className={cn(
                                "rounded-lg px-4 py-2 relative",
                                isOwnMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted",
                                message.status === "sending" && "opacity-70",
                                message.isDeleted && "opacity-50 italic"
                              )}
                            >
                              {message.isDeleted ? (
                                <p className="text-sm text-muted-foreground">
                                  This message was deleted
                                </p>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              )}
                              {message.editedAt && !message.isDeleted && (
                                <span className="text-xs opacity-70 ml-2">(edited)</span>
                              )}
                            </div>
                            {isOwnMessage && !message.isDeleted && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(message)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(message.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {(showTimestamp || isOwnMessage) && (
                            <div className="flex items-center gap-1 mt-1 px-2">
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(message.createdAt), "h:mm a")}
                              </p>
                              {isOwnMessage && !message.isDeleted && getMessageStatusIcon(message)}
                            </div>
                          )}
                        </div>
                        {isOwnMessage && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar
                                className="h-8 w-8"
                                style={{
                                  backgroundColor: message.senderAvatar || "#3b82f6",
                                }}
                              >
                                <AvatarFallback className="text-white text-xs">
                                  {getInitials(message.senderName)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 p-4 border-t bg-background">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="min-h-[60px] max-h-[200px] resize-none flex-1"
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
              <PopoverContent className="w-auto p-0 border-0 shadow-lg" align="end">
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    const emoji = emojiData.emoji;
                    const textarea = textareaRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = messageInput;
                      const newText = text.substring(0, start) + emoji + text.substring(end);
                      setMessageInput(newText);
                      // Set cursor position after inserted emoji
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
                      }, 0);
                    } else {
                      setMessageInput((prev) => prev + emoji);
                    }
                    setEmojiPickerOpen(false);
                  }}
                  theme={emojiTheme}
                  width={350}
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
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleEditKeyDown}
            className="min-h-[100px]"
            placeholder="Edit your message..."
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingMessage(null);
                setEditContent("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editContent.trim() || isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
