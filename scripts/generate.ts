/**
 * Generates the React wrappers for every Ignite UI package.
 *
 * Usage:
 *   tsx ./scripts/generate.ts                # all packages
 *   tsx ./scripts/generate.ts wc grid-lite   # only the given ones
 */

import { readJson } from './paths';
import type { Package } from './schema';
import { getExports } from './typescript-utils';
import { type WebComponentsConfig, type WrapResult, wrapWebComponents } from './utils';

type Target = { default: WebComponentsConfig };

/** Package configs, loaded lazily so a partial run only imports what it needs. */
const TARGETS: Record<string, () => Promise<Target>> = {
  wc: () => import('./build-wc'),
  dm: () => import('./build-dm'),
  grids: () => import('./build-grids'),
  'grid-lite': () => import('./build-grid-lite'),
};

function parseTargets(argv: string[]): string[] {
  if (!argv.length) {
    return Object.keys(TARGETS);
  }

  const unknown = argv.filter((name) => !(name in TARGETS));
  if (unknown.length) {
    console.error(
      `Unknown target(s): ${unknown.join(', ')}. Valid targets: ${Object.keys(TARGETS).join(', ')}`,
    );
    process.exit(1);
  }

  return argv;
}

function report(result: WrapResult): void {
  console.log(
    `  ${result.name.padEnd(14)} ${String(result.components).padStart(3)} components, ` +
      `${String(result.typeExports).padStart(3)} type exports  ` +
      `(${(result.duration / 1000).toFixed(2)}s)`,
  );
}

const targets = parseTargets(process.argv.slice(2));
const started = performance.now();

const configs = await Promise.all(targets.map(async (name) => (await TARGETS[name]()).default));

// One TypeScript program for every entry - the packages share most of their declaration
// closure, so resolving them together roughly halves the parsing.
const resolving = performance.now();
const pkgExports = getExports(configs.map((config) => config.types.entry));
console.log(`  resolved type exports  (${((performance.now() - resolving) / 1000).toFixed(2)}s)`);

const outcomes = await Promise.allSettled(
  configs.map((config) =>
    wrapWebComponents(
      readJson<Package>(config.manifest),
      config,
      pkgExports.get(config.types.entry)!,
    ),
  ),
);

for (const [index, outcome] of outcomes.entries()) {
  if (outcome.status === 'fulfilled') {
    report(outcome.value);
  } else {
    console.error(`  \u2717 ${targets[index]} failed:`, outcome.reason);
  }
}

const total = `${((performance.now() - started) / 1000).toFixed(2)}s`;

if (outcomes.some((outcome) => outcome.status === 'rejected')) {
  console.error(`\nWrapper generation failed after ${total}.`);
  process.exit(1);
}

console.log(`\nGenerated wrappers for ${targets.length} package(s) in ${total}.`);
