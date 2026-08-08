/**
 * Meta WhatsApp Cloud API Webhook
 *
 * Handles inbound messages from Meta's WhatsApp Business Cloud API.
 *
 * GET  — Webhook verification (Meta sends a challenge during setup)
 * POST — Receives incoming message events, processes through AI, auto-replies.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findOrCreateConversation,
  generateAIResponse,
  shouldAutoReply,
  getBusiness,
} from '@/services/whatsapp.service';
import { addMessage } from '@/services/conversation.service';

// ---------- Send reply via Meta Cloud API ----------

async function sendMetaWhatsAppReply(
  recipient: string,
  message: string,
  replyTo?: string
): Promise<boolean> {
  const apiKey = process.env.WA_ACCESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    console.error('[Meta WhatsApp] Missing WA_ACCESS_TOKEN or WA_PHONE_NUMBER_ID');
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { body: message, preview_url: true },
    };

    if (replyTo) {
      body.context = { message_id: replyTo };
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('[Meta WhatsApp] Send failed:', data.error);
      return false;
    }
    console.log('[Meta WhatsApp] Reply sent successfully');
    return true;
  } catch (error) {
    console.error('[Meta WhatsApp] Send error:', error);
    return false;
  }
}

// =========================================================================
// ROUTE HANDLERS
// =========================================================================

/**
 * GET /api/whatsapp/webhook
 * Meta sends a GET to verify webhook ownership.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const webhookVerifyToken = process.env.WA_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token && token === webhookVerifyToken && challenge) {
      console.log('[Meta Webhook] Verification successful');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json(
      { error: 'Verification failed. Invalid token.' },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/webhook
 * Meta sends a POST for each WhatsApp event (message, delivery receipt, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body.entry?.[0];
    if (!entry) return NextResponse.json({ received: true });

    const change = entry.changes?.[0];
    if (!change) return NextResponse.json({ received: true });

    const value = change.value;
    const messages: Array<Record<string, unknown>> = value.messages || [];
    if (messages.length === 0) return NextResponse.json({ received: true });

    const business = await getBusiness();
    const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;

    for (const msg of messages) {
      const metadata = value.metadata as Record<string, unknown> | undefined;
      if (phoneNumberId && metadata?.phone_number_id !== phoneNumberId) continue;

      const from = msg.from as string;
      const waMessageId = msg.id as string;
      const messageType = msg.type as string;

      let textContent = '';
      if (messageType === 'text') {
        textContent = (msg.text as Record<string, unknown>)?.body as string || '';
      } else if (messageType === 'interactive') {
        const interactive = msg.interactive as Record<string, unknown>;
        textContent = (interactive?.button_reply as Record<string, unknown>)?.title as string ||
                       (interactive?.list_reply as Record<string, unknown>)?.title as string || '';
      } else if (['image', 'video', 'document', 'audio'].includes(messageType)) {
        textContent = `[${messageType} message received]`;
      } else {
        continue;
      }

      if (!textContent.trim()) continue;

      let customerName: string | undefined;
      const contacts = value.contacts as Array<Record<string, unknown>> | undefined;
      if (contacts?.[0]) {
        const profile = contacts[0].profile as Record<string, unknown> | undefined;
        customerName = profile?.name as string | undefined;
      }

      const conversation = await findOrCreateConversation(from, business.id, customerName);

      await addMessage(conversation.id, {
        senderType: 'customer',
        content: textContent,
        contentType: 'text',
        metadata: { waMessageId, channel: 'whatsapp', provider: 'meta' },
      });

      const autoReply = await shouldAutoReply(business.id);

      if (autoReply && conversation.aiActive) {
        const aiReply = await generateAIResponse(
          textContent,
          business.id,
          conversation.customerName || customerName
        );

        await addMessage(conversation.id, {
          senderType: 'ai',
          content: aiReply,
          contentType: 'text',
        });

        await sendMetaWhatsAppReply(from, aiReply, waMessageId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Meta Webhook] POST error:', error);
    return NextResponse.json({ received: true });
  }
}
