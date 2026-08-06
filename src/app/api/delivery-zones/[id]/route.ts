import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

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

    const updateData: Prisma.DeliveryZoneUpdateInput = {};
    if (body.city !== undefined) updateData.city = body.city;
    if (body.fee !== undefined) updateData.fee = body.fee;
    if (body.estimatedDays !== undefined) updateData.estimatedDays = body.estimatedDays;
    if (body.courierNotes !== undefined) updateData.courierNotes = body.courierNotes ?? null;
    if (body.active !== undefined) updateData.active = body.active;

    const result = await db.deliveryZone.updateMany({
      where: { id, businessId },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone not found.' },
        { status: 404 }
      );
    }

    const zone = await db.deliveryZone.findUnique({ where: { id } });
    return NextResponse.json({ success: true, data: zone });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = await getBusinessId(req);

    const result = await db.deliveryZone.deleteMany({
      where: { id, businessId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Delivery zone not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery zone deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
