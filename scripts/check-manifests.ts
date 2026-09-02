/**
 * Checks that the publish manifests under `scripts/*.package.json` declare dependency
 * ranges satisfied by the versions actually installed - and therefore built and tested
 * against.
 *
 * The manifests are hand-maintained separately from the root `package.json`. Bumping a
 * dependency for the build without widening the published range ships a package whose
 * declared range excludes the code it was compiled against, which surfaces as duplicated
 * or mismatched packages in consumer installs. That drift has to be caught before publish,
 * not after.
 *
 * Ranges intentionally stay looser than the root's (a published `lit: ^3.3.0` while
 * developing against `3.3.3` is a supported-floor statement), so only satisfaction is
 * enforced - not equality.
 *
 * Usage: `npm run check:manifests`
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { NODE_MODULES, publishManifests, readJson, SCRIPTS } from './paths';
import type { PackageJson } from './types';

type Version = [major: number, minor: number, patch: number];

/** Parses `x.y.z`, ignoring any prerelease/build metadata. */
function parseVersion(value: string): Version | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(value.trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

function compare(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Whether `version` satisfies `range`.
 *
 * Supports the exact, `~` and `^` forms the publish manifests use. Anything else throws
 * rather than silently passing, so an unhandled range can't quietly disable the check.
 */
function satisfies(version: Version, range: string): boolean {
  const trimmed = range.trim();
  const operator = trimmed.startsWith('^') || trimmed.startsWith('~') ? trimmed[0] : '';
  const base = parseVersion(operator ? trimmed.slice(1) : trimmed);

  if (!base) {
    throw new Error(`Unsupported version range "${range}" - extend satisfies() to handle it.`);
  }

  const toBase = compare(version, base);
  if (toBase < 0) {
    return false;
  }
  if (!operator) {
    return toBase === 0;
  }

  const [major, minor, patch] = base;
  // `~1.2.3` -> <1.3.0; `^1.2.3` -> <2.0.0, with caret pinned tighter below 1.0.0
  let upper: Version;
  if (operator === '~') {
    upper = [major, minor + 1, 0];
  } else if (major !== 0) {
    upper = [major + 1, 0, 0];
  } else if (minor !== 0) {
    upper = [0, minor + 1, 0];
  } else {
    upper = [0, 0, patch + 1];
  }

  return compare(version, upper) < 0;
}

/**
 * The version of `name` currently installed under `node_modules`.
 *
 * Read straight off disk rather than through `require`, since several of these packages
 * don't expose `./package.json` in their `exports`.
 */
function installedVersion(name: string): string | null {
  const file = join(NODE_MODULES, name, 'package.json');
  return existsSync(file) ? (readJson<PackageJson>(file).version ?? null) : null;
}

function checkManifest(file: string): string[] {
  const manifest = readJson<PackageJson>(join(SCRIPTS, file));
  const errors: string[] = [];

  const declared = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  };

  for (const [name, range] of Object.entries(declared)) {
    const installed = installedVersion(name);

    if (!installed) {
      errors.push(`${manifest.name}: "${name}" is published but not installed - cannot verify.`);
      continue;
    }

    const version = parseVersion(installed);
    if (!version) {
      errors.push(`${manifest.name}: cannot parse installed version "${installed}" of ${name}.`);
      continue;
    }

    if (!satisfies(version, range)) {
      errors.push(
        `${manifest.name}: "${name}": "${range}" does not allow the installed ${installed}. ` +
          'Widen the range in the publish manifest or align the root dependency.',
      );
    }
  }

  return errors;
}

const manifests = publishManifests();
const errors = manifests.flatMap(checkManifest);

for (const error of errors) {
  console.error(`  ✗ ${error}`);
}

if (errors.length) {
  console.error('\nPublish manifest check failed.');
  process.exit(1);
}

console.log(
  `Publish manifests are consistent with installed versions (${manifests.length} checked).`,
);
