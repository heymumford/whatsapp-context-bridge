import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { extractExplicitBirthdayClaim } from '../../src/domain/explicit-birthday-extractor.js';

describe('explicit birthday extractor', () => {
  const monthAliases = [
    ['January', 'Jan', 1], ['February', 'Feb', 2], ['March', 'Mar', 3], ['April', 'Apr', 4],
    ['May', 'May', 5], ['June', 'Jun', 6], ['July', 'Jul', 7], ['August', 'Aug', 8],
    ['September', 'Sep', 9], ['October', 'Oct', 10], ['November', 'Nov', 11], ['December', 'Dec', 12],
  ] as const;

  it.each([
    ["Jordan's birthday is May 12", 'Jordan', { month: 5, day: 12 }],
    ['Jordan Smith was born on February 29, 2000', 'Jordan Smith', { month: 2, day: 29, year: 2000 }],
    ['Jordan’s birthday: Sept 3rd 1978', 'Jordan', { month: 9, day: 3, year: 1978 }],
  ])('extracts an explicit claim from %s', (text, personName, date) => {
    expect(extractExplicitBirthdayClaim(text)).toEqual({ personName, date });
  });

  it.each(monthAliases.flatMap(([longName, shortName, number]) => [
    [longName, number] as const,
    [shortName, number] as const,
  ]))('maps the supported month alias %s', (alias, expectedMonth) => {
    expect(extractExplicitBirthdayClaim(`Jordan's birthday is ${alias} 1`)?.date).toEqual({ month: expectedMonth, day: 1 });
  });

  it('does not invent a year and normalizes internal name spacing', () => {
    const claim = extractExplicitBirthdayClaim("Jordan   Smith's birthday is May 12");
    expect(claim?.personName).toBe('Jordan Smith');
    expect(claim === undefined ? true : 'year' in claim.date).toBe(false);
  });

  it.each([
    ["Jordan's birthday is January 0", false],
    ["Jordan's birthday is January 1", true],
    ["Jordan's birthday is January 31 1900", true],
    ["Jordan's birthday is January 31 2100", true],
    ["Jordan's birthday is January 31 2101", false],
  ])('enforces inclusive date boundaries for %s', (text, valid) => {
    expect(extractExplicitBirthdayClaim(text) !== undefined).toBe(valid);
  });

  it.each([
    'Jordan turns about forty soon',
    "Jordan's birthday is February 30",
    'Jordan was born on February 29 2001',
    "Jordan's birthday is May 12 1800",
    "Jordan's birthday may be May 12",
  ])('rejects ambiguous or impossible evidence: %s', (text) => {
    expect(extractExplicitBirthdayClaim(text)).toBeUndefined();
  });

  it('never throws for arbitrary Unicode text', () => {
    fc.assert(fc.property(fc.string(), (text) => {
      expect(() => extractExplicitBirthdayClaim(text)).not.toThrow();
    }));
  });
});
