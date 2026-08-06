import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, getUnreadCount } from '@/services/notification.service';
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
    const includeUnreadCount = url.searchParams.get('unreadCount') === 'true';

    const notifications = await getNotifications(businessId);

    const response: Record<string, unknown> = {
      success: true,
      data: notifications,
    };

    if (includeUnreadCount) {
      const unreadCount = await getUnreadCount(businessId);
      response.unreadCount = unreadCount;
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
