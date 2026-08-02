import type { ReviewNotifier } from '../../../application/ports/review-notifier.js';
import type { BirthdayCandidate } from '../../../domain/birthday-candidate.js';

export interface MetaWhatsAppConfiguration {
  readonly graphApiVersion: string;
  readonly phoneNumberId: string;
  readonly accessToken: string;
}

export class MetaWhatsAppReviewNotifier implements ReviewNotifier {
  public constructor(private readonly config: MetaWhatsAppConfiguration) {}

  public async notify(candidate: BirthdayCandidate): Promise<void> {
    const response = await fetch(
      `https://graph.facebook.com/${this.config.graphApiVersion}/${this.config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.config.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: candidate.evidence.senderId,
          type: 'text',
          text: {
            preview_url: false,
            body: `Review birthday candidate ${candidate.id}: ${candidate.personName}, ${String(candidate.date.month)}/${String(candidate.date.day)}.`,
          },
        }),
      },
    );
    if (!response.ok) throw new Error(`Meta message request failed with status ${String(response.status)}`);
  }
}
