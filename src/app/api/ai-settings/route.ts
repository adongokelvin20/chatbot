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

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);

    let settings = await db.aISetting.findUnique({
      where: { businessId },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await db.aISetting.create({
        data: { businessId },
      });
    }

    return NextResponse.json({ success: true, data: settings });
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

    const updateData: Prisma.AISettingUpdateInput = {};
    if (body.personality !== undefined) updateData.personality = body.personality;
    if (body.tone !== undefined) updateData.tone = body.tone;
    if (body.greetingMessage !== undefined) updateData.greetingMessage = body.greetingMessage ?? null;
    if (body.workingHoursReply !== undefined) updateData.workingHoursReply = body.workingHoursReply ?? null;
    if (body.autoReply !== undefined) updateData.autoReply = body.autoReply;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.apiKey !== undefined) updateData.apiKey = body.apiKey ?? null;
    if (body.model !== undefined) updateData.model = body.model;

    // Upsert: update if exists, create if not
    const existing = await db.aISetting.findUnique({
      where: { businessId },
    });

    let settings;
    if (existing) {
      settings = await db.aISetting.update({
        where: { businessId },
        data: updateData,
      });
    } else {
      settings = await db.aISetting.create({
        data: { businessId, ...updateData } as Prisma.AISettingCreateInput,
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
