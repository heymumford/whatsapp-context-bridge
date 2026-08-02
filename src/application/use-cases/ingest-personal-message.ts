import type { CandidateIdGenerator } from '../ports/candidate-id-generator.js';
import type { EvidenceStore } from '../ports/evidence-store.js';
import type { ReviewNotifier } from '../ports/review-notifier.js';
import { createPendingCandidate, type BirthdayCandidate, type SourceEvidence } from '../../domain/birthday-candidate.js';
import { extractExplicitBirthdayClaim } from '../../domain/explicit-birthday-extractor.js';

export type PersonalMessageChannel = SourceEvidence['channel'];

export interface InboundPersonalMessage {
  readonly channel: PersonalMessageChannel;
  readonly id: string;
  readonly senderId: string;
  readonly text: string;
  readonly receivedAt: string;
}

export class IngestPersonalMessage {
  public constructor(
    private readonly ids: CandidateIdGenerator,
    private readonly store: EvidenceStore,
    private readonly notifier: ReviewNotifier,
  ) {}

  public async execute(message: InboundPersonalMessage): Promise<BirthdayCandidate | undefined> {
    const claim = extractExplicitBirthdayClaim(message.text);
    if (claim === undefined) return undefined;

    const evidence: SourceEvidence = {
      channel: message.channel,
      sourceMessageId: message.id,
      senderId: message.senderId,
      excerpt: message.text,
      receivedAt: message.receivedAt,
    };
    const candidate = createPendingCandidate(this.ids.generate(claim, evidence), claim, evidence);
    const created = await this.store.save(candidate);
    if (!created) return this.store.get(candidate.id);
    await this.notifier.notify(candidate);
    return candidate;
  }
}
