import { NextRequest, NextResponse } from 'next/server';
import { toggleAI } from '@/services/conversation.service';
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
    const body = await req.json();

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

    // If aiActive is not provided, toggle the current state
    const aiActive = body.aiActive !== undefined ? body.aiActive : !conversation.aiActive;
    const updated = await toggleAI(id, aiActive);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Conversation not found.' ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
