import type { CalendarPublisher, CalendarReceipt } from '../../src/application/ports/calendar-publisher.js';
import type { CandidateIdGenerator } from '../../src/application/ports/candidate-id-generator.js';
import type { ReviewNotifier } from '../../src/application/ports/review-notifier.js';
import type { BirthdayCandidate, ExplicitBirthdayClaim, SourceEvidence } from '../../src/domain/birthday-candidate.js';

export class FixedCandidateIdGenerator implements CandidateIdGenerator {
  public constructor(private readonly id = '0123456789abcdef01234567') {}
  public generate(claim: ExplicitBirthdayClaim, evidence: SourceEvidence): string {
    void claim;
    void evidence;
    return this.id;
  }
}

export class SpyReviewNotifier implements ReviewNotifier {
  public readonly candidates: BirthdayCandidate[] = [];
  public notify(candidate: BirthdayCandidate): Promise<void> {
    this.candidates.push(candidate);
    return Promise.resolve();
  }
}

export class SpyCalendarPublisher implements CalendarPublisher {
  public readonly candidates: BirthdayCandidate[] = [];
  public publish(candidate: BirthdayCandidate): Promise<CalendarReceipt> {
    this.candidates.push(candidate);
    return Promise.resolve({ externalId: `${candidate.id}@test-calendar` });
  }
}
