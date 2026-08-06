import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Check if a business already exists
    const existing = await db.business.findFirst();
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'A business already exists. Please use the settings page to update your business information.',
        existingBusinessId: existing.id,
      });
    }

    // ---- Create Business ----
    const business = await db.business.create({
      data: {
        name: 'My Business',
        email: 'owner@business.com',
        phone: '',
        address: '',
        website: '',
        instagram: '',
        facebook: '',
        timezone: 'UTC',
        setupComplete: false,
      },
    });

    const businessId = business.id;

    // ---- Create Owner Staff ----
    await db.staff.create({
      data: {
        businessId,
        name: 'Business Owner',
        email: 'owner@business.com',
        role: 'owner',
        status: 'active',
      },
    });

    // ---- Create default AI Settings ----
    await db.aISetting.create({
      data: {
        businessId,
        personality: 'professional',
        tone: 'helpful',
        greetingMessage: 'Hello! Welcome to our store. How can I help you today?',
        workingHoursReply: 'We are currently closed. Please leave a message and we will get back to you during business hours.',
        autoReply: true,
        language: 'en',
        model: 'gpt-4o-mini',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Business created successfully. Complete your setup in Settings.',
      data: {
        businessId: business.id,
        businessName: business.name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
