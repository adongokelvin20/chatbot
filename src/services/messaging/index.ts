export type {
  MessagingProvider,
  SendMessageOptions,
  SendMessageResult,
  IncomingMessage,
} from './messaging-provider';

export { WhatsAppProvider } from './whatsapp-provider';
export type { WhatsAppConfig } from './whatsapp-provider';

export { WebProvider } from './web-provider';

export { createMessagingProvider } from './provider-factory';
export type { MessagingChannel } from './provider-factory';
