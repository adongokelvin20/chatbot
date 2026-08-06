import { NextRequest, NextResponse } from 'next/server';
import { markAsRead } from '@/services/notification.service';
import { db } from '@/lib/db';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await getBusinessId(req); // Verify business context

    const notification = await markAsRead(id);
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Notification not found.' ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
