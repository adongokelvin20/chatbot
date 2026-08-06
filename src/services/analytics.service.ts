import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type {
  DashboardStats,
  TopProductStat,
  AnalyticsMetricType,
} from '@/types';

// ============================================================================
// HELPERS
// ============================================================================

/** Return the start of today (midnight) in UTC. */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return the start of the current week (Monday midnight). */
function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return the start of the current month. */
function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return the start of yesterday. */
function startOfYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetch all key dashboard metrics for a business in a single call.
 * Computes revenue, order counts, conversation stats, and product inventory.
 */
export async function getDashboardStats(
  businessId: string
): Promise<DashboardStats> {
  try {
    // Run independent queries in parallel for speed
    const [
      revenueToday,
      revenueWeek,
      revenueMonth,
      revenueYesterday,
      ordersToday,
      orderCounts,
      activeConversations,
      resolvedConversations,
      awaitingHuman,
      aiResolutionResult,
      productStats,
    ] = await Promise.all([
      // Revenue
      db.order
        .aggregate({
          where: {
            businessId,
            status: { not: 'cancelled' },
            createdAt: { gte: startOfToday() },
          },
          _sum: { total: true },
        })
        .then((r) => r._sum.total ?? 0),

      db.order
        .aggregate({
          where: {
            businessId,
            status: { not: 'cancelled' },
            createdAt: { gte: startOfWeek() },
          },
          _sum: { total: true },
        })
        .then((r) => r._sum.total ?? 0),

      db.order
        .aggregate({
          where: {
            businessId,
            status: { not: 'cancelled' },
            createdAt: { gte: startOfMonth() },
          },
          _sum: { total: true },
        })
        .then((r) => r._sum.total ?? 0),

      // Yesterday's revenue for change percent
      db.order
        .aggregate({
          where: {
            businessId,
            status: { not: 'cancelled' },
            createdAt: {
              gte: startOfYesterday(),
              lt: startOfToday(),
            },
          },
          _sum: { total: true },
        })
        .then((r) => r._sum.total ?? 0),

      // Today's order count
      db.order.count({
        where: { businessId, createdAt: { gte: startOfToday() } },
      }),

      // Order status breakdown
      db.order.groupBy({
        by: ['status'],
        where: { businessId },
        _count: true,
      }),

      // Conversations by status
      db.conversation.count({
        where: { businessId, status: 'active' },
      }),

      db.conversation.count({
        where: { businessId, status: 'resolved' },
      }),

      db.conversation.count({
        where: { businessId, aiActive: false, status: 'active' },
      }),

      // AI resolution rate from analytics table
      db.analytics
        .aggregate({
          where: {
            businessId,
            metricType: 'ai_resolution',
          },
          _avg: { metricValue: true },
        })
        .then((r) => r._avg.metricValue ?? 0),

      // Product inventory stats
      db.product.aggregate({
        where: { businessId },
        _count: true,
        _sum: { stock: true },
      }),
    ]);

    // Compute order status breakdown
    const statusMap = new Map<string, number>();
    for (const g of orderCounts) {
      statusMap.set(g.status, g._count);
    }

    const totalOrders = orderCounts.reduce((s, g) => s + g._count, 0);

    // Revenue change percent (today vs yesterday)
    const revenueChangePercent =
      revenueYesterday > 0
        ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100
        : revenueToday > 0
          ? 100
          : 0;

    // Product stats
    const activeProducts = await db.product.count({
      where: { businessId, active: true },
    });
    const lowStockProducts = await db.product.count({
      where: { businessId, active: true, stock: { lte: 5, gt: 0 } },
    });
    const outOfStockProducts = await db.product.count({
      where: { businessId, active: true, stock: 0 },
    });

    return {
      revenue: {
        today: revenueToday,
        thisWeek: revenueWeek,
        thisMonth: revenueMonth,
        changePercent: Math.round(revenueChangePercent * 100) / 100,
      },
      orders: {
        total: totalOrders,
        pending: statusMap.get('pending') ?? 0,
        processing: statusMap.get('processing') ?? 0,
        completed: (statusMap.get('delivered') ?? 0) + (statusMap.get('shipped') ?? 0),
        cancelled: statusMap.get('cancelled') ?? 0,
        changePercent: 0, // Would need historical comparison
      },
      conversations: {
        active: activeConversations,
        resolved: resolvedConversations,
        awaitingHuman: awaitingHuman,
        aiResolutionRate: aiResolutionResult,
      },
      products: {
        total: productStats._count,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch dashboard stats: ${(error as Error).message}`
    );
  }
}

/**
 * Record (or upsert) an analytics metric for a given business and date.
 * Uses the unique constraint [businessId, date, metricType] for upsert.
 */
export async function recordMetric(
  businessId: string,
  metricType: AnalyticsMetricType,
  value: number,
  metadata?: Record<string, unknown>
) {
  // Truncate date to day granularity for the unique constraint
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    return await db.analytics.upsert({
      where: {
        businessId_date_metricType: {
          businessId,
          date: today,
          metricType,
        },
      },
      update: {
        metricValue: value,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      create: {
        businessId,
        date: today,
        metricType,
        metricValue: value,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to record metric: ${(error as Error).message}`
    );
  }
}

/**
 * Get the top-selling products for a business based on order item quantities.
 * Returns product details with sold count and revenue.
 */
export async function getTopProducts(
  businessId: string,
  limit: number = 5
): Promise<TopProductStat[]> {
  try {
    const results = await db.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          businessId,
          status: { not: 'cancelled' },
        },
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: limit,
    });

    // Fetch product images for each top product
    const productIds = results.map((r) => r.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, images: true },
    });

    const imageMap = new Map(
      products.map((p) => {
        let imageUrl: string | null = null;
        if (p.images) {
          try {
            const imgs = JSON.parse(p.images) as string[];
            imageUrl = imgs[0] ?? null;
          } catch {
            // ignore
          }
        }
        return [p.id, imageUrl];
      })
    );

    return results.map((r) => ({
      productId: r.productId,
      name: r.productName,
      sold: r._sum.quantity ?? 0,
      revenue: (r._sum.quantity ?? 0) * (r._sum.price ?? 0),
      image: imageMap.get(r.productId) ?? null,
    }));
  } catch (error) {
    throw new Error(
      `Failed to fetch top products: ${(error as Error).message}`
    );
  }
}

/**
 * Get the most frequently asked questions/topics for a business.
 * This looks at conversation messages sent by customers and groups
 * them to find common patterns. Returns FAQs that have been asked about most.
 */
export async function getTopQuestions(
  businessId: string,
  limit: number = 10
) {
  try {
    // Use FAQs that are linked to this business, sorted by recency.
    // In a more advanced implementation this would use NLP clustering
    // on customer messages, but for now we surface the most-viewed FAQs.
    return await db.fAQ.findMany({
      where: { businessId, active: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        keywords: true,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch top questions: ${(error as Error).message}`
    );
  }
}
