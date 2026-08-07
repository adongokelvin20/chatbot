/**
 * WhatsApp Business Cloud API Provider
 *
 * Live implementation using Meta's WhatsApp Business Cloud API (v21.0).
 * Handles sending text/media messages, marking messages as read,
 * and verifying webhook challenges from Meta.
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
  /** API version (defaults to v21.0) */
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

  constructor(config: WhatsAppConfig) {
    this.apiKey = config.apiKey;
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.webhookVerifyToken = config.webhookVerifyToken;
    this.webhookUrl = config.webhookUrl;
    this.apiVersion = config.apiVersion ?? 'v21.0';
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
    try {
      const body: Record<string, unknown> = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: {
          body: message,
          preview_url: options?.previewUrl ?? false,
        },
      };

      if (options?.replyTo) {
        body.context = { message_id: options.replyTo };
      }

      const res = await fetch(`${this.baseUrl()}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[WhatsApp] Send failed:', data.error);
        return {
          success: false,
          error: data.error?.message || `HTTP ${res.status}`,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[WhatsApp] Send error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async sendMedia(
    recipient: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document',
    caption?: string,
  ): Promise<SendMessageResult> {
    try {
      const body: Record<string, unknown> = {
        messaging_product: 'whatsapp',
        to: recipient,
        type: mediaType === 'video' ? 'video' : mediaType === 'document' ? 'document' : 'image',
        [mediaType === 'video' ? 'video' : mediaType === 'document' ? 'document' : 'image']: {
          link: mediaUrl,
          ...(caption && { caption }),
        },
      };

      const res = await fetch(`${this.baseUrl()}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[WhatsApp] Media send failed:', data.error);
        return {
          success: false,
          error: data.error?.message || `HTTP ${res.status}`,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[WhatsApp] Media send error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl()}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
      console.log('[WhatsApp] Message marked as read:', messageId);
    } catch (error) {
      console.error('[WhatsApp] Mark as read error:', error);
    }
  }

  onMessage(callback: (message: IncomingMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  /** Dispatch an incoming message to all registered callbacks */
  dispatchMessage(message: IncomingMessage): void {
    for (const cb of this.messageCallbacks) {
      cb(message);
    }
  }

  async disconnect(): Promise<void> {
    this.messageCallbacks = [];
    console.log('[WhatsApp] Disconnected');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Verify a webhook challenge token from Meta. */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /** Get config info (for debugging) */
  getConfig(): { phoneNumberId: string; businessAccountId: string; webhookUrl: string; apiVersion: string } {
    return {
      phoneNumberId: this.phoneNumberId,
      businessAccountId: this.businessAccountId,
      webhookUrl: this.webhookUrl,
      apiVersion: this.apiVersion,
    };
  }
}
