import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface AppConfig {
  readonly verifyToken: string;
  readonly appSecret: string;
  readonly adminToken: string;
  readonly deviceRelaySecret?: string;
  readonly accessToken?: string;
  readonly phoneNumberId?: string;
  readonly graphApiVersion: string;
  readonly outboundMode: 'console' | 'whatsapp';
  readonly calendarDirectory: string;
  readonly port: number;
}

export function loadHomeEnvironment(filePath = path.join(os.homedir(), '.env')): Readonly<Record<string, string>> {
  const contents = readFileSync(filePath, 'utf8');
  return Object.freeze(parseEnvironment(contents));
}

export function createConfig(environment: Readonly<Record<string, string | undefined>>): AppConfig {
  const outboundMode = environment.OUTBOUND_MODE === 'whatsapp' ? 'whatsapp' : 'console';
  const accessToken = optional(environment, 'WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = optional(environment, 'WHATSAPP_PHONE_NUMBER_ID');
  const deviceRelaySecret = optional(environment, 'DEVICE_RELAY_SECRET');
  if (outboundMode === 'whatsapp' && (accessToken === undefined || phoneNumberId === undefined)) {
    throw new Error('WhatsApp outbound mode requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
  }

  const port = Number(environment.PORT ?? '3000');
  if (!Number.isInteger(port) || port < 0 || port > 65_535) throw new Error('PORT must be an integer from 0 through 65535');

  return {
    verifyToken: required(environment, 'WHATSAPP_VERIFY_TOKEN'),
    appSecret: required(environment, 'WHATSAPP_APP_SECRET'),
    adminToken: required(environment, 'ADMIN_TOKEN'),
    ...(deviceRelaySecret === undefined ? {} : { deviceRelaySecret }),
    ...(accessToken === undefined ? {} : { accessToken }),
    ...(phoneNumberId === undefined ? {} : { phoneNumberId }),
    graphApiVersion: environment.WHATSAPP_GRAPH_API_VERSION ?? 'v23.0',
    outboundMode,
    calendarDirectory: environment.CALENDAR_DIRECTORY ?? './data/calendar',
    port,
  };
}

function parseEnvironment(contents: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/u, '$2');
    if (/^[A-Z][A-Z0-9_]*$/u.test(key)) result[key] = value;
  }
  return result;
}

function required(environment: Readonly<Record<string, string | undefined>>, key: string): string {
  const value = optional(environment, key);
  if (value === undefined) throw new Error(`${key} is required in ~/.env`);
  return value;
}

function optional(environment: Readonly<Record<string, string | undefined>>, key: string): string | undefined {
  const value = environment[key];
  return value === undefined || value.trim().length === 0 ? undefined : value;
}
