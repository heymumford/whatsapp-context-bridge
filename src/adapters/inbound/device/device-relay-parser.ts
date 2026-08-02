import { z } from 'zod';
import type { InboundPersonalMessage } from '../../../application/use-cases/ingest-personal-message.js';

const schema = z.object({
  channel: z.enum(['sms-android', 'whatsapp-notification']),
  id: z.string().min(1).max(256),
  senderId: z.string().min(1).max(256),
  text: z.string().min(1).max(65_536),
  receivedAt: z.iso.datetime({ offset: true }),
});

export function parseDeviceRelayMessage(value: unknown): InboundPersonalMessage {
  return schema.parse(value);
}
