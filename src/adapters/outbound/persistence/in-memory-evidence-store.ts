import type { EvidenceStore } from '../../../application/ports/evidence-store.js';
import { confirmCandidate, type BirthdayCandidate } from '../../../domain/birthday-candidate.js';

export class InMemoryEvidenceStore implements EvidenceStore {
  private readonly candidates = new Map<string, BirthdayCandidate>();

  public save(candidate: BirthdayCandidate): Promise<boolean> {
    if (this.candidates.has(candidate.id)) return Promise.resolve(false);
    this.candidates.set(candidate.id, candidate);
    return Promise.resolve(true);
  }

  public get(id: string): Promise<BirthdayCandidate | undefined> {
    return Promise.resolve(this.candidates.get(id));
  }

  public list(): Promise<readonly BirthdayCandidate[]> {
    return Promise.resolve([...this.candidates.values()]);
  }

  public markConfirmed(id: string, calendarEventId: string): Promise<BirthdayCandidate> {
    const candidate = this.candidates.get(id);
    if (candidate === undefined) throw new Error(`Candidate ${id} was not found`);
    const confirmed = confirmCandidate(candidate, calendarEventId);
    this.candidates.set(id, confirmed);
    return Promise.resolve(confirmed);
  }
}
