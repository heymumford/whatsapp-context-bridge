import { z } from 'zod';
import type { InboundPersonalMessage } from '../../../application/use-cases/ingest-personal-message.js';

const messageSchema = z.object({
  from: z.string().min(1),
  id: z.string().min(1),
  timestamp: z.string().regex(/^\d+$/u),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
});

const webhookSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    changes: z.array(z.object({
      field: z.literal('messages'),
      value: z.object({ messages: z.array(messageSchema).optional() }),
    })),
  })),
});

export function parseMetaTextMessages(value: unknown): readonly InboundPersonalMessage[] {
  const payload = webhookSchema.parse(value);
  return payload.entry.flatMap((entry) => entry.changes.flatMap((change) =>
    (change.value.messages ?? [])
      .filter((message) => message.type === 'text' && message.text !== undefined)
      .map((message) => ({
        channel: 'whatsapp-business' as const,
        id: message.id,
        senderId: message.from,
        text: message.text?.body ?? '',
        receivedAt: new Date(Number(message.timestamp) * 1_000).toISOString(),
      })),
  ));
}
