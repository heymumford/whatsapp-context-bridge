import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', 'dist', 'coverage', 'data']);
const allowedEnvironmentFile = '.env.example';
const findings = [];
const sensitivePatterns = [
  { name: 'Meta token', pattern: /EAA[A-Za-z0-9]{40,}/u },
  { name: 'OpenAI key', pattern: /sk-[A-Za-z0-9_-]{20,}/u },
  { name: 'GitHub token', pattern: /gh[pousr]_[A-Za-z0-9]{20,}/u },
  { name: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u },
  { name: 'formatted US phone number', pattern: /(?:\+1[-. (]*\d{3}[-. )]+\d{3}[-. ]+\d{4}|\(\d{3}\)\s*\d{3}[-. ]\d{4})/u },
];

for (const file of await walk(root)) {
  const relative = path.relative(root, file);
  const base = path.basename(file);
  if (base.startsWith('.env') && base !== allowedEnvironmentFile) findings.push(`${relative}: environment file`);
  const content = await readFile(file, 'utf8').catch(() => undefined);
  if (content === undefined) continue;
  for (const sensitive of sensitivePatterns) {
    if (sensitive.pattern.test(content)) findings.push(`${relative}: possible ${sensitive.name}`);
  }
}

if (findings.length > 0) {
  console.error(`Public-safety scan failed:\n${findings.map((finding) => `- ${finding}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.info('Public-safety scan passed.');
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}
