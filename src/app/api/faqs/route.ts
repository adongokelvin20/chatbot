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
    const category = url.searchParams.get('category') || undefined;

    const faqs = await db.fAQ.findMany({
      where: {
        businessId,
        ...(activeOnly ? { active: true } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse keywords JSON
    const parsed = faqs.map((f) => ({
      ...f,
      keywords: f.keywords ? JSON.parse(f.keywords) : null,
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

    const faq = await db.fAQ.create({
      data: {
        businessId,
        question: body.question,
        answer: body.answer,
        keywords: body.keywords ? JSON.stringify(body.keywords) : null,
        category: body.category || null,
        active: body.active !== undefined ? body.active : true,
      },
    });

    const parsed = {
      ...faq,
      keywords: faq.keywords ? JSON.parse(faq.keywords) : null,
    };

    return NextResponse.json({ success: true, data: parsed }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
