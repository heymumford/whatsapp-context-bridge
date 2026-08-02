import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { isAuthorized } from '../../src/adapters/inbound/http/authentication.js';
import { verifyMetaSignature } from '../../src/adapters/inbound/whatsapp/meta-signature-verifier.js';
import { verifyDeviceRelaySignature } from '../../src/adapters/inbound/device/device-relay-signature-verifier.js';

describe('P0 authenticity and authorization', () => {
  const secret = 'synthetic-app-secret';
  const body = Buffer.from('{"object":"whatsapp_business_account"}');
  const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

  it('accepts the exact signed bytes', () => {
    expect(verifyMetaSignature(body, signature, secret)).toBe(true);
  });

  it.each([
    undefined,
    'sha1=abc',
    'sha256=not-hex',
    `sha256=${'a'.repeat(63)}`,
    `sha256=${'a'.repeat(64)}`,
  ])('rejects a missing or malformed signature: %s', (candidate) => {
    expect(verifyMetaSignature(body, candidate, secret)).toBe(false);
  });

  it('rejects even a one-byte body mutation', () => {
    expect(verifyMetaSignature(Buffer.concat([body, Buffer.from(' ')]), signature, secret)).toBe(false);
  });

  it('uses an exact bearer token', () => {
    expect(isAuthorized('Bearer synthetic-admin', 'synthetic-admin')).toBe(true);
    expect(isAuthorized('Bearer synthetic-admin-x', 'synthetic-admin')).toBe(false);
    expect(isAuthorized(undefined, 'synthetic-admin')).toBe(false);
  });

  it('accepts a fresh signed device message and rejects a replay', () => {
    const timestamp = '1785600000000';
    const relaySignature = `sha256=${createHmac('sha256', secret).update(timestamp).update('.').update(body).digest('hex')}`;
    expect(verifyDeviceRelaySignature(body, timestamp, relaySignature, secret, 1_785_600_000_000)).toBe(true);
    expect(verifyDeviceRelaySignature(body, timestamp, relaySignature, secret, 1_785_600_600_001)).toBe(false);
    expect(verifyDeviceRelaySignature(body, undefined, relaySignature, secret, 1_785_600_000_000)).toBe(false);
  });
});
