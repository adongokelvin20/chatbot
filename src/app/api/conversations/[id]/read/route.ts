import { NextRequest, NextResponse } from 'next/server';
import { markAsRead } from '@/services/conversation.service';
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
    const businessId = await getBusinessId(req);

    // Verify conversation belongs to this business
    const conversation = await db.conversation.findFirst({
      where: { id, businessId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    const result = await markAsRead(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
