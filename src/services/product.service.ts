import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type {
  ProductWithCategory,
  CreateProductInput,
  UpdateProductInput,
  PaginatedResponse,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  featured?: boolean;
  active?: boolean;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * List products for a business with optional filtering, search, and pagination.
 * Results are sorted by createdAt desc by default.
 */
export async function getProducts(
  businessId: string,
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductWithCategory>> {
  const {
    page = 1,
    pageSize = 20,
    search,
    categoryId,
    featured,
    active,
  } = filters;

  const skip = (page - 1) * pageSize;

  const where: Prisma.ProductWhereInput = { businessId };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  if (active !== undefined) {
    where.active = active;
  }

  try {
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}

/**
 * Get a single product by ID, scoped to a business.
 */
export async function getProduct(
  id: string,
  businessId: string
): Promise<ProductWithCategory | null> {
  try {
    return await db.product.findFirst({
      where: { id, businessId },
      include: { category: true },
    });
  } catch (error) {
    throw new Error(`Failed to fetch product: ${(error as Error).message}`);
  }
}

/**
 * Create a new product for a business.
 * Arrays (images, colors, sizes) are serialised to JSON strings.
 */
export async function createProduct(
  businessId: string,
  data: CreateProductInput
) {
  try {
    return await db.product.create({
      data: {
        businessId,
        name: data.name,
        description: data.description ?? null,
        categoryId: data.categoryId ?? null,
        sku: data.sku ?? null,
        price: data.price,
        salePrice: data.salePrice ?? null,
        stock: data.stock,
        colors: data.colors ? JSON.stringify(data.colors) : null,
        sizes: data.sizes ? JSON.stringify(data.sizes) : null,
        images: data.images ? JSON.stringify(data.images) : null,
        active: data.active ?? true,
        featured: data.featured ?? false,
      },
      include: { category: true },
    });
  } catch (error) {
    throw new Error(`Failed to create product: ${(error as Error).message}`);
  }
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: string,
  businessId: string,
  data: UpdateProductInput
) {
  const updateData: Prisma.ProductUncheckedUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined)
    updateData.description = data.description ?? null;
  if (data.categoryId !== undefined)
    updateData.categoryId = data.categoryId ?? null;
  if (data.sku !== undefined) updateData.sku = data.sku ?? null;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.salePrice !== undefined)
    updateData.salePrice = data.salePrice ?? null;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.colors !== undefined)
    updateData.colors = data.colors ? JSON.stringify(data.colors) : null;
  if (data.sizes !== undefined)
    updateData.sizes = data.sizes ? JSON.stringify(data.sizes) : null;
  if (data.images !== undefined)
    updateData.images = data.images ? JSON.stringify(data.images) : null;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.featured !== undefined) updateData.featured = data.featured;

  try {
    const product = await db.product.updateMany({
      where: { id, businessId },
      data: updateData,
    });

    if (product.count === 0) {
      throw new Error('Product not found.');
    }

    return db.product.findFirstOrThrow({
      where: { id, businessId },
      include: { category: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Product not found.');
    }
    throw new Error(`Failed to update product: ${(error as Error).message}`);
  }
}

/**
 * Delete a product by ID, scoped to a business.
 */
export async function deleteProduct(id: string, businessId: string) {
  try {
    const result = await db.product.deleteMany({
      where: { id, businessId },
    });

    if (result.count === 0) {
      throw new Error('Product not found.');
    }

    return { success: true, message: 'Product deleted successfully.' };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Product not found.');
    }
    throw new Error(`Failed to delete product: ${(error as Error).message}`);
  }
}

/**
 * Duplicate (clone) a product. The cloned product will have " (Copy)" appended to
 * its name and a fresh ID. Stock is reset to 0.
 */
export async function duplicateProduct(id: string, businessId: string) {
  try {
    const original = await db.product.findFirst({
      where: { id, businessId },
    });

    if (!original) {
      throw new Error('Product not found.');
    }

    const { id: _originalId, createdAt: _, updatedAt: __, ...cloneData } =
      original;

    const duplicated = await db.product.create({
      data: {
        ...cloneData,
        name: `${original.name} (Copy)`,
        stock: 0,
      },
      include: { category: true },
    });

    return duplicated;
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found.') {
      throw error;
    }
    throw new Error(
      `Failed to duplicate product: ${(error as Error).message}`
    );
  }
}

/**
 * Toggle a product's active/inactive status.
 */
export async function toggleProductStatus(
  id: string,
  businessId: string
) {
  try {
    const product = await db.product.findFirst({
      where: { id, businessId },
      select: { active: true },
    });

    if (!product) {
      throw new Error('Product not found.');
    }

    return db.product.update({
      where: { id },
      data: { active: !product.active },
      include: { category: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found.') {
      throw error;
    }
    throw new Error(
      `Failed to toggle product status: ${(error as Error).message}`
    );
  }
}

/**
 * Toggle a product's featured flag.
 */
export async function toggleFeatured(id: string, businessId: string) {
  try {
    const product = await db.product.findFirst({
      where: { id, businessId },
      select: { featured: true },
    });

    if (!product) {
      throw new Error('Product not found.');
    }

    return db.product.update({
      where: { id },
      data: { featured: !product.featured },
      include: { category: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found.') {
      throw error;
    }
    throw new Error(
      `Failed to toggle featured: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieve products with stock at or below the given threshold.
 * Useful for triggering low-stock notifications.
 */
export async function getLowStockProducts(
  businessId: string,
  threshold: number = 5
) {
  try {
    return await db.product.findMany({
      where: {
        businessId,
        active: true,
        stock: { lte: threshold },
      },
      orderBy: { stock: 'asc' },
      include: { category: true },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch low-stock products: ${(error as Error).message}`
    );
  }
}

/**
 * Get all featured products for a business.
 * Used by the AI for product recommendations.
 */
export async function getFeaturedProducts(
  businessId: string
): Promise<ProductWithCategory[]> {
  try {
    return await db.product.findMany({
      where: {
        businessId,
        featured: true,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch featured products: ${(error as Error).message}`
    );
  }
}

/**
 * Get all active products for a business.
 * Provides the AI with the full product catalog context.
 */
export async function getActiveProducts(
  businessId: string
): Promise<ProductWithCategory[]> {
  try {
    return await db.product.findMany({
      where: {
        businessId,
        active: true,
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch active products: ${(error as Error).message}`
    );
  }
}

/**
 * Full-text search across product name, description, and SKU.
 * Optimised for the AI chat search experience.
 */
export async function searchProducts(
  businessId: string,
  query: string
): Promise<ProductWithCategory[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    return await db.product.findMany({
      where: {
        businessId,
        active: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
      take: 20,
    });
  } catch (error) {
    throw new Error(
      `Failed to search products: ${(error as Error).message}`
    );
  }
}
