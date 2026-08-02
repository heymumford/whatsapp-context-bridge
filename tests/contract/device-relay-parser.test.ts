import { describe, expect, it } from 'vitest';
import { parseDeviceRelayMessage } from '../../src/adapters/inbound/device/device-relay-parser.js';

describe('personal-device relay contract', () => {
  it.each(['sms-android', 'whatsapp-notification'] as const)('accepts the %s source channel', (channel) => {
    expect(parseDeviceRelayMessage({
      channel,
      id: 'synthetic-message-id',
      senderId: 'synthetic-sender-id',
      text: "Jordan's birthday is May 12",
      receivedAt: '2026-08-01T12:00:00-04:00',
    })).toMatchObject({ channel });
  });

  it('rejects unsupported channels and invalid timestamps', () => {
    expect(() => parseDeviceRelayMessage({
      channel: 'whatsapp-private-api', id: 'id', senderId: 'sender', text: 'text', receivedAt: 'yesterday',
    })).toThrow();
  });
});
