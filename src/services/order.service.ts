import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type {
  OrderWithItems,
  CreateOrderInput,
  CreateOrderItemInput,
  OrderStatus,
  DeliveryAddress,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface OrderFilters {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  paymentStatus?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate a human-readable order number: ORD-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${datePart}-${rand}`;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List orders for a business with optional filters, date range, and pagination.
 * Results are sorted by createdAt desc.
 */
export async function getOrders(
  businessId: string,
  filters: OrderFilters = {}
): Promise<PaginatedResponse<OrderWithItems>> {
  const {
    page = 1,
    pageSize = 20,
    status,
    startDate,
    endDate,
    search,
    paymentStatus,
  } = filters;

  const skip = (page - 1) * pageSize;

  const where: Prisma.OrderWhereInput = { businessId };

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Prisma.DateTimeNullableFilter).gte = startDate;
    if (endDate) (where.createdAt as Prisma.DateTimeNullableFilter).lte = endDate;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { customerEmail: { contains: search } },
    ];
  }

  try {
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      }),
      db.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch orders: ${(error as Error).message}`);
  }
}

/**
 * Get a single order with its items and customer, scoped to a business.
 */
export async function getOrder(
  id: string,
  businessId: string
): Promise<OrderWithItems | null> {
  try {
    return await db.order.findFirst({
      where: { id, businessId },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  } catch (error) {
    throw new Error(`Failed to fetch order: ${(error as Error).message}`);
  }
}

/**
 * Create a new order with line items inside a Prisma transaction.
 * Automatically generates a unique order number and computes totals.
 * Updates customer totalSpent and totalOrders if a customer is linked.
 */
export async function createOrder(
  businessId: string,
  data: CreateOrderInput
) {
  const orderNumber = generateOrderNumber();

  // Calculate subtotal from items
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 0; // Can be calculated from delivery zones in future
  const discount = data.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  try {
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const createdOrder = await tx.order.create({
        data: {
          businessId,
          customerId: data.customerId ?? null,
          orderNumber,
          status: 'pending',
          subtotal,
          deliveryFee,
          discount,
          total,
          paymentMethod: data.paymentMethod ?? null,
          paymentStatus: 'pending',
          deliveryAddress: data.deliveryAddress
            ? JSON.stringify(data.deliveryAddress)
            : null,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail ?? null,
          notes: data.notes ?? null,
          source: data.source ?? 'ai',
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              color: item.color ?? null,
              size: item.size ?? null,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });

      // Deduct stock for each item
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update customer stats if a customer is linked
      if (data.customerId) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
            lastInteraction: new Date(),
          },
        });
      }

      return createdOrder;
    });

    return order;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Order number collision — extremely unlikely but handle gracefully
      throw new Error(
        'Order number collision. Please try again.'
      );
    }
    throw new Error(`Failed to create order: ${(error as Error).message}`);
  }
}

/**
 * Update the status (and optionally the payment status) of an order.
 * If the order is cancelled, stock is restored for each line item.
 */
export async function updateOrderStatus(
  id: string,
  businessId: string,
  status: OrderStatus
) {
  try {
    // Fetch current order to detect cancellation
    const existing = await db.order.findFirst({
      where: { id, businessId },
      include: { items: true },
    });

    if (!existing) {
      throw new Error('Order not found.');
    }

    const order = await db.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({
        where: { id, businessId },
        data: { status },
      });

      if (updated.count === 0) {
        throw new Error('Order not found.');
      }

      // Restore stock if order is being cancelled
      if (status === 'cancelled' && existing.status !== 'cancelled') {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Deduct from customer totals if a customer is linked
        if (existing.customerId) {
          await tx.customer.update({
            where: { id: existing.customerId },
            data: {
              totalOrders: { decrement: 1 },
              totalSpent: { decrement: existing.total },
            },
          });
        }
      }

      // Mark as paid when delivered
      if (status === 'delivered') {
        await tx.order.update({
          where: { id },
          data: { paymentStatus: 'paid' },
        });
      }

      return tx.order.findFirstOrThrow({
        where: { id, businessId },
        include: {
          items: { include: { product: true } },
          customer: true,
        },
      });
    });

    return order;
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found.') {
      throw error;
    }
    throw new Error(
      `Failed to update order status: ${(error as Error).message}`
    );
  }
}

/**
 * Get the count of orders placed today for a business.
 * Used for real-time dashboard analytics.
 */
export async function getTodayOrders(
  businessId: string
): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    return await db.order.count({
      where: {
        businessId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch today's orders: ${(error as Error).message}`
    );
  }
}

/**
 * Calculate total revenue for a business within an optional date range.
 * Excludes cancelled orders from the calculation.
 */
export async function getRevenue(
  businessId: string,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  const where: Prisma.OrderWhereInput = {
    businessId,
    status: { not: 'cancelled' },
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Prisma.DateTimeNullableFilter).gte = startDate;
    if (endDate) (where.createdAt as Prisma.DateTimeNullableFilter).lte = endDate;
  }

  try {
    const result = await db.order.aggregate({
      where,
      _sum: { total: true },
    });

    return result._sum.total ?? 0;
  } catch (error) {
    throw new Error(
      `Failed to calculate revenue: ${(error as Error).message}`
    );
  }
}
