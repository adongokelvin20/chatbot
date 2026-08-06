import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/services/order.service';
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

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const url = new URL(req.url);

    const filters = {
      page: Number(url.searchParams.get('page')) || 1,
      pageSize: Number(url.searchParams.get('pageSize')) || 20,
      status: (url.searchParams.get('status') as OrderStatus) || undefined,
      search: url.searchParams.get('search') || undefined,
      paymentStatus: url.searchParams.get('paymentStatus') || undefined,
      startDate: url.searchParams.get('startDate') ? new Date(url.searchParams.get('startDate')!) : undefined,
      endDate: url.searchParams.get('endDate') ? new Date(url.searchParams.get('endDate')!) : undefined,
    };

    const result = await getOrders(businessId, filters);
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

    const order = await createOrder(businessId, body);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
