import { describe, expect, it } from 'vitest';
import { Sha256CandidateIdGenerator } from '../../src/adapters/outbound/identity/sha256-candidate-id-generator.js';

describe('candidate identity', () => {
  it('is stable for the same source evidence and changes with the source message', () => {
    const generator = new Sha256CandidateIdGenerator();
    const claim = { personName: 'Jordan', date: { month: 5, day: 12 } };
    const evidence = { channel: 'whatsapp-business' as const, sourceMessageId: 'wamid.1', senderId: 'synthetic', excerpt: 'synthetic', receivedAt: '2026-08-01T00:00:00.000Z' };
    const first = generator.generate(claim, evidence);
    expect(generator.generate(claim, evidence)).toBe(first);
    expect(generator.generate(claim, { ...evidence, sourceMessageId: 'wamid.2' })).not.toBe(first);
    expect(first).toMatch(/^[a-f\d]{24}$/u);
  });
});
