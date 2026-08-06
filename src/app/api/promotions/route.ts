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

    const promotions = await db.promotion.findMany({
      where: {
        businessId,
        ...(activeOnly ? { active: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: promotions });
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

    const promotion = await db.promotion.create({
      data: {
        businessId,
        name: body.name,
        type: body.type,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minOrder: body.minOrder ?? null,
        maxDiscount: body.maxDiscount ?? null,
        code: body.code ?? null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        autoApply: body.autoApply ?? false,
        description: body.description ?? null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    return NextResponse.json({ success: true, data: promotion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
