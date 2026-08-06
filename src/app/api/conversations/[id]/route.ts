import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/services/conversation.service';
import { db } from '@/lib/db';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = await getBusinessId(req);
    const conversation = await getConversation(id, businessId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    // Count unread messages
    const unreadCount = conversation.messages.filter(
      (m) => m.senderType === 'customer' && !m.isRead
    ).length;

    return NextResponse.json({
      success: true,
      data: conversation,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
