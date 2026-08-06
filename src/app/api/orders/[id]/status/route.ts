import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/order.service';
import { db } from '@/lib/db';
import type { OrderStatus, PaymentStatus } from '@/types';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = await getBusinessId(req);
    const body = await req.json();

    const order = await updateOrderStatus(id, businessId, body.status as OrderStatus);

    // If payment status is also provided, update it separately
    if (body.paymentStatus) {
      await db.order.update({
        where: { id },
        data: { paymentStatus: body.paymentStatus as PaymentStatus },
      });
    }

    // Refetch with full relations
    const updatedOrder = await db.order.findFirst({
      where: { id, businessId },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    const message = (error as Error).message;
    const status = message === 'Order not found.' ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
