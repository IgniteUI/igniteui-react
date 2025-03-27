import type { Event as PackageEvent } from './schema';

export type PackageDelegateEvent = PackageEvent & { delegateFrom?: string };

export type ExportMeta = { name: string; type: 'js' | 'type' };

/** Very basic typing for package.json just to access types entries */
export type PackageJsonTypes = {
  name: string;
  types?: string;
  typings?: string;
  exports?: { [key: string]: { types?: string } | string } | string;
};
