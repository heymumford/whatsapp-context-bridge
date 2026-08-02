import { describe, expect, it } from 'vitest';
import { parseMetaTextMessages } from '../../src/adapters/inbound/whatsapp/meta-webhook-parser.js';

describe('Meta webhook contract', () => {
  it('iterates every entry, change, and supported text message', () => {
    const payload = {
      object: 'whatsapp_business_account',
      unknownFutureField: true,
      entry: [
        { changes: [{ field: 'messages', value: { messages: [
          { from: 'synthetic-a', id: 'wamid.1', timestamp: '1785600000', type: 'text', text: { body: "Jordan's birthday is May 12" }, future: 1 },
          { from: 'synthetic-a', id: 'wamid.2', timestamp: '1785600001', type: 'image' },
        ] } }] },
        { changes: [{ field: 'messages', value: { messages: [
          { from: 'synthetic-b', id: 'wamid.3', timestamp: '1785600002', type: 'text', text: { body: 'No date here' } },
        ] } }] },
      ],
    };
    expect(parseMetaTextMessages(payload)).toHaveLength(2);
  });

  it('accepts status-only delivery payloads as no inbound messages', () => {
    expect(parseMetaTextMessages({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ field: 'messages', value: { statuses: [{ id: 'wamid.1' }] } }] }],
    })).toEqual([]);
  });

  it('rejects the wrong top-level object', () => {
    expect(() => parseMetaTextMessages({ object: 'page', entry: [] })).toThrow();
  });
});
