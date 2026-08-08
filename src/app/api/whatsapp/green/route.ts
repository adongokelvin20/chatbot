/**
 * Green API WhatsApp Webhook
 *
 * Green API (green-api.com) — 100% FREE, no credit card, no trial.
 * 50 messages/day forever. Uses your personal or business WhatsApp.
 *
 * POST — Green API sends incoming messages here as JSON.
 *        AI processes the message and replies via Green API REST.
 *
 * Green API webhook sends:
 *   typeWebhook: "incomingMessageReceived"
 *   instanceData: { instanceId, instanceName }
 *   messageData: { chatId, senderName, textMessage, messageId, typeMessage }
 *
 * SETUP (literally 3 steps):
 *   1. Sign up at https://green-api.com (email + password, 30 seconds)
 *   2. Create an instance → it shows a QR code → scan it with WhatsApp
 *   3. Set your webhook URL + token → done
 */

import { NextRequest, NextResponse } from 'next/server';
import { autoInitDatabase } from '@/lib/db';
import {
  findOrCreateConversation,
  generateAIResponse,
  shouldAutoReply,
  getBusiness,
} from '@/services/whatsapp.service';
import { addMessage } from '@/services/conversation.service';

// ---------- Send reply via Green API ----------

async function sendGreenReply(
  chatId: string,   // e.g. "233240000000@c.us"
  message: string
): Promise<boolean> {
  const idInstance = process.env.GREEN_API_INSTANCE_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!idInstance || !apiToken) {
    console.error('[Green API] Missing GREEN_API_INSTANCE_ID or GREEN_API_TOKEN');
    return false;
  }

  try {
    const res = await fetch(
      `https://api.greenapi.com/v2.0/${idInstance}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          message: message,
        }),
      }
    );

    const data = await res.json();
    if (res.ok) {
      console.log('[Green API] Reply sent, msgId:', data.idMessage);
      return true;
    }
    console.error('[Green API] Send failed:', JSON.stringify(data));
    return false;
  } catch (error) {
    console.error('[Green API] Send error:', error);
    return false;
  }
}

// ---------- Helper: extract phone from Green API chatId ----------

function extractPhone(chatId: string): string {
  // Green API chatId format: "233240000000@c.us" or "233240000000@g.us"
  return chatId.split('@')[0] || chatId;
}

// =========================================================================
// ROUTE HANDLERS
// =========================================================================

/**
 * POST /api/whatsapp/green
 *
 * Green API sends incoming WhatsApp messages here.
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure database is ready
    await autoInitDatabase();

    const body = await req.json();

    // Only process incoming messages (ignore other webhook types)
    if (body.typeWebhook !== 'incomingMessageReceived') {
      return NextResponse.json({ ok: true });
    }

    const messageData = body.messageData;
    const instanceData = body.instanceData;
    if (!messageData) {
      return NextResponse.json({ ok: true });
    }

    // Extract message content
    const chatId = messageData.chatId as string;          // "233240000000@c.us"
    const senderName = messageData.senderName as string; // Customer's WhatsApp name
    const messageId = messageData.idMessage as string;
    const messageType = messageData.typeMessage as string;

    let textContent = '';

    if (messageType === 'textMessage') {
      textContent = messageData.textMessage || '';
    } else if (messageType === 'extendedTextMessage') {
      textContent = messageData.extendedTextMessage?.text || '';
    } else if (['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage'].includes(messageType)) {
      textContent = `[${messageType.replace('Message', '')} received]`;
    } else if (messageType === 'quotedMessage') {
      textContent = messageData.quotedMessage?.textMessage || '';
    } else {
      return NextResponse.json({ ok: true });
    }

    if (!textContent?.trim()) {
      return NextResponse.json({ ok: true });
    }

    const cleanPhone = extractPhone(chatId);

    // Get business
    const business = await getBusiness();

    // Find or create conversation
    const conversation = await findOrCreateConversation(
      cleanPhone,
      business.id,
      senderName || undefined
    );

    // Save customer message
    await addMessage(conversation.id, {
      senderType: 'customer',
      content: textContent.trim(),
      contentType: 'text',
      metadata: { greenMessageId: messageId, chatId, channel: 'whatsapp', provider: 'green' },
    });

    // Check if auto-reply is enabled
    const autoReply = await shouldAutoReply(business.id);

    if (autoReply && conversation.aiActive) {
      // Generate AI response
      const aiReply = await generateAIResponse(
        textContent.trim(),
        business.id,
        conversation.customerName || senderName || undefined
      );

      // Save AI response
      await addMessage(conversation.id, {
        senderType: 'ai',
        content: aiReply,
        contentType: 'text',
      });

      // Send reply via Green API
      await sendGreenReply(chatId, aiReply);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Green API Webhook] Error:', error);
    return NextResponse.json({ ok: true });
  }
}

/** GET — health check */
export async function GET() {
  return NextResponse.json({ status: 'green_api_webhook_ready' });
}
