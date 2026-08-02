import type { BirthdayCandidate } from '../../domain/birthday-candidate.js';

export interface EvidenceStore {
  save(candidate: BirthdayCandidate): Promise<boolean>;
  get(id: string): Promise<BirthdayCandidate | undefined>;
  list(): Promise<readonly BirthdayCandidate[]>;
  markConfirmed(id: string, calendarEventId: string): Promise<BirthdayCandidate>;
}
