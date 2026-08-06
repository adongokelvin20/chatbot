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

    const methods = await db.paymentMethod.findMany({
      where: { businessId, ...(activeOnly ? { active: true } : {}) },
      orderBy: { createdAt: 'asc' },
    });

    // Parse config JSON for each method
    const parsed = methods.map((m) => ({
      ...m,
      config: m.config ? JSON.parse(m.config) : null,
    }));

    return NextResponse.json({ success: true, data: parsed });
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

    const method = await db.paymentMethod.create({
      data: {
        businessId,
        name: body.name,
        type: body.type,
        config: body.config ? JSON.stringify(body.config) : null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    const parsed = {
      ...method,
      config: method.config ? JSON.parse(method.config) : null,
    };

    return NextResponse.json({ success: true, data: parsed }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
