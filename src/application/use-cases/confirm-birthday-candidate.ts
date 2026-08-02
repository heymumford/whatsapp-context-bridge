import type { CalendarPublisher, CalendarReceipt } from '../ports/calendar-publisher.js';
import type { EvidenceStore } from '../ports/evidence-store.js';

export class CandidateNotFoundError extends Error {}

export class ConfirmBirthdayCandidate {
  public constructor(
    private readonly store: EvidenceStore,
    private readonly calendar: CalendarPublisher,
  ) {}

  public async execute(candidateId: string): Promise<CalendarReceipt> {
    const candidate = await this.store.get(candidateId);
    if (candidate === undefined) throw new CandidateNotFoundError(`Candidate ${candidateId} was not found`);

    if (candidate.status === 'confirmed' && candidate.calendarEventId !== undefined) {
      return { externalId: candidate.calendarEventId };
    }

    const receipt = await this.calendar.publish(candidate);
    await this.store.markConfirmed(candidateId, receipt.externalId);
    return receipt;
  }
}
