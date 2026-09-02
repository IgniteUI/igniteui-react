import type { Event as PackageEvent } from './schema';

export type PackageDelegateEvent = PackageEvent & { delegateFrom?: string };

export type ExportMeta = { name: string; type: 'js' | 'type' };

/** Partial `package.json`, covering only the fields the build scripts read. */
export type PackageJson = {
  name: string;
  version?: string;
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  exports?: { [key: string]: { types?: string } | string } | string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
