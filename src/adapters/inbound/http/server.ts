import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { ZodError } from 'zod';
import type { EvidenceStore } from '../../../application/ports/evidence-store.js';
import { CandidateNotFoundError, type ConfirmBirthdayCandidate } from '../../../application/use-cases/confirm-birthday-candidate.js';
import type { IngestPersonalMessage } from '../../../application/use-cases/ingest-personal-message.js';
import { isAuthorized } from './authentication.js';
import { verifyMetaSignature } from '../whatsapp/meta-signature-verifier.js';
import { parseMetaTextMessages } from '../whatsapp/meta-webhook-parser.js';
import { parseDeviceRelayMessage } from '../device/device-relay-parser.js';
import { verifyDeviceRelaySignature } from '../device/device-relay-signature-verifier.js';

export interface HttpServerDependencies {
  readonly verifyToken: string;
  readonly appSecret: string;
  readonly adminToken: string;
  readonly deviceRelaySecret?: string;
  readonly ingest: IngestPersonalMessage;
  readonly confirm: ConfirmBirthdayCandidate;
  readonly store: EvidenceStore;
}

const maximumBodyBytes = 1_048_576;

export function createHttpServer(dependencies: HttpServerDependencies): Server {
  return createServer((request, response) => {
    void route(request, response, dependencies);
  });
}

async function route(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: HttpServerDependencies,
): Promise<void> {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/healthz') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/webhooks/whatsapp') {
      verifyWebhook(url, response, dependencies.verifyToken);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/webhooks/whatsapp') {
      const body = await readBody(request);
      if (!verifyMetaSignature(body, header(request, 'x-hub-signature-256'), dependencies.appSecret)) {
        sendJson(response, 401, { error: 'invalid signature' });
        return;
      }
      const messages = parseMetaTextMessages(JSON.parse(body.toString('utf8')) as unknown);
      const candidates = await Promise.all(messages.map(async (message) => dependencies.ingest.execute(message)));
      sendJson(response, 200, { accepted: messages.length, candidates: candidates.filter(Boolean).length });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/webhooks/device' && dependencies.deviceRelaySecret !== undefined) {
      const body = await readBody(request);
      if (!verifyDeviceRelaySignature(
        body,
        header(request, 'x-bridge-timestamp'),
        header(request, 'x-bridge-signature'),
        dependencies.deviceRelaySecret,
      )) {
        sendJson(response, 401, { error: 'invalid device signature' });
        return;
      }
      const candidate = await dependencies.ingest.execute(parseDeviceRelayMessage(JSON.parse(body.toString('utf8')) as unknown));
      sendJson(response, 200, { accepted: 1, candidates: candidate === undefined ? 0 : 1 });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/candidates') {
      if (!isAuthorized(header(request, 'authorization'), dependencies.adminToken)) {
        sendJson(response, 401, { error: 'unauthorized' });
        return;
      }
      sendJson(response, 200, { candidates: await dependencies.store.list() });
      return;
    }

    const confirmationMatch = /^\/candidates\/([a-f\d]{24})\/confirm$/u.exec(url.pathname);
    if (request.method === 'POST' && confirmationMatch?.[1] !== undefined) {
      if (!isAuthorized(header(request, 'authorization'), dependencies.adminToken)) {
        sendJson(response, 401, { error: 'unauthorized' });
        return;
      }
      const receipt = await dependencies.confirm.execute(confirmationMatch[1]);
      sendJson(response, 200, receipt);
      return;
    }

    sendJson(response, 404, { error: 'not found' });
  } catch (error: unknown) {
    if (error instanceof CandidateNotFoundError) {
      sendJson(response, 404, { error: 'candidate not found' });
      return;
    }
    if (error instanceof ZodError || error instanceof SyntaxError) {
      sendJson(response, 400, { error: 'invalid payload' });
      return;
    }
    if (error instanceof BodyTooLargeError) {
      sendJson(response, 413, { error: 'payload too large' });
      return;
    }
    console.error('Unhandled request error', error);
    sendJson(response, 500, { error: 'internal error' });
  }
}

function verifyWebhook(url: URL, response: ServerResponse, expectedToken: string): void {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === expectedToken && challenge !== null) {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(challenge);
    return;
  }
  sendJson(response, 403, { error: 'verification failed' });
}

class BodyTooLargeError extends Error {}

async function readBody(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array);
    total += buffer.length;
    if (total > maximumBodyBytes) throw new BodyTooLargeError();
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function header(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(value));
}
