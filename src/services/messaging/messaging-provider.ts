/**
 * Messaging Provider Interface
 * 
 * Abstract interface for any messaging channel (WhatsApp, Web, SMS, etc.).
 * All messaging providers must implement this interface to ensure
 * consistent behavior across channels.
 */

export interface SendMessageOptions {
  /** ID of the message being replied to */
  replyTo?: string;
  /** Whether to generate a link preview for URLs in the message */
  previewUrl?: boolean;
}

export interface SendMessageResult {
  /** Whether the message was sent successfully */
  success: boolean;
  /** Unique identifier for the sent message (provider-specific) */
  messageId?: string;
  /** ISO 8601 timestamp of when the message was sent */
  timestamp?: string;
  /** Error message if the send failed */
  error?: string;
}

export interface IncomingMessage {
  /** Unique identifier for the incoming message */
  id: string;
  /** Sender's phone number or identifier */
  from: string;
  /** Text content of the message */
  text?: string;
  /** URL of any attached media */
  mediaUrl?: string;
  /** Type of attached media */
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  /** ISO 8601 timestamp of when the message was received */
  timestamp: string;
  /** ID of the message this is replying to, if any */
  replyTo?: string;
}

export interface MessagingProvider {
  /**
   * Send a text message to a recipient.
   * @param recipient - Phone number, user ID, or channel-specific identifier
   * @param message - Text content of the message
   * @param options - Optional send parameters (reply-to, preview URL, etc.)
   */
  send(recipient: string, message: string, options?: SendMessageOptions): Promise<SendMessageResult>;

  /**
   * Send a media message (image, video, or document) to a recipient.
   * @param recipient - Phone number, user ID, or channel-specific identifier
   * @param mediaUrl - Publicly accessible URL of the media file
   * @param mediaType - Type of media being sent
   * @param caption - Optional caption for the media
   */
  sendMedia(
    recipient: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document',
    caption?: string,
  ): Promise<SendMessageResult>;

  /**
   * Mark a message as read.
   * @param messageId - ID of the message to mark as read
   */
  markAsRead(messageId: string): Promise<void>;

  /**
   * Register a callback to be invoked when an incoming message is received.
   * Multiple callbacks can be registered.
   * @param callback - Function to handle incoming messages
   */
  onMessage(callback: (message: IncomingMessage) => void): void;

  /**
   * Disconnect from the messaging service and clean up resources.
   */
  disconnect(): Promise<void>;

  /**
   * Check if the provider is healthy and connected.
   * @returns true if the provider is operational
   */
  healthCheck(): Promise<boolean>;
}
