import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');
export const SCRIPTS = join(ROOT, 'scripts');
export const DIST = join(ROOT, 'dist');
export const NODE_MODULES = join(ROOT, 'node_modules');

/**
 * The publish manifests under `scripts/`, sorted so the order is stable across platforms.
 *
 * Discovered rather than listed, so a new package can't be picked up by one publish gate
 * and silently skipped by the other.
 */
export function publishManifests(): string[] {
  return readdirSync(SCRIPTS)
    .filter((file) => file.endsWith('.package.json'))
    .sort();
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}
