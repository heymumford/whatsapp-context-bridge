import { createHmac } from 'node:crypto';
import { mkdtemp, readdir, readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { composeApplication } from '../../src/composition-root.js';
import type { AppConfig } from '../../src/config/load-home-env.js';

describe('P0 signed evidence-to-calendar acceptance flow', () => {
  let baseUrl: string;
  let calendarDirectory: string;
  let application: ReturnType<typeof composeApplication>;

  beforeEach(async () => {
    calendarDirectory = await mkdtemp(path.join(os.tmpdir(), 'context-integration-'));
    const config: AppConfig = {
      verifyToken: 'synthetic-verify', appSecret: 'synthetic-secret', adminToken: 'synthetic-admin',
      deviceRelaySecret: 'synthetic-device-secret',
      graphApiVersion: 'v-test', outboundMode: 'console', calendarDirectory, port: 0,
    };
    application = composeApplication(config, 2026);
    await new Promise<void>((resolve) => application.server.listen(0, '127.0.0.1', resolve));
    const address = application.server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${String(address.port)}`;
  });

  afterEach(async () => new Promise<void>((resolve, reject) => application.server.close((error) => {
    if (error === undefined) resolve(); else reject(error);
  })));

  it('verifies, ingests, reviews, confirms, and deduplicates', async () => {
    const challenge = await fetch(`${baseUrl}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=synthetic-verify&hub.challenge=challenge-123`);
    expect(challenge.status).toBe(200);
    expect(await challenge.text()).toBe('challenge-123');

    const body = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ field: 'messages', value: { messages: [{
        from: 'synthetic-sender', id: 'wamid.integration', timestamp: '1785600000', type: 'text',
        text: { body: "Jordan's birthday is May 12" },
      }] } }] }],
    });
    const signature = `sha256=${createHmac('sha256', 'synthetic-secret').update(body).digest('hex')}`;
    const post = (): Promise<Response> => fetch(`${baseUrl}/webhooks/whatsapp`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': signature }, body,
    });
    expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(200);

    expect((await fetch(`${baseUrl}/candidates`)).status).toBe(401);
    const queue = await fetch(`${baseUrl}/candidates`, { headers: { authorization: 'Bearer synthetic-admin' } });
    const queueBody = await queue.json() as { candidates: { id: string; evidence: { excerpt: string } }[] };
    expect(queueBody.candidates).toHaveLength(1);
    expect(queueBody.candidates[0]?.evidence.excerpt).toBe("Jordan's birthday is May 12");

    const id = queueBody.candidates[0]?.id;
    expect(id).toBeDefined();
    if (id === undefined) throw new Error('Expected a candidate ID');
    const confirmationUrl = `${baseUrl}/candidates/${id}/confirm`;
    expect((await fetch(confirmationUrl, { method: 'POST' })).status).toBe(401);
    const confirm = (): Promise<Response> => fetch(confirmationUrl, { method: 'POST', headers: { authorization: 'Bearer synthetic-admin' } });
    expect((await confirm()).status).toBe(200);
    expect((await confirm()).status).toBe(200);

    const files = await readdir(calendarDirectory);
    expect(files).toHaveLength(1);
    expect(await readFile(path.join(calendarDirectory, files[0] ?? ''), 'utf8')).toContain('RRULE:FREQ=YEARLY');
  });

  it('fails closed for bad verification, signature, payload, routes, and candidate IDs', async () => {
    expect((await fetch(`${baseUrl}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=x`)).status).toBe(403);
    expect((await fetch(`${baseUrl}/webhooks/whatsapp`, { method: 'POST', body: '{}' })).status).toBe(401);
    const invalidBody = 'not-json';
    const signature = `sha256=${createHmac('sha256', 'synthetic-secret').update(invalidBody).digest('hex')}`;
    expect((await fetch(`${baseUrl}/webhooks/whatsapp`, { method: 'POST', headers: { 'x-hub-signature-256': signature }, body: invalidBody })).status).toBe(400);
    expect((await fetch(`${baseUrl}/missing`)).status).toBe(404);
    expect((await fetch(`${baseUrl}/candidates/0123456789abcdef01234567/confirm`, {
      method: 'POST', headers: { authorization: 'Bearer synthetic-admin' },
    })).status).toBe(404);
  });

  it('accepts a fresh HMAC-signed personal Android relay message', async () => {
    const body = JSON.stringify({
      channel: 'sms-android', id: 'sms.synthetic.1', senderId: 'synthetic-sender',
      text: "Casey's birthday is June 7", receivedAt: '2026-08-01T12:00:00-04:00',
    });
    const timestamp = String(Date.now());
    const signature = `sha256=${createHmac('sha256', 'synthetic-device-secret').update(timestamp).update('.').update(body).digest('hex')}`;
    const response = await fetch(`${baseUrl}/webhooks/device`, {
      method: 'POST',
      headers: { 'x-bridge-timestamp': timestamp, 'x-bridge-signature': signature },
      body,
    });
    expect(response.status).toBe(200);
    expect(await application.store.list()).toHaveLength(1);
    expect((await application.store.list())[0]?.evidence.channel).toBe('sms-android');
  });
});
