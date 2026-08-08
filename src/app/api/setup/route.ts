import { NextRequest, NextResponse } from 'next/server';
import { db, autoInitDatabase } from '@/lib/db';

/**
 * ONE-CLICK SETUP: /api/setup
 * 
 * This endpoint does everything:
 * 1. Auto-creates database tables (PostgreSQL)
 * 2. Seeds Ghana business data (owner, AI settings, payment methods, delivery zones, FAQs)
 * 
 * Just visit this URL after deploying to Vercel. That's it.
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Create tables
    await autoInitDatabase();

    // Step 2: Check if business already exists
    const existing = await db.business.findFirst();
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Business already exists. Setup is complete!',
        businessId: existing.id,
        businessName: existing.name,
      });
    }

    // Step 3: Create Business (Ghana defaults)
    const business = await db.business.create({
      data: {
        name: 'My Business',
        email: 'owner@business.com',
        phone: '+233',
        address: '',
        website: '',
        instagram: '',
        facebook: '',
        timezone: 'Africa/Accra',
        setupComplete: false,
      },
    });

    const businessId = business.id;

    // Step 4: Create Owner
    await db.staff.create({
      data: {
        businessId,
        name: 'Business Owner',
        email: 'owner@business.com',
        role: 'owner',
        status: 'active',
      },
    });

    // Step 5: Create AI Settings
    await db.aISetting.create({
      data: {
        businessId,
        personality: 'friendly',
        tone: 'helpful',
        greetingMessage: "Hello! Welcome! I'm your AI sales assistant. What can I help you find today?",
        workingHoursReply: "Sorry, we're currently closed. Please leave a message and we'll get back to you first thing. Thank you!",
        autoReply: true,
        language: 'en',
        model: 'gpt-4o-mini',
      },
    });

    // Step 6: Create Ghana Payment Methods
    const paymentMethods = [
      { name: 'MTN Mobile Money', type: 'mobile_money', isActive: true },
      { name: 'Vodafone Cash', type: 'mobile_money', isActive: true },
      { name: 'ATM/AirtelTigo Money', type: 'mobile_money', isActive: true },
      { name: 'Bank Transfer', type: 'bank_transfer', isActive: true },
      { name: 'Cash on Delivery', type: 'cash', isActive: true },
    ];

    for (const pm of paymentMethods) {
      await db.paymentMethod.create({
        data: {
          businessId,
          name: pm.name,
          type: pm.type,
          active: pm.isActive,
        },
      });
    }

    // Step 7: Create Ghana Delivery Zones
    const zones = [
      { city: 'Accra', fee: 15, estimatedDays: '1-2' },
      { city: 'Tema', fee: 15, estimatedDays: '1-2' },
      { city: 'Kumasi', fee: 25, estimatedDays: '2-3' },
      { city: 'Takoradi', fee: 30, estimatedDays: '2-3' },
      { city: 'Tamale', fee: 40, estimatedDays: '3-5' },
      { city: 'Cape Coast', fee: 30, estimatedDays: '2-3' },
      { city: 'Sunyani', fee: 35, estimatedDays: '3-4' },
      { city: 'Koforidua', fee: 25, estimatedDays: '2-3' },
      { city: 'Ho', fee: 30, estimatedDays: '2-3' },
      { city: 'Wa', fee: 50, estimatedDays: '4-5' },
      { city: 'Bolgatanga', fee: 50, estimatedDays: '4-5' },
    ];

    for (const z of zones) {
      await db.deliveryZone.create({
        data: {
          businessId,
          city: z.city,
          fee: z.fee,
          estimatedDays: z.estimatedDays,
          active: true,
        },
      });
    }

    // Step 8: Create Sample FAQs
    const faqs = [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept MTN Mobile Money, Vodafone Cash, ATM/AirtelTigo Money, Bank Transfer, and Cash on Delivery.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Accra and Tema: 1-2 business days. Kumasi and other major cities: 2-3 days. Remote areas: 3-5 days.',
      },
      {
        question: 'Do you deliver across Ghana?',
        answer: 'Yes! We deliver to all 16 regions in Ghana. Delivery fees vary by location.',
      },
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days for unworn items with original tags. Items must be in their original condition.',
      },
      {
        question: 'Can I pay on delivery?',
        answer: 'Yes! Cash on Delivery is available for all locations within Accra and Kumasi.',
      },
    ];

    for (const faq of faqs) {
      await db.fAQ.create({
        data: {
          businessId,
          question: faq.question,
          answer: faq.answer,
          active: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Setup complete! Your AI Sales Employee is ready.',
      data: {
        businessId: business.id,
        businessName: business.name,
        paymentMethodsCount: paymentMethods.length,
        deliveryZonesCount: zones.length,
        faqsCount: faqs.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/** GET — Check if setup is needed */
export async function GET() {
  try {
    await autoInitDatabase();
    const business = await db.business.findFirst();
    
    if (business) {
      return NextResponse.json({
        setup: true,
        businessId: business.id,
        businessName: business.name,
        message: 'Already set up and ready!',
      });
    }
    
    return NextResponse.json({
      setup: false,
      message: 'Setup needed. Send a POST request to /api/setup to initialize.',
    });
  } catch (error) {
    return NextResponse.json({
      setup: false,
      error: (error as Error).message,
      message: 'Database connection failed. Check DATABASE_URL.',
    });
  }
}
