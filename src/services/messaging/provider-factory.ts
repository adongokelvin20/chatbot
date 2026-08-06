/**
 * Messaging Provider Factory
 *
 * Creates the correct MessagingProvider for a given channel.
 * Extend the `createMessagingProvider` switch to support new channels
 * (SMS, email, Telegram, etc.) without changing call-site code.
 */

import type { MessagingProvider } from './messaging-provider';
import { WhatsAppProvider } from './whatsapp-provider';
import type { WhatsAppConfig } from './whatsapp-provider';
import { WebProvider } from './web-provider';

export type MessagingChannel = 'web' | 'whatsapp';

/**
 * Create a messaging provider for the specified channel.
 *
 * @param channel - The messaging channel to create a provider for
 * @param config  - Channel-specific configuration (required for WhatsApp)
 *
 * @example
 * ```ts
 * // Web chat (no config needed)
 * const web = createMessagingProvider('web');
 *
 * // WhatsApp Business (config required)
 * const wa = createMessagingProvider('whatsapp', {
 *   apiKey: process.env.WA_API_KEY!,
 *   phoneNumberId: process.env.WA_PHONE_NUMBER_ID!,
 *   businessAccountId: process.env.WA_BUSINESS_ACCOUNT_ID!,
 *   webhookVerifyToken: process.env.WA_WEBHOOK_VERIFY_TOKEN!,
 *   webhookUrl: process.env.WA_WEBHOOK_URL!,
 * });
 * ```
 */
export function createMessagingProvider(
  channel: MessagingChannel,
  config?: WhatsAppConfig,
): MessagingProvider {
  switch (channel) {
    case 'whatsapp': {
      if (!config) {
        throw new Error(
          'WhatsAppProvider requires a WhatsAppConfig object with apiKey, phoneNumberId, businessAccountId, webhookVerifyToken, and webhookUrl.',
        );
      }
      return new WhatsAppProvider(config);
    }

    case 'web':
    default:
      return new WebProvider();
  }
}
