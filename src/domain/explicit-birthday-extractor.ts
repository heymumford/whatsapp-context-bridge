import type { BirthdayDate, ExplicitBirthdayClaim } from './birthday-candidate.js';

const months = new Map<string, number>([
  ['january', 1], ['jan', 1], ['february', 2], ['feb', 2],
  ['march', 3], ['mar', 3], ['april', 4], ['apr', 4],
  ['may', 5], ['june', 6], ['jun', 6], ['july', 7], ['jul', 7],
  ['august', 8], ['aug', 8], ['september', 9], ['sep', 9], ['sept', 9],
  ['october', 10], ['oct', 10], ['november', 11], ['nov', 11],
  ['december', 12], ['dec', 12],
]);

const name = String.raw`(?<name>[\p{L}][\p{L} .'-]{0,79}?)`;
const month = String.raw`(?<month>January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept?|October|Oct|November|Nov|December|Dec)`;
const day = String.raw`(?<day>\d{1,2})(?:st|nd|rd|th)?`;
const year = String.raw`(?:,?\s+(?<year>\d{4}))?`;

const patterns = [
  new RegExp(String.raw`\b${name}(?:'s|’s)\s+birthday\s+is\s+${month}\s+${day}${year}\b`, 'iu'),
  new RegExp(String.raw`\b${name}\s+was\s+born\s+on\s+${month}\s+${day}${year}\b`, 'iu'),
  new RegExp(String.raw`\b${name}(?:'s|’s)?\s+birthday\s*:\s*${month}\s+${day}${year}\b`, 'iu'),
];

export function extractExplicitBirthdayClaim(text: string): ExplicitBirthdayClaim | undefined {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.groups === undefined) continue;

    const captures = match.groups as { name: string; month: string; day: string; year?: string };
    const matchedName = captures.name;
    const matchedMonth = captures.month;
    const matchedDay = captures.day;

    const parsedMonth = requireMappedMonth(months.get(matchedMonth.toLowerCase()));
    const parsedDay = Number(matchedDay);
    const parsedYear = captures.year === undefined ? undefined : Number(captures.year);

    if (!isValidDate(parsedMonth, parsedDay, parsedYear)) continue;

    const date: BirthdayDate = parsedYear === undefined
      ? { month: parsedMonth, day: parsedDay }
      : { month: parsedMonth, day: parsedDay, year: parsedYear };

    return { personName: normalizeName(matchedName), date };
  }

  return undefined;
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function requireMappedMonth(value: number | undefined): number {
  if (value === undefined) throw new Error('Birthday month grammar and lookup table are inconsistent');
  return value;
}

function isValidDate(month: number, day: number, year?: number): boolean {
  if (year !== undefined && (year < 1900 || year > 2100)) return false;
  const validationYear = year ?? 2000;
  const daysInMonth = new Date(Date.UTC(validationYear, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}
