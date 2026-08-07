/**
 * Twilio WhatsApp Webhook API Route
 *
 * This is the EASIEST way to connect WhatsApp Business to your AI Sales Employee.
 * Twilio handles all the Meta/WhatsApp Business verification for you.
 *
 * POST — Twilio sends incoming WhatsApp messages here as form-encoded data.
 *        The AI processes the message and replies via Twilio API.
 *
 * Twilio sends these form fields:
 *   From:     "whatsapp:+212600000000" (customer's number)
 *   To:       "whatsapp:+14155552671" (your Twilio number)
 *   Body:     message text
 *   MessageSid: unique message ID
 *   ProfileName: customer's WhatsApp display name (if available)
 *
 * SETUP:
 *   1. Create a free Twilio account at https://www.twilio.com/try-twilio
 *   2. Go to Messaging > Try it out > Send a WhatsApp message
 *   3. Twilio gives you a sandbox number — start messaging immediately!
 *   4. For production: apply for a Twilio WhatsApp Business number
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findOrCreateConversation,
  generateAIResponse,
  shouldAutoReply,
  getBusiness,
} from '@/services/whatsapp.service';
import { addMessage } from '@/services/conversation.service';

// ---------- Send reply via Twilio ----------

async function sendTwilioReply(
  to: string,       // e.g. "whatsapp:+212600000000"
  body: string
): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155552671"

  if (!accountSid || !authToken || !fromNumber) {
    console.error('[Twilio] Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER');
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.set('From', fromNumber);
    params.set('To', to);
    params.set('Body', body);

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await res.json();
    if (res.ok) {
      console.log('[Twilio] Reply sent, SID:', data.sid);
      return true;
    }
    console.error('[Twilio] Send failed:', data.message);
    return false;
  } catch (error) {
    console.error('[Twilio] Send error:', error);
    return false;
  }
}

// ---------- Webhook Signature Verification ----------

function verifyTwilioSignature(
  url: string,
  params: URLSearchParams,
  signature: string | null
): boolean {
  // In production, you should verify the X-Twilio-Signature header
  // For now, we skip strict verification to make setup easier
  // To enable: install twilio package and use twilio.validateRequest()
  return true;
}

// =========================================================================
// ROUTE HANDLERS
// =========================================================================

/**
 * POST /api/whatsapp/twilio
 *
 * Twilio sends incoming WhatsApp messages here.
 * Form-encoded body with: From, To, Body, MessageSid, ProfileName
 */
export async function POST(req: NextRequest) {
  try {
    // Parse form-encoded body (Twilio sends application/x-www-form-urlencoded)
    const formData = await req.formData();
    const from = formData.get('From') as string;         // "whatsapp:+212600000000"
    const body = formData.get('Body') as string;         // message text
    const messageSid = formData.get('MessageSid') as string;
    const profileName = formData.get('ProfileName') as string | null;

    if (!from || !body?.trim()) {
      return new NextResponse('OK', { status: 200 });
    }

    // Strip "whatsapp:" prefix to get clean phone number
    const cleanPhone = from.replace('whatsapp:', '');
    const customerName = profileName || undefined;

    // Get business
    const business = await getBusiness();

    // Find or create conversation
    const conversation = await findOrCreateConversation(
      cleanPhone,
      business.id,
      customerName
    );

    // Save customer message
    await addMessage(conversation.id, {
      senderType: 'customer',
      content: body.trim(),
      contentType: 'text',
      metadata: { twilioMessageSid: messageSid, channel: 'whatsapp', provider: 'twilio' },
    });

    // Check if auto-reply is enabled
    const autoReply = await shouldAutoReply(business.id);

    if (autoReply && conversation.aiActive) {
      // Generate AI response
      const aiReply = await generateAIResponse(
        body.trim(),
        business.id,
        conversation.customerName || customerName
      );

      // Save AI response to database
      await addMessage(conversation.id, {
        senderType: 'ai',
        content: aiReply,
        contentType: 'text',
      });

      // Send reply back via Twilio
      // IMPORTANT: Return TwiML directly in the HTTP response instead of making a separate API call
      // This is faster and more reliable — Twilio processes the response immediately
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(aiReply)}</Message>
</Response>`;

      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Human mode — message saved, staff will reply from dashboard
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[Twilio Webhook] Error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}

/**
 * GET /api/whatsapp/twilio
 *
 * Optional: Twilio may send a GET to verify the webhook URL is alive.
 */
export async function GET() {
  return NextResponse.json({ status: 'twilio_webhook_ready' });
}

// ---------- Helper ----------

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
