import { NextRequest, NextResponse } from 'next/server';
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
    const activeOnly = url.searchParams.get('active') !== 'false';

    const zones = await db.deliveryZone.findMany({
      where: { businessId, ...(activeOnly ? { active: true } : {}) },
      orderBy: { city: 'asc' },
    });

    return NextResponse.json({ success: true, data: zones });
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

    const zone = await db.deliveryZone.create({
      data: {
        businessId,
        city: body.city,
        fee: body.fee,
        estimatedDays: body.estimatedDays || '3-5',
        courierNotes: body.courierNotes || null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    return NextResponse.json({ success: true, data: zone }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
