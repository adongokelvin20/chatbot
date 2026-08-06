import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/services/product.service';
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

    const filters = {
      page: Number(url.searchParams.get('page')) || 1,
      pageSize: Number(url.searchParams.get('pageSize')) || 20,
      search: url.searchParams.get('search') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      featured: url.searchParams.get('featured') === 'true' ? true : url.searchParams.get('featured') === 'false' ? false : undefined,
      active: url.searchParams.get('active') === 'true' ? true : url.searchParams.get('active') === 'false' ? false : undefined,
    };

    const result = await getProducts(businessId, filters);
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

    const product = await createProduct(businessId, body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
