import type { ReviewNotifier } from '../../../application/ports/review-notifier.js';
import type { BirthdayCandidate } from '../../../domain/birthday-candidate.js';

export class ConsoleReviewNotifier implements ReviewNotifier {
  public notify(candidate: BirthdayCandidate): Promise<void> {
    console.info('Birthday candidate awaiting review', {
      candidateId: candidate.id,
      month: candidate.date.month,
      day: candidate.date.day,
    });
    return Promise.resolve();
  }
}
