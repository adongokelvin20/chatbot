import { NextRequest, NextResponse } from 'next/server';
import { getConversations, createConversation } from '@/services/conversation.service';
import { db } from '@/lib/db';
import type { ConversationStatus } from '@/types';

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

    const filters = {
      page: Number(url.searchParams.get('page')) || 1,
      pageSize: Number(url.searchParams.get('pageSize')) || 20,
      status: (url.searchParams.get('status') as ConversationStatus) || undefined,
      search: url.searchParams.get('search') || undefined,
      unreadOnly: url.searchParams.get('unreadOnly') === 'true',
      channel: (url.searchParams.get('channel') as 'web' | 'whatsapp') || undefined,
    };

    const result = await getConversations(businessId, filters);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const body = await req.json();

    const conversation = await createConversation(businessId, body);
    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
