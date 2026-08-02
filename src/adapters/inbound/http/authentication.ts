import { createHash, timingSafeEqual } from 'node:crypto';

export function isAuthorized(authorization: string | undefined, expectedToken: string): boolean {
  if (!authorization?.startsWith('Bearer ')) return false;
  const supplied = authorization.slice('Bearer '.length);
  const suppliedHash = createHash('sha256').update(supplied).digest();
  const expectedHash = createHash('sha256').update(expectedToken).digest();
  return timingSafeEqual(suppliedHash, expectedHash);
}
