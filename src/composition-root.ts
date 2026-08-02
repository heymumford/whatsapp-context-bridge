import { ConfirmBirthdayCandidate } from './application/use-cases/confirm-birthday-candidate.js';
import { IngestPersonalMessage } from './application/use-cases/ingest-personal-message.js';
import { createHttpServer } from './adapters/inbound/http/server.js';
import { IcsCalendarPublisher } from './adapters/outbound/calendar/ics-calendar-publisher.js';
import { Sha256CandidateIdGenerator } from './adapters/outbound/identity/sha256-candidate-id-generator.js';
import { ConsoleReviewNotifier } from './adapters/outbound/notifications/console-review-notifier.js';
import { MetaWhatsAppReviewNotifier } from './adapters/outbound/notifications/meta-whatsapp-review-notifier.js';
import { InMemoryEvidenceStore } from './adapters/outbound/persistence/in-memory-evidence-store.js';
import type { ReviewNotifier } from './application/ports/review-notifier.js';
import type { AppConfig } from './config/load-home-env.js';
import type { Server } from 'node:http';

export interface ComposedApplication {
  readonly server: Server;
  readonly store: InMemoryEvidenceStore;
  readonly ingest: IngestPersonalMessage;
  readonly confirm: ConfirmBirthdayCandidate;
}

export function composeApplication(config: AppConfig, seriesStartYear = new Date().getUTCFullYear()): ComposedApplication {
  const store = new InMemoryEvidenceStore();
  const notifier = createNotifier(config);
  const ingest = new IngestPersonalMessage(new Sha256CandidateIdGenerator(), store, notifier);
  const calendar = new IcsCalendarPublisher(config.calendarDirectory, seriesStartYear);
  const confirm = new ConfirmBirthdayCandidate(store, calendar);
  const server = createHttpServer({
    verifyToken: config.verifyToken,
    appSecret: config.appSecret,
    adminToken: config.adminToken,
    ...(config.deviceRelaySecret === undefined ? {} : { deviceRelaySecret: config.deviceRelaySecret }),
    ingest,
    confirm,
    store,
  });
  return { server, store, ingest, confirm };
}

function createNotifier(config: AppConfig): ReviewNotifier {
  if (config.outboundMode === 'console') return new ConsoleReviewNotifier();
  if (config.accessToken === undefined || config.phoneNumberId === undefined) {
    throw new Error('WhatsApp notifier configuration is incomplete');
  }
  return new MetaWhatsAppReviewNotifier({
    graphApiVersion: config.graphApiVersion,
    phoneNumberId: config.phoneNumberId,
    accessToken: config.accessToken,
  });
}
