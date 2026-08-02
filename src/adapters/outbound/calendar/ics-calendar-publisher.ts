import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CalendarPublisher, CalendarReceipt } from '../../../application/ports/calendar-publisher.js';
import type { BirthdayCandidate } from '../../../domain/birthday-candidate.js';

export class IcsCalendarPublisher implements CalendarPublisher {
  public constructor(
    private readonly directory: string,
    private readonly seriesStartYear: number,
  ) {}

  public async publish(candidate: BirthdayCandidate): Promise<CalendarReceipt> {
    const externalId = `${candidate.id}@whatsapp-context-bridge`;
    const fileName = `${candidate.id}.ics`;
    await mkdir(this.directory, { recursive: true });
    await writeFile(path.join(this.directory, fileName), renderCalendar(candidate, externalId, this.seriesStartYear), {
      encoding: 'utf8',
      mode: 0o600,
    });
    return { externalId };
  }
}

function renderCalendar(candidate: BirthdayCandidate, uid: string, startYear: number): string {
  const date = `${String(startYear).padStart(4, '0')}${String(candidate.date.month).padStart(2, '0')}${String(candidate.date.day).padStart(2, '0')}`;
  const summary = escapeIcs(`${candidate.personName}'s Birthday`);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mumford Engineering//WhatsApp Context Bridge//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${date}`,
    'RRULE:FREQ=YEARLY',
    `SUMMARY:${summary}`,
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

function escapeIcs(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n');
}
