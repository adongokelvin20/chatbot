import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, getTopProducts } from '@/services/analytics.service';
import { db } from '@/lib/db';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const url = new URL(req.url);
    const includeTopProducts = url.searchParams.get('topProducts') !== 'false';
    const topProductLimit = Number(url.searchParams.get('topProductLimit')) || 5;

    const [stats, topProducts] = await Promise.all([
      getDashboardStats(businessId),
      includeTopProducts ? getTopProducts(businessId, topProductLimit) : Promise.resolve([]),
    ]);

    // Fetch recent analytics data for charts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const analyticsData = await db.analytics.findMany({
      where: {
        businessId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Group analytics by metric type for chart rendering
    const metricsByType: Record<string, { date: string; value: number }[]> = {};
    for (const a of analyticsData) {
      const dateStr = a.date.toISOString().split('T')[0];
      if (!metricsByType[a.metricType]) {
        metricsByType[a.metricType] = [];
      }
      metricsByType[a.metricType].push({
        date: dateStr,
        value: a.metricValue,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        topProducts,
        charts: metricsByType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
