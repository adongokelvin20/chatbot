import { NextResponse } from 'next/server';
import { db, autoInitDatabase } from '@/lib/db';

/**
 * /api/health — Diagnostic endpoint
 * Visit this to check: database connection, table status, business data
 */
export async function GET() {
  const result: Record<string, string | boolean | number | null> = {};

  // 1. Check DATABASE_URL
  result.databaseUrl = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').substring(0, 80) + '...'
    : 'MISSING';
  result.isPostgres = (process.env.DATABASE_URL || '').startsWith('postgresql') || (process.env.DATABASE_URL || '').startsWith('postgres');

  // 2. Check Green API
  result.greenApiInstanceId = process.env.GREEN_API_INSTANCE_ID || 'MISSING';
  result.greenApiToken = process.env.GREEN_API_TOKEN ? 'SET' : 'MISSING';

  // 3. Try database connection
  try {
    await autoInitDatabase();
    result.dbConnected = true;

    // 4. Check for business
    const business = await db.business.findFirst();
    result.hasBusiness = !!business;
    result.businessName = business?.name || null;
    result.businessId = business?.id || null;

    // 5. Count records
    const counts = await db.$queryRawUnsafe(`
      SELECT 
        (SELECT COUNT(*) FROM "Staff") as staff,
        (SELECT COUNT(*) FROM "Product") as products,
        (SELECT COUNT(*) FROM "Category") as categories,
        (SELECT COUNT(*) FROM "Customer") as customers,
        (SELECT COUNT(*) FROM "Order") as orders,
        (SELECT COUNT(*) FROM "Conversation") as conversations,
        (SELECT COUNT(*) FROM "DeliveryZone") as deliveryZones,
        (SELECT COUNT(*) FROM "PaymentMethod") as paymentMethods,
        (SELECT COUNT(*) FROM "FAQ") as faqs,
        (SELECT COUNT(*) FROM "AISetting") as aiSettings
    `) as any[];

    Object.assign(result, counts?.[0] || {});

    result.status = 'healthy';
  } catch (error) {
    result.dbConnected = false;
    result.dbError = (error as Error).message;
    result.status = 'unhealthy';
  }

  return NextResponse.json(result);
}
