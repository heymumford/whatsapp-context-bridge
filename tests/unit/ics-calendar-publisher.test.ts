import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { IcsCalendarPublisher } from '../../src/adapters/outbound/calendar/ics-calendar-publisher.js';
import { createPendingCandidate } from '../../src/domain/birthday-candidate.js';

describe('ICS calendar publisher', () => {
  it('writes a transparent annual event with stable identity and escaped text', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'context-calendar-'));
    const publisher = new IcsCalendarPublisher(directory, 2026);
    const candidate = createPendingCandidate('0123456789abcdef01234567', { personName: 'Jordan, Jr.', date: { month: 5, day: 12 } }, {
      channel: 'whatsapp-business', sourceMessageId: 'wamid.1', senderId: 'synthetic', excerpt: 'synthetic', receivedAt: '2026-08-01T00:00:00.000Z',
    });
    const receipt = await publisher.publish(candidate);
    const calendar = await readFile(path.join(directory, '0123456789abcdef01234567.ics'), 'utf8');
    expect(receipt.externalId).toBe('0123456789abcdef01234567@whatsapp-context-bridge');
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260512');
    expect(calendar).toContain('RRULE:FREQ=YEARLY');
    expect(calendar).toContain("SUMMARY:Jordan\\, Jr.'s Birthday");
    expect(calendar).toContain('TRANSP:TRANSPARENT');
  });
});
