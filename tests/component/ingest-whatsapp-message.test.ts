import { describe, expect, it } from 'vitest';
import { IngestPersonalMessage } from '../../src/application/use-cases/ingest-personal-message.js';
import { InMemoryEvidenceStore } from '../../src/adapters/outbound/persistence/in-memory-evidence-store.js';
import { FixedCandidateIdGenerator, SpyReviewNotifier } from '../helpers/fakes.js';

describe('ingest WhatsApp message component', () => {
  it('stores evidence and requests review for an explicit date', async () => {
    const store = new InMemoryEvidenceStore();
    const notifier = new SpyReviewNotifier();
    const useCase = new IngestPersonalMessage(new FixedCandidateIdGenerator(), store, notifier);
    const candidate = await useCase.execute({
      channel: 'whatsapp-business', id: 'wamid.synthetic', senderId: 'synthetic-sender', text: "Jordan's birthday is May 12", receivedAt: '2026-08-01T00:00:00.000Z',
    });
    expect(candidate?.evidence.sourceMessageId).toBe('wamid.synthetic');
    expect(await store.list()).toHaveLength(1);
    expect(notifier.candidates).toHaveLength(1);
  });

  it('does nothing for a vague statement', async () => {
    const store = new InMemoryEvidenceStore();
    const notifier = new SpyReviewNotifier();
    const useCase = new IngestPersonalMessage(new FixedCandidateIdGenerator(), store, notifier);
    expect(await useCase.execute({
      channel: 'whatsapp-business', id: 'wamid.synthetic', senderId: 'synthetic-sender', text: 'Jordan is forty', receivedAt: '2026-08-01T00:00:00.000Z',
    })).toBeUndefined();
    expect(await store.list()).toHaveLength(0);
  });

  it('deduplicates Meta retries by deterministic candidate identity', async () => {
    const store = new InMemoryEvidenceStore();
    const notifier = new SpyReviewNotifier();
    const useCase = new IngestPersonalMessage(new FixedCandidateIdGenerator(), store, notifier);
    const message = {
      channel: 'whatsapp-business' as const, id: 'wamid.same', senderId: 'synthetic-sender', text: "Jordan's birthday is May 12", receivedAt: '2026-08-01T00:00:00.000Z',
    };
    await useCase.execute(message);
    await useCase.execute(message);
    expect(await store.list()).toHaveLength(1);
    expect(notifier.candidates).toHaveLength(1);
  });
});
