/**
 * WhatsApp Webhook API Route
 *
 * Handles inbound messages from Meta's WhatsApp Business Cloud API.
 * 
 * GET  — Webhook verification (Meta sends a challenge during setup)
 * POST — Receives incoming message events, processes them through
 *        the AI chatbot, and auto-replies via WhatsApp.
 *
 * This is the core endpoint that connects WhatsApp to your AI Sales Employee.
 * Meta calls this URL whenever a customer sends a message to your
 * WhatsApp Business number.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createConversation, addMessage } from '@/services/conversation.service';

// ---------- Helper: get WhatsApp config from DB or env ----------

async function getWhatsAppConfig() {
  // Try to get business info from DB
  const business = await db.business.findFirst();
  if (!business) {
    throw new Error('No business found in database. Please complete setup first.');
  }

  // Use env vars for WhatsApp credentials (these are set in .env)
  const apiKey = process.env.WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const businessAccountId = process.env.WA_BUSINESS_ACCOUNT_ID;
  const webhookVerifyToken = process.env.WA_WEBHOOK_VERIFY_TOKEN;
  const webhookUrl = process.env.WA_WEBHOOK_URL;

  if (!apiKey || !phoneNumberId || !webhookVerifyToken) {
    throw new Error(
      'WhatsApp is not configured. Missing required env vars: WA_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, WA_WEBHOOK_VERIFY_TOKEN'
    );
  }

  return {
    apiKey,
    phoneNumberId,
    businessAccountId: businessAccountId || '',
    webhookVerifyToken,
    webhookUrl: webhookUrl || '',
    businessId: business.id,
    businessName: business.name,
  };
}

// ---------- Helper: send WhatsApp message ----------

async function sendWhatsAppMessage(
  recipient: string,
  message: string,
  replyTo?: string
): Promise<boolean> {
  const config = await getWhatsAppConfig();
  const apiVersion = 'v21.0';

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: { body: message, preview_url: true },
  };

  if (replyTo) {
    body.context = { message_id: replyTo };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('[WhatsApp Webhook] Send reply failed:', data.error);
      return false;
    }
    console.log('[WhatsApp Webhook] Reply sent successfully');
    return true;
  } catch (error) {
    console.error('[WhatsApp Webhook] Send reply error:', error);
    return false;
  }
}

// ---------- Helper: generate AI response ----------

async function generateAIResponse(
  customerMessage: string,
  businessId: string,
  customerName?: string
): Promise<string> {
  const [business, aiSettings] = await Promise.all([
    db.business.findUnique({ where: { id: businessId } }),
    db.aISetting.findUnique({ where: { businessId } }),
  ]);

  // Check if OpenAI API key is configured
  const openaiKey = aiSettings?.apiKey || process.env.OPENAI_API_KEY;
  const model = aiSettings?.model || 'gpt-4o-mini';

  if (openaiKey) {
    // Use OpenAI for AI responses
    return await generateOpenAIResponse(
      customerMessage,
      business?.name || 'our store',
      aiSettings ? {
        personality: aiSettings.personality ?? undefined,
        tone: aiSettings.tone ?? undefined,
        greetingMessage: aiSettings.greetingMessage ?? undefined,
        language: aiSettings.language ?? undefined,
      } : null,
      openaiKey,
      model,
      customerName
    );
  }

  // Fallback: smart keyword-based response
  return generateFallbackResponse(
    customerMessage,
    business,
    aiSettings ? {
      greetingMessage: aiSettings.greetingMessage ?? undefined,
    } : null,
    customerName
  );
}

// ---------- OpenAI Integration ----------

async function generateOpenAIResponse(
  customerMessage: string,
  businessName: string,
  aiSettings: { personality?: string; tone?: string; greetingMessage?: string; language?: string } | null,
  apiKey: string,
  model: string,
  customerName?: string
): Promise<string> {
  // Build system prompt with business context
  const personality = aiSettings?.personality || 'professional';
  const tone = aiSettings?.tone || 'helpful';
  const language = aiSettings?.language || 'en';

  // Fetch business data for context
  const [products, deliveryZones, paymentMethods, faqs] = await Promise.all([
    db.product.findMany({ where: { active: true }, take: 20, include: { category: true } }),
    db.deliveryZone.findMany({ where: { active: true } }),
    db.paymentMethod.findMany({ where: { active: true } }),
    db.fAQ.findMany({ where: { active: true } }),
  ]);

  const productContext = products.map(p => 
    `- ${p.name}: $${p.salePrice ?? p.price}${p.salePrice ? ` (sale from $${p.price})` : ''}${p.description ? ` - ${p.description}` : ''}`
  ).join('\n');

  const deliveryContext = deliveryZones.map(z =>
    `- ${z.city}: $${z.fee} (${z.estimatedDays} business days)`
  ).join('\n');

  const paymentContext = paymentMethods.map(m => `- ${m.name}`).join('\n');

  const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

  const systemPrompt = `You are an AI sales assistant for "${businessName}", a clothing/branding business.

PERSONALITY: ${personality}
TONE: ${tone}
LANGUAGE: Respond in ${language === 'en' ? 'English' : language === 'ar' ? 'Arabic' : language === 'fr' ? 'French' : 'the customer\'s language'}

YOUR ROLE:
- Help customers find products, check prices, and place orders
- Answer questions about delivery, payments, returns, and sizing
- Be friendly but professional — close sales naturally
- Keep responses concise (WhatsApp messages should be short)
- Use line breaks and bullet points for readability

PRODUCTS WE SELL:
${productContext || 'No products listed yet.'}

DELIVERY OPTIONS:
${deliveryContext || 'Contact us for delivery info.'}

PAYMENT METHODS:
${paymentContext || 'Contact us for payment info.'}

FAQ:
${faqContext || 'No FAQs available yet.'}

RULES:
- Never make up prices or product details not in the list above
- If unsure, ask the customer for more details
- Always try to guide toward a sale or next step
- Keep each message under 300 words for WhatsApp
- Do NOT use markdown bold (**text**) — WhatsApp doesn't support it
${customerName ? `- The customer's name is ${customerName}` : ''}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: customerMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    return generateFallbackResponse(customerMessage, null, null, customerName);
  } catch (error) {
    console.error('[OpenAI] API call failed, using fallback:', error);
    return generateFallbackResponse(customerMessage, null, null, customerName);
  }
}

// ---------- Fallback keyword-based response ----------

function generateFallbackResponse(
  message: string,
  business: { name: string } | null,
  aiSettings: { greetingMessage?: string } | null,
  customerName?: string
): string {
  const msg = message.toLowerCase();
  const storeName = business?.name || 'our store';
  const name = customerName ? `, ${customerName}` : '';

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('salam') || msg.includes('marhaba')) {
    return aiSettings?.greetingMessage || `Hi${name}! Welcome to ${storeName}. How can I help you today?`;
  }

  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('تكلفة') || msg.includes('سعر')) {
    return `Thanks for your interest${name}! Could you tell me which product you're looking for? I'll check the price for you right away.`;
  }

  if (msg.includes('delivery') || msg.includes('shipping') || msg.includes('deliver') || msg.includes('توصيل')) {
    return `We offer delivery! Could you share your city or area so I can check the delivery fee and estimated time for you?`;
  }

  if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange') || msg.includes('استرجاع')) {
    return `We have a 30-day return policy for unworn items with tags attached. To start a return, please share your order number and I'll help you right away.`;
  }

  if (msg.includes('payment') || msg.includes('pay') || msg.includes('method') || msg.includes('دفع')) {
    return `We accept multiple payment methods. What's your preferred way to pay? I can help you choose the best option.`;
  }

  if (msg.includes('order') && (msg.includes('track') || msg.includes('status') || msg.includes('where'))) {
    return `I'd love to help track your order! Please share your order number and I'll look it up for you.`;
  }

  if (msg.includes('size') || msg.includes('sizing') || msg.includes('مقاس')) {
    return `Great question! We have sizes from XS to 3XL for most items. Which product are you interested in? I can share the specific size chart.`;
  }

  if (msg.includes('thank')) {
    return `You're very welcome${name}! Is there anything else I can help you with?`;
  }

  if (msg.includes('bye') || msg.includes('goodbye')) {
    return `Thank you for chatting with us${name}! Have a wonderful day. Feel free to reach out anytime!`;
  }

  return `Thank you for your message${name}! At ${storeName}, we're here to help.\n\nI can assist you with:\n- Product info and pricing\n- Placing an order\n- Delivery details\n- Payment methods\n- Returns and exchanges\n\nWhat would you like to know more about?`;
}

// ---------- Helper: find or create customer ----------

async function findOrCreateCustomer(
  phone: string,
  businessId: string,
  name?: string
) {
  // Find existing customer by phone
  let customer = await db.customer.findFirst({
    where: { phone, businessId },
  });

  if (!customer) {
    // Create new customer
    customer = await db.customer.create({
      data: {
        businessId,
        name: name || phone,
        phone,
        email: null,
      },
    });
  } else if (name && (!customer.name || customer.name === customer.phone)) {
    // Update name if we got it from WhatsApp contact
    await db.customer.update({
      where: { id: customer.id },
      data: { name },
    });
    customer.name = name;
  }

  return customer;
}

// ---------- Helper: find or create conversation ----------

async function findOrCreateConversation(
  customerPhone: string,
  businessId: string,
  customerName?: string,
  waMessageId?: string
) {
  // Find existing active conversation for this phone number
  let conversation = await db.conversation.findFirst({
    where: {
      businessId,
      customerPhone,
      status: 'active',
      channel: 'whatsapp',
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  if (!conversation) {
    // Create new conversation
    const customer = await findOrCreateCustomer(customerPhone, businessId, customerName);
    conversation = await createConversation(businessId, {
      customerId: customer.id,
      channel: 'whatsapp',
      customerName: customerName || customer.name,
      customerPhone,
    });
  }

  return conversation;
}

// ---------- Helper: check if auto-reply is enabled ----------

async function shouldAutoReply(businessId: string): Promise<boolean> {
  const aiSettings = await db.aISetting.findUnique({ where: { businessId } });
  return aiSettings?.autoReply !== false;
}

// =========================================================================
// ROUTE HANDLERS
// =========================================================================

/**
 * GET /api/whatsapp/webhook
 *
 * Meta sends a GET request during webhook setup to verify ownership.
 * It includes: hub.mode=subscribe, hub.verify_token=your_token, hub.challenge=random_string
 * You must respond with the challenge string exactly.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const config = await getWhatsAppConfig();

    if (mode === 'subscribe' && token === config.webhookVerifyToken && challenge) {
      console.log('[WhatsApp Webhook] Verification successful');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('[WhatsApp Webhook] Verification failed:', { mode, token, challenge });
    return NextResponse.json(
      { error: 'Verification failed. Invalid token.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('[WhatsApp Webhook] GET error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/webhook
 *
 * Meta sends a POST request for each event (message sent, delivered, read, etc.)
 * We only process "message" events from the WhatsApp Business account.
 *
 * Flow:
 * 1. Parse the incoming webhook payload
 * 2. Extract the customer's message text and phone number
 * 3. Find or create a conversation in the database
 * 4. Save the customer's message
 * 5. Generate an AI response
 * 6. Save the AI response
 * 7. Send the AI response back via WhatsApp API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta webhook structure: body.entry[].changes[].value.messages[]
    const entry = body.entry?.[0];
    if (!entry) {
      return NextResponse.json({ received: true });
    }

    const change = entry.changes?.[0];
    if (!change) {
      return NextResponse.json({ received: true });
    }

    const value = change.value;
    const messages: Array<Record<string, unknown>> = value.messages || [];

    // Only process message events (ignore delivery receipts, status updates, etc.)
    if (messages.length === 0) {
      return NextResponse.json({ received: true });
    }

    const config = await getWhatsAppConfig();

    // Process each message in the payload
    for (const msg of messages) {
      // Verify this is from our business account
      const metadata = value.metadata as Record<string, unknown> | undefined;
      if (metadata?.phone_number_id !== config.phoneNumberId) {
        console.log('[WhatsApp Webhook] Ignoring message from different phone number');
        continue;
      }

      const from = msg.from as string; // Customer's phone (WhatsApp format, e.g., "212600000000")
      const waMessageId = msg.id as string;
      const messageType = msg.type as string;
      const timestamp = msg.timestamp as string;

      // Extract text content
      let textContent = '';
      if (messageType === 'text') {
        textContent = (msg.text as Record<string, unknown>)?.body as string || '';
      } else if (messageType === 'interactive') {
        // Button reply or list reply
        const interactive = msg.interactive as Record<string, unknown>;
        textContent = (interactive?.button_reply as Record<string, unknown>)?.title as string ||
                       (interactive?.list_reply as Record<string, unknown>)?.title as string || '';
      } else if (['image', 'video', 'document', 'audio'].includes(messageType)) {
        // For media messages, note that media was received
        textContent = `[${messageType} message received]`;
      } else {
        // Unsupported message type — skip
        console.log('[WhatsApp Webhook] Unsupported message type:', messageType);
        continue;
      }

      if (!textContent.trim()) continue;

      // Get customer name from contacts array if available
      let customerName: string | undefined;
      const contacts = value.contacts as Array<Record<string, unknown>> | undefined;
      if (contacts?.[0]) {
        const profile = contacts[0].profile as Record<string, unknown> | undefined;
        customerName = profile?.name as string | undefined;
      }

      // Find or create conversation
      const conversation = await findOrCreateConversation(
        from,
        config.businessId,
        customerName,
        waMessageId
      );

      // Save customer message to database
      await addMessage(conversation.id, {
        senderType: 'customer',
        content: textContent,
        contentType: 'text',
        metadata: { waMessageId, channel: 'whatsapp' },
      });

      // Check if auto-reply is enabled
      const autoReply = await shouldAutoReply(config.businessId);

      if (autoReply && conversation.aiActive) {
        // Generate AI response
        const aiReply = await generateAIResponse(
          textContent,
          config.businessId,
          conversation.customerName || customerName
        );

        // Save AI response to database
        await addMessage(conversation.id, {
          senderType: 'ai',
          content: aiReply,
          contentType: 'text',
        });

        // Send reply back via WhatsApp
        await sendWhatsAppMessage(from, aiReply, waMessageId);
      } else {
        // Human mode: just notify (message is saved, staff will reply from dashboard)
        console.log('[WhatsApp Webhook] Message saved (human mode). Staff will reply from dashboard.');
      }
    }

    // Always return 200 quickly — Meta expects a fast response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WhatsApp Webhook] POST error:', error);
    // Still return 200 to Meta to avoid webhook being disabled
    return NextResponse.json({ received: true });
  }
}
