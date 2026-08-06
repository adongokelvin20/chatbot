import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type {
  ConversationWithMessages,
  ConversationWithLatestMessage,
  ConversationStatus,
  MessageSender,
  ContentType,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationFilters {
  page?: number;
  pageSize?: number;
  status?: ConversationStatus;
  search?: string;
  unreadOnly?: boolean;
  channel?: 'web' | 'whatsapp';
}

export interface CreateConversationInput {
  customerId?: string;
  channel?: 'web' | 'whatsapp';
  customerName?: string;
  customerPhone?: string;
}

export interface AddMessageInput {
  senderType: MessageSender;
  senderId?: string;
  content: string;
  contentType?: ContentType;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List conversations for a business with optional filters and pagination.
 * Includes the latest message and unread counts for the list view.
 * Sorted by lastMessageAt desc (most recently active first).
 */
export async function getConversations(
  businessId: string,
  filters: ConversationFilters = {}
): Promise<PaginatedResponse<ConversationWithLatestMessage>> {
  const {
    page = 1,
    pageSize = 20,
    status,
    search,
    unreadOnly,
    channel,
  } = filters;

  const skip = (page - 1) * pageSize;

  const where: Prisma.ConversationWhereInput = { businessId };

  if (status) {
    where.status = status;
  }

  if (channel) {
    where.channel = channel;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      {
        messages: {
          some: {
            content: { contains: search },
          },
        },
      },
    ];
  }

  // Unread-only filter: conversations that have unread messages from the customer/AI
  if (unreadOnly) {
    where.messages = {
      some: {
        senderType: { in: ['customer'] },
        isRead: false,
      },
    };
  }

  try {
    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          customer: true,
        },
      }),
      db.conversation.count({ where }),
    ]);

    return {
      success: true,
      data: conversations,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch conversations: ${(error as Error).message}`
    );
  }
}

/**
 * Get a single conversation with all its messages ordered chronologically.
 */
export async function getConversation(
  id: string,
  businessId: string
): Promise<ConversationWithMessages | null> {
  try {
    return await db.conversation.findFirst({
      where: { id, businessId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        customer: true,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch conversation: ${(error as Error).message}`
    );
  }
}

/**
 * Create a new conversation, optionally linked to an existing customer.
 */
export async function createConversation(
  businessId: string,
  data: CreateConversationInput = {}
) {
  try {
    return await db.conversation.create({
      data: {
        businessId,
        customerId: data.customerId ?? null,
        channel: data.channel ?? 'web',
        customerName: data.customerName ?? null,
        customerPhone: data.customerPhone ?? null,
        lastMessageAt: new Date(),
      },
      include: { customer: true },
    });
  } catch (error) {
    throw new Error(
      `Failed to create conversation: ${(error as Error).message}`
    );
  }
}

/**
 * Get all messages for a conversation, ordered chronologically.
 */
export async function getMessages(conversationId: string) {
  try {
    return await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch messages: ${(error as Error).message}`
    );
  }
}

/**
 * Add a new message to a conversation.
 * Automatically updates the conversation's lastMessageAt timestamp.
 */
export async function addMessage(
  conversationId: string,
  data: AddMessageInput
) {
  try {
    const message = await db.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderType: data.senderType,
          senderId: data.senderId ?? null,
          content: data.content,
          contentType: data.contentType ?? 'text',
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      // Update conversation lastMessageAt
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      return created;
    });

    return message;
  } catch (error) {
    throw new Error(
      `Failed to add message: ${(error as Error).message}`
    );
  }
}

/**
 * Toggle between AI and human handling for a conversation.
 * When AI is deactivated (aiActive → false), a system message is inserted
 * to indicate that a human agent has taken over.
 */
export async function toggleAI(
  conversationId: string,
  aiActive: boolean
) {
  try {
    const conversation = await db.conversation.update({
      where: { id: conversationId },
      data: { aiActive },
      include: { customer: true },
    });

    // Insert a system message to signal the transition
    const systemMessage = aiActive
      ? '🤖 AI assistant has taken over the conversation.'
      : '👨‍💼 A human agent has taken over the conversation.';

    await db.message.create({
      data: {
        conversationId,
        senderType: 'system',
        content: systemMessage,
        contentType: 'text',
      },
    });

    return conversation;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Conversation not found.');
    }
    throw new Error(
      `Failed to toggle AI: ${(error as Error).message}`
    );
  }
}

/**
 * Mark all messages in a conversation as read.
 */
export async function markAsRead(conversationId: string) {
  try {
    const result = await db.message.updateMany({
      where: {
        conversationId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { markedCount: result.count };
  } catch (error) {
    throw new Error(
      `Failed to mark messages as read: ${(error as Error).message}`
    );
  }
}
