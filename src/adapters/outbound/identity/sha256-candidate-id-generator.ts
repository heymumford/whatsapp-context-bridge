import { createHash } from 'node:crypto';
import type { CandidateIdGenerator } from '../../../application/ports/candidate-id-generator.js';
import type { ExplicitBirthdayClaim, SourceEvidence } from '../../../domain/birthday-candidate.js';

export class Sha256CandidateIdGenerator implements CandidateIdGenerator {
  public generate(claim: ExplicitBirthdayClaim, evidence: SourceEvidence): string {
    return createHash('sha256')
      .update(`${evidence.channel}\0${evidence.sourceMessageId}\0${claim.personName}\0${String(claim.date.month)}-${String(claim.date.day)}`)
      .digest('hex')
      .slice(0, 24);
  }
}
