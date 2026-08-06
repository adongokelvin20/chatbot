/**
 * WhatsApp Business API Provider
 *
 * Stub implementation of the MessagingProvider interface for WhatsApp
 * Business Platform. This module is ready for live integration —
 * replace the TODO stubs with actual API calls to:
 *
 *   POST https://graph.facebook.com/v18.0/{phoneNumberId}/messages
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

import type {
  MessagingProvider,
  SendMessageOptions,
  SendMessageResult,
  IncomingMessage,
} from './messaging-provider';

// ---------- Config ----------

export interface WhatsAppConfig {
  /** Permanent access token from Meta App Dashboard */
  apiKey: string;
  /** Phone number ID assigned to your WhatsApp Business account */
  phoneNumberId: string;
  /** WhatsApp Business Account ID */
  businessAccountId: string;
  /** Token used to verify webhook authenticity */
  webhookVerifyToken: string;
  /** Public URL where Meta will deliver webhook events */
  webhookUrl: string;
  /** API version (defaults to v18.0) */
  apiVersion?: string;
}

// ---------- Provider ----------

export class WhatsAppProvider implements MessagingProvider {
  private apiKey: string;
  private phoneNumberId: string;
  private businessAccountId: string;
  private webhookVerifyToken: string;
  private webhookUrl: string;
  private apiVersion: string;
  private messageCallbacks: ((message: IncomingMessage) => void)[] = [];
  private connected: boolean = false;

  constructor(config: WhatsAppConfig) {
    this.apiKey = config.apiKey;
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.webhookVerifyToken = config.webhookVerifyToken;
    this.webhookUrl = config.webhookUrl;
    this.apiVersion = config.apiVersion ?? 'v18.0';
  }

  // ------------ helpers ------------

  private baseUrl(): string {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  // ------------ public API ------------

  async send(
    recipient: string,
    message: string,
    options?: SendMessageOptions,
  ): Promise<SendMessageResult> {
    // TODO: Implement live WhatsApp Business API call
    //   const body = {
    //     messaging_product: 'whatsapp',
    //     to: recipient,
    //     type: 'text',
    //     text: { body: message, preview_url: options?.previewUrl ?? false },
    //     ...(options?.replyTo && { context: { message_id: options.replyTo } }),
    //   };
    //   const res = await fetch(`${this.baseUrl()}/messages`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${this.apiKey}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(body),
    //   });

    console.log('[WhatsApp] Message would be sent to:', recipient);
    return {
      success: true,
      messageId: `wa_mock_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  async sendMedia(
    recipient: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document',
    caption?: string,
  ): Promise<SendMessageResult> {
    // TODO: Implement live WhatsApp Business API call
    //   const body = {
    //     messaging_product: 'whatsapp',
    //     to: recipient,
    //     type: mediaType,
    //     [mediaType]: {
    //       link: mediaUrl,
    //       ...(caption && { caption }),
    //     },
    //   };
    //   const res = await fetch(`${this.baseUrl()}/messages`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${this.apiKey}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(body),
    //   });

    console.log('[WhatsApp] Media would be sent to:', recipient, '| type:', mediaType, '| url:', mediaUrl);
    return {
      success: true,
      messageId: `wa_mock_media_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  async markAsRead(messageId: string): Promise<void> {
    // TODO: Implement live WhatsApp Business API call
    //   await fetch(`${this.baseUrl()}/messages`, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${this.apiKey}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       messaging_product: 'whatsapp',
    //       status: 'read',
    //       message_id: messageId,
    //     }),
    //   });

    console.log('[WhatsApp] Message would be marked as read:', messageId);
  }

  onMessage(callback: (message: IncomingMessage) => void): void {
    // TODO: When the webhook endpoint receives an incoming message event,
    //   parse it and invoke all registered callbacks.
    //   For now, callbacks are collected and can be invoked manually
    //   for testing purposes via `simulateIncoming`.
    this.messageCallbacks.push(callback);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.messageCallbacks = [];
    console.log('[WhatsApp] Disconnected');
  }

  async healthCheck(): Promise<boolean> {
    // TODO: Implement a lightweight API call (e.g., GET phone number info)
    //   to verify the token is valid and the account is reachable.
    //   Until then, report as unhealthy since no live connection exists.
    return false;
  }

  // ------------ testing / simulation helpers ------------

  /**
   * Simulate an incoming WhatsApp message. Useful for local development
   * and unit tests without a live webhook.
   */
  simulateIncoming(message: IncomingMessage): void {
    for (const cb of this.messageCallbacks) {
      cb(message);
    }
  }

  /** Verify a webhook challenge token from Meta. */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }
}
