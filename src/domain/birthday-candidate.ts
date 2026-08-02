export interface SourceEvidence {
  readonly channel: 'whatsapp-business' | 'whatsapp-export' | 'whatsapp-notification' | 'sms-android';
  readonly sourceMessageId: string;
  readonly senderId: string;
  readonly excerpt: string;
  readonly receivedAt: string;
}

export interface BirthdayDate {
  readonly month: number;
  readonly day: number;
  readonly year?: number;
}

export type CandidateStatus = 'pending' | 'confirmed';

export interface BirthdayCandidate {
  readonly id: string;
  readonly personName: string;
  readonly date: BirthdayDate;
  readonly evidence: SourceEvidence;
  readonly status: CandidateStatus;
  readonly calendarEventId?: string;
}

export interface ExplicitBirthdayClaim {
  readonly personName: string;
  readonly date: BirthdayDate;
}

export function createPendingCandidate(
  id: string,
  claim: ExplicitBirthdayClaim,
  evidence: SourceEvidence,
): BirthdayCandidate {
  return {
    id,
    personName: claim.personName,
    date: claim.date,
    evidence,
    status: 'pending',
  };
}

export function confirmCandidate(
  candidate: BirthdayCandidate,
  calendarEventId: string,
): BirthdayCandidate {
  return { ...candidate, status: 'confirmed', calendarEventId };
}
