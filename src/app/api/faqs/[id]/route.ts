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

    const updateData: Prisma.FAQUpdateInput = {};
    if (body.question !== undefined) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.keywords !== undefined) updateData.keywords = body.keywords ? JSON.stringify(body.keywords) : null;
    if (body.category !== undefined) updateData.category = body.category ?? null;
    if (body.active !== undefined) updateData.active = body.active;

    const result = await db.fAQ.updateMany({
      where: { id, businessId },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found.' },
        { status: 404 }
      );
    }

    const faq = await db.fAQ.findUnique({ where: { id } });
    const parsed = {
      ...faq!,
      keywords: faq!.keywords ? JSON.parse(faq!.keywords) : null,
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

    const result = await db.fAQ.deleteMany({
      where: { id, businessId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
