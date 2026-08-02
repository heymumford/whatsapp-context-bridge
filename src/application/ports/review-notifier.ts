import type { BirthdayCandidate } from '../../domain/birthday-candidate.js';

export interface ReviewNotifier {
  notify(candidate: BirthdayCandidate): Promise<void>;
}
