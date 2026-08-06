import { NextRequest, NextResponse } from 'next/server';
import { markAllAsRead } from '@/services/notification.service';
import { db } from '@/lib/db';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);

    const result = await markAllAsRead(businessId);
    return NextResponse.json({
      success: true,
      data: result,
      message: `Marked ${result.markedCount} notifications as read.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
