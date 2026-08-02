import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMetaSignature(rawBody: Buffer, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const suppliedHex = signatureHeader.slice('sha256='.length);
  if (!/^[a-f\d]{64}$/iu.test(suppliedHex)) return false;

  const expected = createHmac('sha256', appSecret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedHex, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
