import { NextRequest, NextResponse } from 'next/server';
import { createBusiness, completeSetup } from '@/services/business.service';
import { db } from '@/lib/db';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId: existingId, ...setupData } = body;

    let businessId: string;

    if (existingId) {
      // Complete setup for existing business
      businessId = existingId;
    } else {
      businessId = await getBusinessId(req);
    }

    // Update business fields if provided
    if (setupData.name || setupData.email || setupData.phone) {
      const { db: dbImport } = await import('@/lib/db');
      const updatePayload: Record<string, unknown> = {};
      if (setupData.name) updatePayload.name = setupData.name;
      if (setupData.email) updatePayload.email = setupData.email;
      if (setupData.phone) updatePayload.phone = setupData.phone;
      if (setupData.address) updatePayload.address = setupData.address;
      if (setupData.website) updatePayload.website = setupData.website;
      if (setupData.instagram) updatePayload.instagram = setupData.instagram;
      if (setupData.facebook) updatePayload.facebook = setupData.facebook;
      if (setupData.timezone) updatePayload.timezone = setupData.timezone;
      if (setupData.workingHours) updatePayload.workingHours = typeof setupData.workingHours === 'string' ? setupData.workingHours : JSON.stringify(setupData.workingHours);
      if (setupData.logo) updatePayload.logo = setupData.logo;

      await dbImport.business.update({
        where: { id: businessId },
        data: updatePayload,
      });
    }

    // Create categories if provided
    if (setupData.categories && Array.isArray(setupData.categories)) {
      for (const cat of setupData.categories) {
        const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await db.category.create({
          data: {
            businessId,
            name: cat.name,
            slug,
            description: cat.description || null,
          },
        });
      }
    }

    // Create delivery zones if provided
    if (setupData.deliveryZones && Array.isArray(setupData.deliveryZones)) {
      for (const zone of setupData.deliveryZones) {
        await db.deliveryZone.create({
          data: {
            businessId,
            city: zone.city,
            fee: zone.fee,
            estimatedDays: zone.estimatedDays || '3-5',
            courierNotes: zone.courierNotes || null,
          },
        });
      }
    }

    // Create payment methods if provided
    if (setupData.paymentMethods && Array.isArray(setupData.paymentMethods)) {
      for (const pm of setupData.paymentMethods) {
        await db.paymentMethod.create({
          data: {
            businessId,
            name: pm.name,
            type: pm.type,
            config: pm.config ? JSON.stringify(pm.config) : null,
          },
        });
      }
    }

    // Create FAQs if provided
    if (setupData.faqs && Array.isArray(setupData.faqs)) {
      for (const faq of setupData.faqs) {
        await db.fAQ.create({
          data: {
            businessId,
            question: faq.question,
            answer: faq.answer,
            keywords: faq.keywords ? JSON.stringify(faq.keywords) : null,
            category: faq.category || null,
          },
        });
      }
    }

    // Update AI settings if provided
    if (setupData.aiSettings) {
      const ai = setupData.aiSettings;
      await db.aISetting.update({
        where: { businessId },
        data: {
          personality: ai.personality || undefined,
          tone: ai.tone || undefined,
          greetingMessage: ai.greetingMessage || undefined,
          workingHoursReply: ai.workingHoursReply || undefined,
          autoReply: ai.autoReply !== undefined ? ai.autoReply : undefined,
          language: ai.language || undefined,
        },
      });
    }

    // Create staff/owner if provided
    if (setupData.staff && Array.isArray(setupData.staff)) {
      for (const member of setupData.staff) {
        await db.staff.create({
          data: {
            businessId,
            name: member.name,
            email: member.email,
            role: member.role || 'staff',
            status: member.status || 'active',
          },
        });
      }
    }

    // Mark setup as complete
    const business = await completeSetup(businessId);

    return NextResponse.json({ success: true, data: business, message: 'Setup completed successfully.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
