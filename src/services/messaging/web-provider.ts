/**
 * Web Chat Provider
 *
 * Functional (no-op) implementation of MessagingProvider for the
 * built-in web chat widget. Web messages flow through API routes and
 * WebSocket connections rather than a third-party service, so this
 * provider serves as a thin adapter that conforms to the MessagingProvider
 * interface while the real work is handled by the conversation API.
 */

import type {
  MessagingProvider,
  SendMessageOptions,
  SendMessageResult,
  IncomingMessage,
} from './messaging-provider';

export class WebProvider implements MessagingProvider {
  private messageCallbacks: ((message: IncomingMessage) => void)[] = [];

  async send(
    recipient: string,
    message: string,
    options?: SendMessageOptions,
  ): Promise<SendMessageResult> {
    // Web messages are persisted via the conversation API routes.
    // This provider simply acknowledges the call so that callers
    // can treat web the same as any other channel.
    return {
      success: true,
      messageId: `web_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  async sendMedia(
    recipient: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document',
    caption?: string,
  ): Promise<SendMessageResult> {
    return {
      success: true,
      messageId: `web_media_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  async markAsRead(_messageId: string): Promise<void> {
    // Web read-receipts are handled client-side via WebSocket events.
    // No-op here.
  }

  onMessage(callback: (message: IncomingMessage) => void): void {
    this.messageCallbacks.push(callback);
  }

  async disconnect(): Promise<void> {
    this.messageCallbacks = [];
  }

  async healthCheck(): Promise<boolean> {
    // Web provider is always available since it has no external dependency.
    return true;
  }

  // ---- testing helper ----

  /**
   * Simulate an incoming web chat message.
   * Useful for unit tests and local development.
   */
  simulateIncoming(message: IncomingMessage): void {
    for (const cb of this.messageCallbacks) {
      cb(message);
    }
  }
}
