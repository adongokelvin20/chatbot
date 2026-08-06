import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/services/order.service';
import { db } from '@/lib/db';
import type { OrderStatus } from '@/types';

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
    const order = await getOrder(id, businessId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = await getBusinessId(req);
    const body = await req.json();

    // Support full status update from body
    if (body.status) {
      const order = await updateOrderStatus(id, businessId, body.status as OrderStatus);
      return NextResponse.json({ success: true, data: order });
    }

    // Fallback: return current order if no status change
    const order = await getOrder(id, businessId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Order not found.' ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
