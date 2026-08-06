import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type {
  CustomerWithOrders,
  CreateCustomerInput,
  UpdateCustomerInput,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CustomerWithStats extends CustomerWithOrders {
  orderCount: number;
  totalSpent: number;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List customers for a business with optional search and pagination.
 * Results are sorted by createdAt desc.
 */
export async function getCustomers(
  businessId: string,
  filters: CustomerFilters = {}
): Promise<PaginatedResponse<CustomerWithStats>> {
  const { page = 1, pageSize = 20, search } = filters;

  const skip = (page - 1) * pageSize;

  const where: Prisma.CustomerWhereInput = { businessId };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ];
  }

  try {
    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          customerMemory: true,
        },
      }),
      db.customer.count({ where }),
    ]);

    const customersWithStats: CustomerWithStats[] = customers.map(
      (customer) => ({
        ...customer,
        orderCount: customer.orders.length,
        totalSpent: customer.orders.reduce(
          (sum, order) => sum + order.total,
          0
        ),
      })
    );

    return {
      success: true,
      data: customersWithStats,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch customers: ${(error as Error).message}`
    );
  }
}

/**
 * Get a single customer with order history, memory, and computed stats.
 */
export async function getCustomer(
  id: string,
  businessId: string
): Promise<CustomerWithStats | null> {
  try {
    const customer = await db.customer.findFirst({
      where: { id, businessId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true },
        },
        customerMemory: true,
      },
    });

    if (!customer) return null;

    return {
      ...customer,
      orderCount: customer.orders.length,
      totalSpent: customer.orders.reduce(
        (sum, order) => sum + order.total,
        0
      ),
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch customer: ${(error as Error).message}`
    );
  }
}

/**
 * Create a new customer. If a customer with the same phone number
 * already exists within the business, return the existing record instead.
 */
export async function createCustomer(
  businessId: string,
  data: CreateCustomerInput
) {
  try {
    // Check for existing customer by phone within the same business
    const existing = await db.customer.findFirst({
      where: { phone: data.phone, businessId },
    });

    if (existing) {
      return existing;
    }

    return await db.customer.create({
      data: {
        businessId,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        notes: data.notes ?? null,
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to create customer: ${(error as Error).message}`
    );
  }
}

/**
 * Update an existing customer's profile.
 */
export async function updateCustomer(
  id: string,
  businessId: string,
  data: UpdateCustomerInput
) {
  const updateData: Prisma.CustomerUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email ?? null;
  if (data.notes !== undefined) updateData.notes = data.notes ?? null;

  try {
    const result = await db.customer.updateMany({
      where: { id, businessId },
      data: updateData,
    });

    if (result.count === 0) {
      throw new Error('Customer not found.');
    }

    return db.customer.findFirstOrThrow({
      where: { id, businessId },
      include: { customerMemory: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Customer not found.');
    }
    if (error instanceof Error && error.message === 'Customer not found.') {
      throw error;
    }
    throw new Error(
      `Failed to update customer: ${(error as Error).message}`
    );
  }
}

/**
 * Find a customer by phone number within a specific business.
 */
export async function getCustomerByPhone(
  phone: string,
  businessId: string
) {
  try {
    return await db.customer.findFirst({
      where: { phone, businessId },
      include: { customerMemory: true },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch customer by phone: ${(error as Error).message}`
    );
  }
}

/**
 * Calculate the total lifetime value for a customer across all
 * non-cancelled orders.
 */
export async function getCustomerLifetimeValue(
  customerId: string
): Promise<number> {
  try {
    const result = await db.order.aggregate({
      where: {
        customerId,
        status: { not: 'cancelled' },
      },
      _sum: { total: true },
    });

    return result._sum.total ?? 0;
  } catch (error) {
    throw new Error(
      `Failed to calculate lifetime value: ${(error as Error).message}`
    );
  }
}
