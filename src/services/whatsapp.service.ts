/**
 * WhatsApp Service — Shared Business Logic
 *
 * Used by both Meta Cloud API and Twilio webhook routes.
 * Handles: conversation management, AI response generation, message persistence.
 */

import { db } from '@/lib/db';
import { createConversation, addMessage } from '@/services/conversation.service';

// ---------- Types ----------

export interface WhatsAppProviderType {
  meta: 'meta';
  twilio: 'twilio';
}

// ---------- Find or Create Customer ----------

export async function findOrCreateCustomer(
  phone: string,
  businessId: string,
  name?: string
) {
  let customer = await db.customer.findFirst({
    where: { phone, businessId },
  });

  if (!customer) {
    customer = await db.customer.create({
      data: {
        businessId,
        name: name || phone,
        phone,
        email: null,
      },
    });
  } else if (name && (!customer.name || customer.name === customer.phone)) {
    await db.customer.update({
      where: { id: customer.id },
      data: { name },
    });
    customer.name = name;
  }

  return customer;
}

// ---------- Find or Create Conversation ----------

export async function findOrCreateConversation(
  customerPhone: string,
  businessId: string,
  customerName?: string
) {
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

// ---------- Should Auto-Reply ----------

export async function shouldAutoReply(businessId: string): Promise<boolean> {
  const aiSettings = await db.aISetting.findUnique({ where: { businessId } });
  return aiSettings?.autoReply !== false;
}

// ---------- Get Business ----------

export async function getBusiness() {
  const business = await db.business.findFirst();
  if (!business) {
    throw new Error('No business found in database. Please complete setup first.');
  }
  return business;
}

// ---------- Generate AI Response ----------

export async function generateAIResponse(
  customerMessage: string,
  businessId: string,
  customerName?: string
): Promise<string> {
  const [business, aiSettings] = await Promise.all([
    db.business.findUnique({ where: { id: businessId } }),
    db.aISetting.findUnique({ where: { businessId } }),
  ]);

  const openaiKey = aiSettings?.apiKey || process.env.OPENAI_API_KEY;
  const model = aiSettings?.model || 'gpt-4o-mini';

  if (openaiKey) {
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

  return generateFallbackResponse(
    customerMessage,
    business,
    aiSettings ? {
      greetingMessage: aiSettings.greetingMessage ?? undefined,
    } : null,
    customerName
  );
}

// ---------- OpenAI ----------

async function generateOpenAIResponse(
  customerMessage: string,
  businessName: string,
  aiSettings: { personality?: string; tone?: string; greetingMessage?: string; language?: string } | null,
  apiKey: string,
  model: string,
  customerName?: string
): Promise<string> {
  const personality = aiSettings?.personality || 'professional';
  const tone = aiSettings?.tone || 'helpful';
  const language = aiSettings?.language || 'en';

  const [products, deliveryZones, paymentMethods, faqs] = await Promise.all([
    db.product.findMany({ where: { active: true }, take: 20, include: { category: true } }),
    db.deliveryZone.findMany({ where: { active: true } }),
    db.paymentMethod.findMany({ where: { active: true } }),
    db.fAQ.findMany({ where: { active: true } }),
  ]);

  const productContext = products.map(p =>
    `- ${p.name}: GH₵${p.salePrice ?? p.price}${p.salePrice ? ` (was GH₵${p.price})` : ''}${p.description ? ` - ${p.description}` : ''}`
  ).join('\n');

  const deliveryContext = deliveryZones.map(z =>
    `- ${z.city}: GH₵${z.fee} (${z.estimatedDays} business days)`
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

// ---------- Fallback ----------

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
