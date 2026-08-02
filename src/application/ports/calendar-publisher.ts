import type { BirthdayCandidate } from '../../domain/birthday-candidate.js';

export interface CalendarReceipt {
  readonly externalId: string;
}

export interface CalendarPublisher {
  publish(candidate: BirthdayCandidate): Promise<CalendarReceipt>;
}
