import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { NotificationType, NotificationPayload } from '@/types';

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List all notifications for a business, newest first.
 */
export async function getNotifications(businessId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse metadata JSON for each notification
    return notifications.map((n) => ({
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      read: n.read,
      metadata: n.metadata ? parseMetadata(n.metadata) : null,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch notifications: ${(error as Error).message}`
    );
  }
}

/**
 * Create a new notification for a business.
 * Metadata is serialised as a JSON string for storage.
 */
export async function createNotification(
  businessId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  try {
    const notification = await db.notification.create({
      data: {
        businessId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata
        ? parseMetadata(notification.metadata)
        : null,
      createdAt: notification.createdAt.toISOString(),
    };
  } catch (error) {
    throw new Error(
      `Failed to create notification: ${(error as Error).message}`
    );
  }
}

/**
 * Mark a single notification as read by its ID.
 */
export async function markAsRead(id: string) {
  try {
    const notification = await db.notification.update({
      where: { id },
      data: { read: true },
    });

    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata
        ? parseMetadata(notification.metadata)
        : null,
      createdAt: notification.createdAt.toISOString(),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Notification not found.');
    }
    throw new Error(
      `Failed to mark notification as read: ${(error as Error).message}`
    );
  }
}

/**
 * Mark all unread notifications for a business as read.
 * Returns the count of notifications that were marked.
 */
export async function markAllAsRead(businessId: string) {
  try {
    const result = await db.notification.updateMany({
      where: { businessId, read: false },
      data: { read: true },
    });

    return { markedCount: result.count };
  } catch (error) {
    throw new Error(
      `Failed to mark all notifications as read: ${(error as Error).message}`
    );
  }
}

/**
 * Get the count of unread notifications for a business.
 */
export async function getUnreadCount(businessId: string): Promise<number> {
  try {
    return await db.notification.count({
      where: { businessId, read: false },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch unread count: ${(error as Error).message}`
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Safely parse a JSON metadata string into a typed object.
 */
function parseMetadata(
  raw: string
): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
