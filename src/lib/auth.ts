"use server";

import { db } from "@/lib/db";
import type { AuthUser, AuthSession, StaffRole } from "@/types";
import { NextResponse } from "next/server";

// ============================================================================
// NEXTAUTH v4 CONFIGURATION
// ============================================================================

/**
 * Mock user for development / demo purposes.
 * In production, replace these helpers with real NextAuth session checks
 * via `getServerSession(authOptions)`.
 *
 * To wire up a real provider later, create `src/app/api/auth/[...nextauth]/route.ts`
 * and export `authOptions` from this file.
 */

export const MOCK_USER: AuthUser = {
  id: "demo-staff-001",
  email: "demo@aisales.com",
  name: "Demo Owner",
  role: "owner",
  businessId: "demo-business-001",
  businessName: "Demo Store",
  image: null,
};

const DEMO_SESSION_EXPIRES = new Date(
  Date.now() + 24 * 60 * 60 * 1000
).toISOString();

function buildMockSession(user: AuthUser): AuthSession {
  return {
    user,
    expires: DEMO_SESSION_EXPIRES,
    accessToken: "demo-access-token",
  };
}

/**
 * Reads the AUTH_MODE environment variable.
 * - "demo"  → uses mock authentication (default for dev)
 * - "nextauth" → uses NextAuth getServerSession
 *
 * Set AUTH_MODE=nextauth in production once real providers are configured.
 */
function getAuthMode(): "demo" | "nextauth" {
  return (process.env.AUTH_MODE as "demo" | "nextauth") ?? "demo";
}

// ============================================================================
// SESSION TOKEN HELPERS
// ============================================================================

/**
 * Get the current session from the request (server-side).
 * In demo mode, returns a mock session.
 * In nextauth mode, validates the Authorization Bearer token against DB.
 */
export async function getSessionFromRequest(
  request: Request
): Promise<AuthSession | null> {
  const mode = getAuthMode();

  if (mode === "demo") {
    return buildMockSession(MOCK_USER);
  }

  // --- NextAuth token-based session (production path) ---
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const staff = await db.staff.findFirst({
      where: { id: token },
      include: { business: true },
    });

    if (!staff || staff.status !== "active") {
      return null;
    }

    const user: AuthUser = {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role as StaffRole,
      businessId: staff.businessId,
      businessName: staff.business.name,
    };

    return buildMockSession(user);
  } catch {
    return null;
  }
}

// ============================================================================
// AUTH HELPERS (Server Actions / Route Handlers)
// ============================================================================

/**
 * Get the currently authenticated user, or null if not authenticated.
 * Safe to call from any server component or API route.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const mode = getAuthMode();

  if (mode === "demo") {
    return MOCK_USER;
  }

  // In production, this is called within route handlers that pass
  // the request context. For server components, use `headers()`.
  // Fallback to mock for unresolvable contexts.
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const authHeader = headersList.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const staff = await db.staff.findFirst({
      where: { id: token },
      include: { business: true },
    });

    if (!staff || staff.status !== "active") {
      return null;
    }

    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role as StaffRole,
      businessId: staff.businessId,
      businessName: staff.business.name,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the user or throws an HTTP 401 error.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

/**
 * Require a valid business context. Returns the user or throws
 * a 403 if the user has no associated business.
 */
export async function requireBusiness(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.businessId) {
    throw new AuthError("Business context required", 403);
  }
  return user;
}

/**
 * Require the user to have the "owner" role.
 * Returns the user or throws a 403.
 */
export async function requireOwner(): Promise<AuthUser> {
  const user = await requireBusiness();
  if (user.role !== "owner") {
    throw new AuthError("Owner access required", 403);
  }
  return user;
}

/**
 * Require the user to have at least the specified role level.
 * Hierarchy: staff < admin < owner
 */
export async function requireMinimumRole(
  minimumRole: StaffRole
): Promise<AuthUser> {
  const user = await requireBusiness();
  const hierarchy: Record<StaffRole, number> = {
    staff: 0,
    admin: 1,
    owner: 2,
  };
  if (hierarchy[user.role] < hierarchy[minimumRole]) {
    throw new AuthError(
      `Requires ${minimumRole} role or higher. Current role: ${user.role}`,
      403
    );
  }
  return user;
}

// ============================================================================
// SESSION HELPERS FOR CLIENT COMPONENTS
// ============================================================================

/**
 * Fetch the current session from the client-side API.
 * Used by client components that need user info.
 */
export async function fetchSessionFromClient(): Promise<AuthSession | null> {
  try {
    const res = await fetch("/api/auth/session", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as AuthSession;
  } catch {
    return null;
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class AuthError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 401, code: string = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// ============================================================================
// AUTH RESPONSE HELPERS
// ============================================================================

/**
 * Create a standardized unauthorized response for API routes.
 */
export function unauthorizedResponse(message: string = "Authentication required") {
  return NextResponse.json(
    { success: false, error: message, code: "UNAUTHORIZED" },
    { status: 401 }
  );
}

/**
 * Create a standardized forbidden response for API routes.
 */
export function forbiddenResponse(message: string = "Insufficient permissions") {
  return NextResponse.json(
    { success: false, error: message, code: "FORBIDDEN" },
    { status: 403 }
  );
}

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

export type { AuthUser, AuthSession };
