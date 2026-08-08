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

/**
 * Mock AI chat endpoint.
 * Returns a simulated AI response for demo purposes.
 * The real AI service will be implemented separately.
 */
export async function POST(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const body = await req.json();
    const { customerMessage, conversationId, customerPhone, customerName } = body;

    // Fetch business info and AI settings for context
    const [business, aiSettings] = await Promise.all([
      db.business.findUnique({ where: { id: businessId } }),
      db.aISetting.findUnique({ where: { businessId } }),
    ]);

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found.' },
        { status: 404 }
      );
    }

    // Generate a mock AI response based on message content
    const message = (customerMessage || '').toLowerCase();
    let reply: string;
    let contentType: string = 'text';
    let metadata: Record<string, unknown> | undefined;

    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      // Try to find a relevant product
      const products = await db.product.findMany({
        where: { businessId, active: true },
        take: 3,
        include: { category: true },
      });

      reply = `Here are some of our products and their prices:\n\n` +
        products.map((p) => `\u2022 ${p.name} - GH\u20b5${p.salePrice ?? p.price}${p.salePrice ? ` (was GH\u20b5${p.price})` : ''}`).join('\n') +
        `\n\nWould you like to know more about any of these items?`;
    } else if (message.includes('delivery') || message.includes('shipping') || message.includes('ship')) {
      const zones = await db.deliveryZone.findMany({
        where: { businessId, active: true },
      });

      reply = `Here are our delivery options:\n\n` +
        zones.map((z) => `\u2022 ${z.city} - GH\u20b5${z.fee} (${z.estimatedDays} business days)`).join('\n') +
        `\n\nWhich city would you like your order delivered to?`;
    } else if (message.includes('return') || message.includes('refund') || message.includes('exchange')) {
      reply = `We offer a 7-day return policy for unworn items with tags attached.\n\nTo initiate a return, please provide your order number and I will help you get started!`;
    } else if (message.includes('payment') || message.includes('pay') || message.includes('momo')) {
      const methods = await db.paymentMethod.findMany({
        where: { businessId, active: true },
      });

      reply = `We accept the following payment methods:\n\n` +
        methods.map((m) => `\u2022 ${m.name}`).join('\n') +
        `\n\nWhich payment method would you prefer?`;
    } else if (message.includes('order') && (message.includes('track') || message.includes('status') || message.includes('where'))) {
      reply = `I would be happy to help you track your order! Could you please provide your order number? It should look like ORD-XXXXXXXX-XXXX.`;
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greeting = aiSettings?.greetingMessage || `Hi there! Welcome to ${business.name}. How can I help you today?`;
      reply = greeting;
    } else if (message.includes('thank')) {
      reply = `You are very welcome${customerName ? `, ${customerName}` : ''}! Is there anything else I can help you with?`;
    } else if (message.includes('bye') || message.includes('goodbye')) {
      reply = `Thank you for chatting with us! Have a wonderful day${customerName ? `, ${customerName}` : ''}! Feel free to come back anytime.`;
    } else {
      // Default response
      reply = `Thank you for your message! I would be happy to help you with that. ` +
        (business.name ? `At **${business.name}**, ` : '') +
        `we strive to provide the best service.\n\n` +
        `Could you tell me more about what you are looking for? I can help with:\n` +
        `• Product information and pricing\n` +
        `• Order placement and tracking\n` +
        `• Delivery information\n` +
        `• Payment methods\n` +
        `• Returns and exchanges`;
    }

    // If conversationId is provided, save the messages
    let savedAiMessage: { id: string } | null = null;
    if (conversationId) {
      // Save customer message if not already saved
      await db.message.create({
        data: {
          conversationId,
          senderType: 'customer',
          content: customerMessage,
          contentType: 'text',
        },
      });

      // Save AI response
      savedAiMessage = await db.message.create({
        data: {
          conversationId,
          senderType: 'ai',
          content: reply,
          contentType: contentType as 'text' | 'image' | 'product_card' | 'order_card',
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // Update conversation lastMessageAt
      await db.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        contentType,
        metadata,
        messageId: savedAiMessage?.id,
        conversationId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
