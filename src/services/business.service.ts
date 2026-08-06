import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { CreateBusinessInput, BusinessWithRelations } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateBusinessParams {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  timezone?: string;
  workingHours?: string;
  logo?: string;
}

export interface UpdateBusinessParams {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  timezone?: string;
  workingHours?: string;
  logo?: string;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Create a new business (tenant).
 * Initializes the business record along with default AI settings.
 */
export async function createBusiness(data: CreateBusinessParams) {
  try {
    const business = await db.business.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        address: data.address ?? null,
        website: data.website ?? null,
        instagram: data.instagram ?? null,
        facebook: data.facebook ?? null,
        timezone: data.timezone ?? 'UTC',
        workingHours: data.workingHours ?? null,
        logo: data.logo ?? null,
      },
    });

    // Initialize default AI settings for the new business
    await db.aISetting.create({
      data: {
        businessId: business.id,
      },
    });

    return business;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A business with this email already exists.');
    }
    throw error;
  }
}

/**
 * Retrieve a single business by its ID, including relation counts and settings.
 */
export async function getBusiness(id: string): Promise<BusinessWithRelations | null> {
  try {
    return await db.business.findUnique({
      where: { id },
      include: {
        staff: {
          where: { status: 'active' },
          orderBy: { createdAt: 'asc' },
        },
        aiSettings: true,
        _count: {
          select: {
            customers: true,
            products: true,
            orders: true,
            conversations: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error(`Failed to fetch business: ${(error as Error).message}`);
  }
}

/**
 * Update an existing business's profile fields.
 */
export async function updateBusiness(id: string, data: UpdateBusinessParams) {
  try {
    const updateData: Prisma.BusinessUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone ?? null;
    if (data.address !== undefined) updateData.address = data.address ?? null;
    if (data.website !== undefined) updateData.website = data.website ?? null;
    if (data.instagram !== undefined) updateData.instagram = data.instagram ?? null;
    if (data.facebook !== undefined) updateData.facebook = data.facebook ?? null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.workingHours !== undefined)
      updateData.workingHours = data.workingHours ?? null;
    if (data.logo !== undefined) updateData.logo = data.logo ?? null;

    return await db.business.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('A business with this email already exists.');
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Business not found.');
    }
    throw new Error(`Failed to update business: ${(error as Error).message}`);
  }
}

/**
 * Mark the business setup as complete.
 * Called after the onboarding wizard finishes.
 */
export async function completeSetup(businessId: string) {
  try {
    return await db.business.update({
      where: { id: businessId },
      data: { setupComplete: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new Error('Business not found.');
    }
    throw new Error(
      `Failed to complete setup: ${(error as Error).message}`
    );
  }
}

/**
 * Check whether a business has completed its onboarding setup.
 */
export async function checkSetupComplete(
  businessId: string
): Promise<boolean> {
  try {
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { setupComplete: true },
    });
    return business?.setupComplete ?? false;
  } catch (error) {
    throw new Error(
      `Failed to check setup status: ${(error as Error).message}`
    );
  }
}
