import { afterEach, describe, expect, it, vi } from 'vitest';
import { MetaWhatsAppReviewNotifier } from '../../src/adapters/outbound/notifications/meta-whatsapp-review-notifier.js';
import { createPendingCandidate } from '../../src/domain/birthday-candidate.js';

describe('Meta outbound message contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the documented individual-text request shape', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const notifier = new MetaWhatsAppReviewNotifier({
      graphApiVersion: 'v-test', phoneNumberId: 'synthetic-phone-id', accessToken: 'synthetic-access-token',
    });
    await notifier.notify(createPendingCandidate('0123456789abcdef01234567', { personName: 'Jordan', date: { month: 5, day: 12 } }, {
      channel: 'whatsapp-business', sourceMessageId: 'wamid.1', senderId: '15550000000', excerpt: "Jordan's birthday is May 12", receivedAt: '2026-08-01T00:00:00.000Z',
    }));
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://graph.facebook.com/v-test/synthetic-phone-id/messages');
    expect(init).toMatchObject({ method: 'POST' });
    expect(typeof init.body).toBe('string');
    expect(JSON.parse(init.body as string)).toMatchObject({
      messaging_product: 'whatsapp', recipient_type: 'individual', to: '15550000000', type: 'text',
    });
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer synthetic-access-token');
  });

  it('maps a Meta failure without including response content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('sensitive provider detail', { status: 400 })));
    const notifier = new MetaWhatsAppReviewNotifier({
      graphApiVersion: 'v-test', phoneNumberId: 'synthetic-phone-id', accessToken: 'synthetic-access-token',
    });
    const candidate = createPendingCandidate('0123456789abcdef01234567', { personName: 'Jordan', date: { month: 5, day: 12 } }, {
      channel: 'whatsapp-business', sourceMessageId: 'wamid.1', senderId: '15550000000', excerpt: 'synthetic', receivedAt: '2026-08-01T00:00:00.000Z',
    });
    await expect(notifier.notify(candidate)).rejects.toThrow('status 400');
  });
});
