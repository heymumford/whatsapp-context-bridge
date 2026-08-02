import { createHmac, timingSafeEqual } from 'node:crypto';

const maximumClockSkewMilliseconds = 5 * 60 * 1_000;

export function verifyDeviceRelaySignature(
  rawBody: Buffer,
  timestampHeader: string | undefined,
  signatureHeader: string | undefined,
  secret: string,
  nowMilliseconds = Date.now(),
): boolean {
  if (timestampHeader === undefined || !/^\d{10,13}$/u.test(timestampHeader)) return false;
  const timestamp = Number(timestampHeader);
  const timestampMilliseconds = timestampHeader.length === 10 ? timestamp * 1_000 : timestamp;
  if (Math.abs(nowMilliseconds - timestampMilliseconds) > maximumClockSkewMilliseconds) return false;
  if (signatureHeader === undefined || !/^sha256=[a-f\d]{64}$/iu.test(signatureHeader)) return false;

  const expected = createHmac('sha256', secret).update(timestampHeader).update('.').update(rawBody).digest();
  const supplied = Buffer.from(signatureHeader.slice('sha256='.length), 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
