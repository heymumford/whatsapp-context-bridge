import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { IngestPersonalMessage } from '../../src/application/use-cases/ingest-personal-message.js';
import { InMemoryEvidenceStore } from '../../src/adapters/outbound/persistence/in-memory-evidence-store.js';
import { FixedCandidateIdGenerator, SpyReviewNotifier } from '../helpers/fakes.js';

describe('performance smoke', () => {
  it('processes 1,000 synthetic messages without a gross regression', async () => {
    const useCase = new IngestPersonalMessage(new FixedCandidateIdGenerator(), new InMemoryEvidenceStore(), new SpyReviewNotifier());
    const started = performance.now();
    for (let index = 0; index < 1_000; index += 1) {
      await useCase.execute({
        channel: 'sms-android', id: `wamid.${String(index)}`, senderId: 'synthetic', text: 'No birthday fact in this message', receivedAt: '2026-08-01T00:00:00.000Z',
      });
    }
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});
