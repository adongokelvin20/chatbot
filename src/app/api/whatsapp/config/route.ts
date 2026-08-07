/**
 * WhatsApp Configuration API
 *
 * GET  — Returns WhatsApp connection status and masked config
 * POST — Test WhatsApp API connection
 * PUT  — Saves WhatsApp configuration to environment (runtime only)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasToken = !!process.env.WA_ACCESS_TOKEN;
    const hasPhoneId = !!process.env.WA_PHONE_NUMBER_ID;
    const hasVerifyToken = !!process.env.WA_WEBHOOK_VERIFY_TOKEN;
    const hasWebhookUrl = !!process.env.WA_WEBHOOK_URL;
    const hasBusinessId = !!process.env.WA_BUSINESS_ACCOUNT_ID;

    const isConfigured = hasToken && hasPhoneId && hasVerifyToken;
    const isFullySetup = isConfigured && hasWebhookUrl && hasBusinessId;

    // Test connection if configured
    let connectionStatus: 'not_configured' | 'connected' | 'error' = 'not_configured';
    let phoneDisplay = '';

    if (hasToken && hasPhoneId) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}`,
          {
            headers: { Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          connectionStatus = 'connected';
          phoneDisplay = data.display_phone_number || data.verified_name || process.env.WA_PHONE_NUMBER_ID;
        } else {
          connectionStatus = 'error';
        }
      } catch {
        connectionStatus = 'error';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        isFullySetup,
        connectionStatus,
        phoneDisplay,
        webhookUrl: process.env.WA_WEBHOOK_URL || '',
        config: {
          accessToken: hasToken ? 'configured' : 'missing',
          phoneNumberId: hasPhoneId ? process.env.WA_PHONE_NUMBER_ID!.slice(0, 8) + '...' : 'missing',
          businessAccountId: hasBusinessId ? process.env.WA_BUSINESS_ACCOUNT_ID!.slice(0, 8) + '...' : 'missing',
          webhookVerifyToken: hasVerifyToken ? 'configured' : 'missing',
          webhookUrl: hasWebhookUrl ? process.env.WA_WEBHOOK_URL : 'missing',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Test the WhatsApp connection
    const body = await req.json();
    const { accessToken, phoneNumberId } = body;

    const token = accessToken || process.env.WA_ACCESS_TOKEN;
    const phoneId = phoneNumberId || process.env.WA_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      return NextResponse.json(
        { success: false, error: 'Access token and phone number ID are required.' },
        { status: 400 }
      );
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: data.error?.message || `Connection test failed (HTTP ${res.status})`,
        details: data.error,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        displayPhone: data.display_phone_number,
        verifiedName: data.verified_name,
        id: data.id,
        message: 'WhatsApp connection successful!',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
