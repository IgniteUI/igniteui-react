/**
 * Validates that the built `dist/` output honors the publish contract of every
 * package manifest under `scripts/*.package.json`.
 *
 * Why this exists:
 * The release pipeline publishes each package by copying its manifest into
 * `dist/package.json` and running `npm publish` from `dist/`, with a `files`
 * allowlist restricting what ships. If the emitted `.d.ts` files are not next to
 * their `.js` counterparts (or not where `exports` point), consumers hit errors
 * like: "Could not find a declaration file for module 'igniteui-react'". That is
 * exactly what happened when `tsconfig` `rootDir` changed and shifted the
 * declarations, and it went unnoticed for months.
 *
 * What it checks, per package (against the REAL packed output, so the `files`
 * allowlist is respected just like a real publish):
 *   1. `@arethetypeswrong/cli` resolves the types (and their JS) for every
 *      `exports` entrypoint. `--profile esm-only` ignores the legacy node10/CJS
 *      modes these ESM-only packages intentionally don't support; a non-zero
 *      exit means a real problem.
 *   2. A small backstop: attw is types-first and won't flag a missing runtime
 *      file when the `.d.ts` still resolves, so we confirm every JS entrypoint
 *      is in the set npm would actually publish (computed with `npm-packlist`,
 *      npm's own packing library, so the `files` allowlist is honored).
 *
 * Usage: `npm run validate:dist` (requires a prior `npm run build`).
 */

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import packlist from 'npm-packlist';
import { DIST, publishManifests, ROOT, readJson, SCRIPTS } from './paths';
import type { PackageJson } from './types';

const DIST_PKG = join(DIST, 'package.json');

/** Collect every string leaf from a nested `exports` value. */
function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) {
      collectStrings(child, out);
    }
  }
}

/** The exact set of files npm would publish from `dist/` (honors `files`). */
async function packedFiles(manifest: object): Promise<Set<string>> {
  // npm-packlist reads the allowlist from an in-memory tree; these packages
  // have no bundled deps, so a minimal tree (empty edgesOut) is all it needs.
  const tree = { package: manifest, path: DIST, isProjectRoot: true, edgesOut: new Map() };
  const files = await packlist(tree);
  return new Set(files.map((file) => file.replace(/\\/g, '/')));
}

/** Returns whether the package described by `manifest` is publishable as built. */
async function validate(manifest: string): Promise<boolean> {
  copyFileSync(join(SCRIPTS, manifest), DIST_PKG);
  const pkg = readJson<PackageJson>(DIST_PKG);
  console.log(`\n=== ${pkg.name} ===`);
  let ok = true;

  // 1. attw: types + their JS must resolve for every entrypoint.
  try {
    execSync(`npx --no-install attw --pack "${DIST}" --profile esm-only`, {
      cwd: ROOT,
      stdio: 'inherit',
    });
  } catch {
    ok = false;
  }

  // 2. Backstop: every JS entrypoint must be in the published file set.
  const packed = await packedFiles(pkg);
  const targets = [pkg.main, pkg.module].filter(Boolean) as string[];
  collectStrings(pkg.exports, targets);
  for (const target of targets) {
    if (!target.endsWith('.js') || target.includes('*')) {
      continue;
    }
    if (!packed.has(target.replace(/^\.\//, ''))) {
      console.error(`  ✗ JS entry "${target}" is not in the published files.`);
      ok = false;
    }
  }

  return ok;
}

async function main(): Promise<void> {
  if (!existsSync(join(DIST, 'components.js'))) {
    console.error('dist/ output not found. Run `npm run build` before `npm run validate:dist`.');
    process.exit(1);
  }

  const backup = existsSync(DIST_PKG) ? readFileSync(DIST_PKG) : null;
  let failed = false;
  try {
    for (const manifest of publishManifests()) {
      failed = !(await validate(manifest)) || failed;
    }
  } finally {
    if (backup) {
      writeFileSync(DIST_PKG, backup);
    } else if (existsSync(DIST_PKG)) {
      rmSync(DIST_PKG);
    }
  }

  if (failed) {
    console.error('\ndist validation failed.');
    process.exit(1);
  }
  console.log('\ndist validation passed for all packages.');
}

await main();
