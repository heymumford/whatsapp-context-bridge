import { describe, expect, it } from 'vitest';
import { confirmCandidate, createPendingCandidate } from '../../src/domain/birthday-candidate.js';

describe('birthday candidate', () => {
  it('moves from pending to confirmed without losing evidence', () => {
    const pending = createPendingCandidate('id', { personName: 'Jordan', date: { month: 5, day: 12 } }, {
      channel: 'sms-android', sourceMessageId: 'message-1', senderId: 'synthetic-sender', excerpt: "Jordan's birthday is May 12", receivedAt: '2026-08-01T00:00:00.000Z',
    });
    expect(pending.status).toBe('pending');
    expect(confirmCandidate(pending, 'calendar-id')).toEqual({
      ...pending, status: 'confirmed', calendarEventId: 'calendar-id',
    });
  });
});
