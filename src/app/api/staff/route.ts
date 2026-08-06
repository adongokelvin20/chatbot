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

    const staff = await db.staff.findMany({
      where: {
        businessId,
        ...(activeOnly ? { status: 'active' } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: staff });
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

    const member = await db.staff.create({
      data: {
        businessId,
        name: body.name,
        email: body.email,
        role: body.role || 'staff',
        status: body.status || 'active',
      },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
