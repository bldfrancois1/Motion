#!/usr/bin/env node
/**
 * Renders the same frames twice, sequentially and in parallel (different
 * frame order per tab), and fails if any frame differs. Catches clocks that
 * leak into the render: GSAP ticking on its own, Math.random, Date.now,
 * state carried from the previous frame.
 *
 *   npm run check:determinism -- [composition] [from-to] [extra remotion flags]
 *   npm run check:determinism -- Scene-Position 80-140
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync, readdirSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [composition = 'Doctrine', frames = '0-60', ...extra] = process.argv.slice(2);

const render = (concurrency) => {
  const dir = mkdtempSync(join(tmpdir(), `det-${concurrency}-`));
  execFileSync(
    'npx',
    ['remotion', 'render', composition, dir, '--sequence', `--frames=${frames}`, '--image-format=png', `--concurrency=${concurrency}`, '--log=error', ...extra],
    {stdio: 'inherit'},
  );
  const hashes = Object.fromEntries(
    readdirSync(dir)
      .sort()
      .map((f) => [f, createHash('sha256').update(readFileSync(join(dir, f))).digest('hex')]),
  );
  rmSync(dir, {recursive: true, force: true});
  return hashes;
};

const a = render(1);
const b = render(4);
const names = Object.keys(a);
const diff = names.filter((n) => a[n] !== b[n]);

if (names.length === 0) {
  console.error('No frames rendered.');
  process.exit(1);
}
if (diff.length) {
  console.error(`✗ ${diff.length}/${names.length} frames differ between runs: ${diff.slice(0, 10).join(', ')}`);
  process.exit(1);
}
console.log(`✓ ${names.length} frames identical across sequential and parallel renders (${composition}, ${frames}).`);
