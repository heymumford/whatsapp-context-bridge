import { describe, expect, it } from 'vitest';
import { CandidateNotFoundError, ConfirmBirthdayCandidate } from '../../src/application/use-cases/confirm-birthday-candidate.js';
import { createPendingCandidate } from '../../src/domain/birthday-candidate.js';
import { InMemoryEvidenceStore } from '../../src/adapters/outbound/persistence/in-memory-evidence-store.js';
import { SpyCalendarPublisher } from '../helpers/fakes.js';

describe('confirm birthday candidate component', () => {
  it('publishes once and makes repeated confirmation idempotent', async () => {
    const store = new InMemoryEvidenceStore();
    const calendar = new SpyCalendarPublisher();
    const useCase = new ConfirmBirthdayCandidate(store, calendar);
    await store.save(createPendingCandidate('0123456789abcdef01234567', { personName: 'Jordan', date: { month: 5, day: 12 } }, {
      channel: 'whatsapp-business', sourceMessageId: 'wamid.1', senderId: 'synthetic', excerpt: "Jordan's birthday is May 12", receivedAt: '2026-08-01T00:00:00.000Z',
    }));
    const first = await useCase.execute('0123456789abcdef01234567');
    const second = await useCase.execute('0123456789abcdef01234567');
    expect(second).toEqual(first);
    expect(calendar.candidates).toHaveLength(1);
    expect((await store.get('0123456789abcdef01234567'))?.status).toBe('confirmed');
  });

  it('fails clearly for an unknown candidate', async () => {
    const useCase = new ConfirmBirthdayCandidate(new InMemoryEvidenceStore(), new SpyCalendarPublisher());
    await expect(useCase.execute('missing')).rejects.toThrow('Candidate missing was not found');
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(CandidateNotFoundError);
  });

  it.each([
    { status: 'confirmed' as const },
    { status: 'pending' as const, calendarEventId: 'orphaned-calendar-id' },
  ])('repairs an inconsistent stored state instead of treating it as published: $status', async (state) => {
    const store = new InMemoryEvidenceStore();
    const calendar = new SpyCalendarPublisher();
    await store.save({
      id: '0123456789abcdef01234567', personName: 'Jordan', date: { month: 5, day: 12 },
      evidence: {
        channel: 'sms-android', sourceMessageId: 'message', senderId: 'synthetic', excerpt: 'synthetic', receivedAt: '2026-08-01T00:00:00.000Z',
      },
      ...state,
    });
    await new ConfirmBirthdayCandidate(store, calendar).execute('0123456789abcdef01234567');
    expect(calendar.candidates).toHaveLength(1);
  });
});
