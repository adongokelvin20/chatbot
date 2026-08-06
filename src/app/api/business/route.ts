import { NextRequest, NextResponse } from 'next/server';
import { getBusiness, updateBusiness } from '@/services/business.service';
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
    const business = await getBusiness(businessId);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const body = await req.json();

    const business = await updateBusiness(businessId, body);
    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
