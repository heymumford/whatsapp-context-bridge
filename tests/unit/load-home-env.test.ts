import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createConfig, loadHomeEnvironment } from '../../src/config/load-home-env.js';

describe('home environment configuration', () => {
  it('parses only well-formed named keys from an explicit home file', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'context-env-'));
    const file = path.join(directory, '.env');
    await writeFile(file, '# comment\nADMIN_TOKEN="admin"\nBAD KEY=nope\nPORT=0\n');
    expect(loadHomeEnvironment(file)).toEqual({ ADMIN_TOKEN: 'admin', PORT: '0' });
  });

  it('creates safe console-mode configuration', () => {
    expect(createConfig({
      WHATSAPP_VERIFY_TOKEN: 'verify',
      WHATSAPP_APP_SECRET: 'secret',
      ADMIN_TOKEN: 'admin',
      PORT: '0',
    })).toMatchObject({ outboundMode: 'console', port: 0 });
  });

  it('fails closed when required or conditional secrets are absent', () => {
    expect(() => createConfig({})).toThrow('WHATSAPP_VERIFY_TOKEN');
    expect(() => createConfig({
      WHATSAPP_VERIFY_TOKEN: 'verify', WHATSAPP_APP_SECRET: 'secret', ADMIN_TOKEN: 'admin',
      OUTBOUND_MODE: 'whatsapp',
    })).toThrow('requires');
    expect(() => createConfig({
      WHATSAPP_VERIFY_TOKEN: 'verify', WHATSAPP_APP_SECRET: 'secret', ADMIN_TOKEN: 'admin', PORT: '99999',
    })).toThrow('PORT');
  });
});
