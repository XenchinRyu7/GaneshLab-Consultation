"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ConversationWithParticipants {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  picId: string;
  picName: string;
  picAvatar?: string;
  projectId: string | null;
  projectName: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isDeleted: boolean;
  editedAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  status?: "sending" | "sent" | "error"; // For optimistic updates
  tempId?: string; // Temporary ID for optimistic messages
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: "client" | "pic";
  hasConversation: boolean;
  conversationId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
}

// Get all conversations for current user
export async function getConversations(): Promise<{
  conversations: ConversationWithParticipants[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversations: [], error: "Unauthorized" };
    }

    let conversations;
    
    if (user.role === "client") {
      // Client sees conversations with all PICs (exclude cleared conversations)
      conversations = await prisma.conversation.findMany({
        where: { 
          clientId: user.id,
          clearedByClientAt: null, // Exclude cleared conversations
        },
        include: {
          client: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          pic: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          project: {
            select: { id: true, name: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    } else if (user.role === "pic") {
      // PIC sees conversations with all clients and other PICs (exclude cleared conversations)
      conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            {
              picId: user.id,
              clearedByPICAt: null, // Exclude if cleared by PIC
            },
            {
              clientId: user.id,
              clearedByClientAt: null, // Exclude if cleared by client (when PIC is in client position)
            },
          ],
        },
        include: {
          client: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          pic: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          project: {
            select: { id: true, name: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    } else {
      // Admin can see all conversations
      conversations = await prisma.conversation.findMany({
        include: {
          client: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          pic: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          project: {
            select: { id: true, name: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, fullname: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });
    }

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            readAt: null,
          },
        });

        const lastMessage = conv.messages[0];
        const otherParticipant =
          user.role === "client" ? conv.pic : conv.client;

        return {
          id: conv.id,
          clientId: conv.clientId,
          clientName: conv.client.fullname,
          clientAvatar: conv.client.avatarColor || undefined,
          picId: conv.picId,
          picName: conv.pic.fullname,
          picAvatar: conv.pic.avatarColor || undefined,
          projectId: conv.projectId,
          projectName: conv.project?.name || null,
          lastMessage: lastMessage?.content || null,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
          createdAt: conv.createdAt,
        } as ConversationWithParticipants;
      })
    );

    return { conversations: conversationsWithUnread };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { conversations: [], error: "Failed to fetch conversations" };
  }
}

// Get or create a conversation
// For client: otherUserId is PIC ID
// For PIC: otherUserId can be Client ID or PIC ID
export async function getOrCreateConversation(
  otherUserId: string,
  projectId?: string | null
): Promise<{ conversation: ConversationWithParticipants; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversation: null as any, error: "Unauthorized" };
    }

    // Get other user
    const otherUser = await prisma.userProfile.findFirst({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      return { conversation: null as any, error: "User not found" };
    }

    let clientId: string;
    let picId: string;

    if (user.role === "client") {
      // Client chatting with PIC
      if (otherUser.role !== "pic") {
        return { conversation: null as any, error: "Client can only chat with PIC" };
      }
      clientId = user.id;
      picId = otherUserId;

      // If projectId is provided, verify it belongs to this client and PIC
      if (projectId) {
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            clientId: user.id,
            picId: otherUserId,
          },
        });

        if (!project) {
          return { conversation: null as any, error: "Project not found" };
        }
      }
    } else if (user.role === "pic") {
      // PIC chatting with Client or another PIC
      if (otherUser.role === "client") {
        clientId = otherUserId;
        picId = user.id;
      } else if (otherUser.role === "pic") {
        // PIC-PIC conversation: use sorted IDs for consistency
        const ids = [user.id, otherUserId].sort();
        clientId = ids[0];
        picId = ids[1];
        projectId = null; // PIC-PIC conversations don't have projects
      } else {
        return { conversation: null as any, error: "Invalid user role" };
      }
    } else {
      return { conversation: null as any, error: "Admin cannot create conversations" };
    }

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId: clientId,
        picId: picId,
        projectId: projectId || null,
      },
      include: {
        client: {
          select: { id: true, fullname: true, avatarColor: true },
        },
        pic: {
          select: { id: true, fullname: true, avatarColor: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId: clientId,
          picId: picId,
          projectId: projectId || null,
          clearedByClientAt: null, // Ensure not cleared
          clearedByPICAt: null, // Ensure not cleared
        },
        include: {
          client: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          pic: {
            select: { id: true, fullname: true, avatarColor: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });
    } else {
      // Conversation exists - un-clear it if it was cleared (like WhatsApp: sending message restores conversation)
      const updateData: { clearedByClientAt?: null; clearedByPICAt?: null } = {};
      
      if (user.role === "client" && conversation.clientId === user.id) {
        updateData.clearedByClientAt = null;
      } else if (user.role === "pic" && conversation.picId === user.id) {
        updateData.clearedByPICAt = null;
      } else {
        // Handle edge cases: check by actual ID position
        if (conversation.clientId === user.id) {
          updateData.clearedByClientAt = null;
        } else if (conversation.picId === user.id) {
          updateData.clearedByPICAt = null;
        }
      }

      // Only update if there's something to un-clear and conversation was actually cleared
      const needsUpdate = 
        (updateData.clearedByClientAt === null && conversation.clearedByClientAt !== null) ||
        (updateData.clearedByPICAt === null && conversation.clearedByPICAt !== null);

      if (needsUpdate && Object.keys(updateData).length > 0) {
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: updateData,
          include: {
            client: {
              select: { id: true, fullname: true, avatarColor: true },
            },
            pic: {
              select: { id: true, fullname: true, avatarColor: true },
            },
            project: {
              select: { id: true, name: true },
            },
          },
        });
      }
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: user.id },
        readAt: null,
      },
    });

    // Get last message (exclude deleted)
    const lastMessage = await prisma.message.findFirst({
      where: { 
        conversationId: conversation.id,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });

    const conversationWithParticipants: ConversationWithParticipants = {
      id: conversation.id,
      clientId: conversation.clientId,
      clientName: conversation.client.fullname,
      clientAvatar: conversation.client.avatarColor || undefined,
      picId: conversation.picId,
      picName: conversation.pic.fullname,
      picAvatar: conversation.pic.avatarColor || undefined,
      projectId: conversation.projectId,
      projectName: conversation.project?.name || null,
      lastMessage: lastMessage?.content || null,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
      createdAt: conversation.createdAt,
    };

    revalidatePath("/dashboard/chat");
    return { conversation: conversationWithParticipants };
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    return { conversation: null as any, error: "Failed to get or create conversation" };
  }
}

// Get conversation by ID
export async function getConversationById(
  conversationId: string
): Promise<{ conversation: ConversationWithParticipants | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { conversation: null, error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    // Note: We allow access even if cleared, so user can see conversation details
    // But getContacts will filter it out from the list
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
      include: {
        client: {
          select: { id: true, fullname: true, avatarColor: true },
        },
        pic: {
          select: { id: true, fullname: true, avatarColor: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!conversation) {
      return { conversation: null, error: "Conversation not found" };
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conversation.id,
        senderId: { not: user.id },
        readAt: null,
      },
    });

    // Get last message (exclude deleted)
    const lastMessage = await prisma.message.findFirst({
      where: { 
        conversationId: conversation.id,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });

    const conversationWithParticipants: ConversationWithParticipants = {
      id: conversation.id,
      clientId: conversation.clientId,
      clientName: conversation.client.fullname,
      clientAvatar: conversation.client.avatarColor || undefined,
      picId: conversation.picId,
      picName: conversation.pic.fullname,
      picAvatar: conversation.pic.avatarColor || undefined,
      projectId: conversation.projectId,
      projectName: conversation.project?.name || null,
      lastMessage: lastMessage?.content || null,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount,
      createdAt: conversation.createdAt,
    };

    return { conversation: conversationWithParticipants };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { conversation: null, error: "Failed to fetch conversation" };
  }
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string
): Promise<{ messages: MessageWithSender[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { messages: [], error: "Unauthorized" };
    }

      // Verify user has access to this conversation
      // Note: We allow access even if cleared (like WhatsApp - messages still accessible)
      // Clearing only hides conversation from contact list, not from direct access
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ clientId: user.id }, { picId: user.id }],
        },
      });

      if (!conversation) {
        return { messages: [], error: "Conversation not found" };
      }

    // Get all messages (including deleted ones, so we can show "deleted" indicator)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const messagesWithSender: MessageWithSender[] = messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: msg.sender.fullname,
      senderAvatar: msg.sender.avatarColor || undefined,
      content: msg.content,
      isDeleted: msg.isDeleted,
      editedAt: msg.editedAt,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
    }));

    return { messages: messagesWithSender };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to fetch messages" };
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ message: MessageWithSender; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { message: null as any, error: "Unauthorized" };
    }

    if (!content.trim()) {
      return { message: null as any, error: "Message content is required" };
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { message: null as any, error: "Conversation not found" };
    }

    // If conversation was cleared, un-clear it when user sends a message (like WhatsApp)
    const updateData: { 
      lastMessageAt: Date;
      clearedByClientAt?: null;
      clearedByPICAt?: null;
    } = {
      lastMessageAt: new Date(),
    };

    // Un-clear conversation for the sender (restore conversation)
    if (user.role === "client" && conversation.clientId === user.id) {
      updateData.clearedByClientAt = null;
    } else if (user.role === "pic" && conversation.picId === user.id) {
      updateData.clearedByPICAt = null;
    } else {
      // Handle edge cases
      if (conversation.clientId === user.id) {
        updateData.clearedByClientAt = null;
      } else if (conversation.picId === user.id) {
        updateData.clearedByPICAt = null;
      }
    }

    // Create message first
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    // Update conversation: un-clear and update lastMessageAt in one query
    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    const messageWithSender: MessageWithSender = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName: message.sender.fullname,
      senderAvatar: message.sender.avatarColor || undefined,
      content: message.content,
      isDeleted: message.isDeleted || false,
      editedAt: message.editedAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
    };

    revalidatePath("/dashboard/chat");
    return { message: messageWithSender };
  } catch (error) {
    console.error("Error sending message:", error);
    return { message: null as any, error: "Failed to send message" };
  }
}

// Delete a message (soft delete)
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user owns this message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
      },
    });

    if (!message) {
      return { success: false, error: "Message not found or unauthorized" };
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    // Update conversation lastMessageAt if this was the last message
    const lastMessage = await prisma.message.findFirst({
      where: {
        conversationId: message.conversationId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    await prisma.conversation.update({
      where: { id: message.conversationId },
      data: { lastMessageAt: lastMessage?.createdAt || null },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

// Edit a message
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<{ message: MessageWithSender; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { message: null as any, error: "Unauthorized" };
    }

    if (!newContent.trim()) {
      return { message: null as any, error: "Message content cannot be empty" };
    }

    // Verify user owns this message
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id,
        isDeleted: false,
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    if (!existingMessage) {
      return { message: null as any, error: "Message not found or unauthorized" };
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent.trim(),
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, fullname: true, avatarColor: true },
        },
      },
    });

    const messageWithSender: MessageWithSender = {
      id: updatedMessage.id,
      conversationId: updatedMessage.conversationId,
      senderId: updatedMessage.senderId,
      senderName: updatedMessage.sender.fullname,
      senderAvatar: updatedMessage.sender.avatarColor || undefined,
      content: updatedMessage.content,
      isDeleted: updatedMessage.isDeleted || false,
      editedAt: updatedMessage.editedAt,
      readAt: updatedMessage.readAt,
      createdAt: updatedMessage.createdAt,
    };

    revalidatePath("/dashboard/chat");
    return { message: messageWithSender };
  } catch (error) {
    console.error("Error editing message:", error);
    return { message: null as any, error: "Failed to edit message" };
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Mark all unread messages from other participants as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

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

    let contacts: Contact[] = [];

    if (user.role === "client") {
      // Client can see all PICs
      const pics = await prisma.userProfile.findMany({
        where: { role: "pic" },
        select: {
          id: true,
          fullname: true,
          avatarColor: true,
          email: true,
        },
        orderBy: { fullname: "asc" },
      });

      // Get conversations for these PICs (exclude cleared conversations for client)
      const conversations = await prisma.conversation.findMany({
        where: {
          clientId: user.id,
          picId: { in: pics.map((p) => p.id) },
          clearedByClientAt: null, // Exclude conversations cleared by client
        },
        include: {
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              isDeleted: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: user.id },
                  readAt: null,
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      const conversationMap = new Map(
        conversations.map((conv) => [conv.picId, conv])
      );

      contacts = pics.map((pic) => {
        const conv = conversationMap.get(pic.id);
        const lastMsg = conv?.messages[0];
        return {
          id: pic.id,
          name: pic.fullname,
          avatar: pic.avatarColor || undefined,
          email: pic.email,
          role: "pic" as const,
          hasConversation: !!conv,
          conversationId: conv?.id,
          lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
          lastMessageAt: conv?.lastMessageAt || undefined,
          unreadCount: conv?._count.messages || 0,
        };
      });
    } else if (user.role === "pic") {
      // PIC can see all Clients and all other PICs
      const [clients, otherPics] = await Promise.all([
        prisma.userProfile.findMany({
          where: { role: "client" },
          select: {
            id: true,
            fullname: true,
            avatarColor: true,
            email: true,
          },
          orderBy: { fullname: "asc" },
        }),
        prisma.userProfile.findMany({
          where: {
            role: "pic",
            id: { not: user.id }, // Exclude self
          },
          select: {
            id: true,
            fullname: true,
            avatarColor: true,
            email: true,
          },
          orderBy: { fullname: "asc" },
        }),
      ]);

      // Get conversations
      // For PIC-Client: clientId is client, picId is current PIC
      // For PIC-PIC: one PIC is clientId, other is picId (determined by ID sorting)
      const clientIds = clients.map((c) => c.id);
      const picIds = otherPics.map((p) => p.id);

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            // PIC-Client conversations where current user is PIC (exclude cleared by PIC)
            {
              clientId: { in: clientIds },
              picId: user.id,
              clearedByPICAt: null, // Exclude if cleared by PIC
            },
            // PIC-PIC conversations - current user as PIC (exclude cleared by PIC)
            {
              AND: [
                { clientId: { in: picIds } },
                { picId: user.id },
                { clearedByPICAt: null }, // Exclude if cleared by PIC
              ],
            },
            // PIC-PIC conversations - current user as Client (exclude cleared by client)
            {
              AND: [
                { picId: { in: picIds } },
                { clientId: user.id },
                { clearedByClientAt: null }, // Exclude if cleared by client
              ],
            },
          ],
        },
        include: {
          client: {
            select: { id: true },
          },
          pic: {
            select: { id: true },
          },
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              isDeleted: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: user.id },
                  readAt: null,
                  isDeleted: false,
                },
              },
            },
          },
        },
      });

      // Create conversation map
      // Key: other user's ID, Value: conversation
      const conversationMap = new Map<string, typeof conversations[0]>();
      conversations.forEach((conv) => {
        let otherUserId: string;
        if (conv.clientId === user.id) {
          otherUserId = conv.picId;
        } else if (conv.picId === user.id) {
          otherUserId = conv.clientId;
        } else {
          // Shouldn't happen, but skip if it does
          return;
        }
        conversationMap.set(otherUserId, conv);
      });

      // Map clients
      const clientContacts: Contact[] = clients.map((client) => {
        const conv = conversationMap.get(client.id);
        const lastMsg = conv?.messages[0];
        return {
          id: client.id,
          name: client.fullname,
          avatar: client.avatarColor || undefined,
          email: client.email,
          role: "client" as const,
          hasConversation: !!conv,
          conversationId: conv?.id,
          lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
          lastMessageAt: conv?.lastMessageAt || undefined,
          unreadCount: conv?._count.messages || 0,
        };
      });

      // Map PICs
      const picContacts: Contact[] = otherPics.map((pic) => {
        const conv = conversationMap.get(pic.id);
        const lastMsg = conv?.messages[0];
        return {
          id: pic.id,
          name: pic.fullname,
          avatar: pic.avatarColor || undefined,
          email: pic.email,
          role: "pic" as const,
          hasConversation: !!conv,
          conversationId: conv?.id,
          lastMessage: lastMsg && !lastMsg.isDeleted ? lastMsg.content : undefined,
          lastMessageAt: conv?.lastMessageAt || undefined,
          unreadCount: conv?._count.messages || 0,
        };
      });

      contacts = [...clientContacts, ...picContacts];
    } else {
      // Admin can see everyone (clients and PICs)
      const [clients, pics] = await Promise.all([
        prisma.userProfile.findMany({
          where: { role: "client" },
          select: {
            id: true,
            fullname: true,
            avatarColor: true,
            email: true,
          },
          orderBy: { fullname: "asc" },
        }),
        prisma.userProfile.findMany({
          where: { role: "pic" },
          select: {
            id: true,
            fullname: true,
            avatarColor: true,
            email: true,
          },
          orderBy: { fullname: "asc" },
        }),
      ]);

      contacts = [
        ...clients.map((c) => ({
          id: c.id,
          name: c.fullname,
          avatar: c.avatarColor || undefined,
          email: c.email,
          role: "client" as const,
          hasConversation: false,
          unreadCount: 0,
        })),
        ...pics.map((p) => ({
          id: p.id,
          name: p.fullname,
          avatar: p.avatarColor || undefined,
          email: p.email,
          role: "pic" as const,
          hasConversation: false,
          unreadCount: 0,
        })),
      ];
    }

    // Sort by: has conversation first, then by lastMessageAt, then by name
    contacts.sort((a, b) => {
      if (a.hasConversation !== b.hasConversation) {
        return a.hasConversation ? -1 : 1;
      }
      if (a.lastMessageAt && b.lastMessageAt) {
        return (
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
        );
      }
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return a.name.localeCompare(b.name);
    });

    return { contacts };
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

    const pics = await prisma.userProfile.findMany({
      where: { role: "pic" },
      select: {
        id: true,
        fullname: true,
        avatarColor: true,
        email: true,
      },
      orderBy: { fullname: "asc" },
    });

    return {
      pics: pics.map((pic) => ({
        id: pic.id,
        name: pic.fullname,
        avatar: pic.avatarColor || undefined,
        email: pic.email,
      })),
    };
  } catch (error) {
    console.error("Error fetching PICs:", error);
    return { pics: [], error: "Failed to fetch PICs" };
  }
}

// Get client's projects
export async function getClientProjects(): Promise<{
  projects: Array<{ id: string; name: string; picId: string; picName: string }>;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "client") {
      return { projects: [], error: "Unauthorized" };
    }

    const projects = await prisma.project.findMany({
      where: {
        clientId: user.id,
        status: "active",
      },
      include: {
        pic: {
          select: { id: true, fullname: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        picId: project.picId,
        picName: project.pic.fullname,
      })),
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], error: "Failed to fetch projects" };
  }
}

// Clear conversation (hide conversation for current user only, like WhatsApp)
// This doesn't delete the conversation, just marks it as cleared for the current user
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: user.id }, { picId: user.id }],
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found or unauthorized" };
    }

    // Mark conversation as cleared for the current user (doesn't delete, just hides it)
    // Like WhatsApp: clearing only affects the user who clears it
    const updateData: { clearedByClientAt?: Date; clearedByPICAt?: Date } = {};
    
    if (user.role === "client" && conversation.clientId === user.id) {
      updateData.clearedByClientAt = new Date();
    } else if (user.role === "pic" && conversation.picId === user.id) {
      updateData.clearedByPICAt = new Date();
    } else {
      // Handle edge case: PIC might be in client position in some conversations
      if (conversation.clientId === user.id) {
        updateData.clearedByClientAt = new Date();
      } else if (conversation.picId === user.id) {
        updateData.clearedByPICAt = new Date();
      }
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return { success: false, error: "Failed to clear conversation" };
  }
}
