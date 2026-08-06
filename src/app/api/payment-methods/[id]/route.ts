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

    const updateData: Prisma.PaymentMethodUpdateInput = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.config !== undefined) updateData.config = body.config ? JSON.stringify(body.config) : null;
    if (body.active !== undefined) updateData.active = body.active;

    const result = await db.paymentMethod.updateMany({
      where: { id, businessId },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found.' },
        { status: 404 }
      );
    }

    const method = await db.paymentMethod.findUnique({ where: { id } });
    const parsed = {
      ...method!,
      config: method!.config ? JSON.parse(method!.config) : null,
    };

    return NextResponse.json({ success: true, data: parsed });
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

    const result = await db.paymentMethod.deleteMany({
      where: { id, businessId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
