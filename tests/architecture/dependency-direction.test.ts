import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { glob } from 'node:fs/promises';

describe('hexagonal dependency direction', () => {
  it('keeps domain and application independent from adapters and infrastructure', async () => {
    const violations: string[] = [];
    for await (const relative of glob('src/{domain,application}/**/*.ts')) {
      const content = await readFile(relative, 'utf8');
      if (/from ['"].*adapters\//u.test(content) || /from ['"]node:/u.test(content) || /from ['"]zod['"]/u.test(content)) {
        violations.push(path.normalize(relative));
      }
    }
    expect(violations).toEqual([]);
  });
});
