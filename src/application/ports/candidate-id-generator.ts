import type { ExplicitBirthdayClaim, SourceEvidence } from '../../domain/birthday-candidate.js';

export interface CandidateIdGenerator {
  generate(claim: ExplicitBirthdayClaim, evidence: SourceEvidence): string;
}
