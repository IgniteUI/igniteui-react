import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rimraf } from 'rimraf';
import manifest from '../node_modules/igniteui-dockmanager/custom-elements.json';
import pkg from '../node_modules/igniteui-dockmanager/package.json';
import type { ClassField, Package } from './schema';
import { getExports } from './typescript-utils';
import {
  type CustomElementWithPath,
  createEvents,
  createTypeExports,
  formatSource,
  getPackageJsonTypesEntry,
  parseElementsJSON,
  toReactName,
} from './utils';

const pkgScope = process.env.IG_LICENSED_BUILD ? '@infragistics/' : '';
const config = {
  path: '../src/dock-manager',
  imports: {
    default: `${pkgScope}igniteui-dockmanager`,
    types: `${pkgScope}igniteui-dockmanager`,
  },
  types: {
    entry: join('node_modules/igniteui-dockmanager', getPackageJsonTypesEntry(pkg)),
    // TODO: addResourceStrings temporary hidden until i18n story is defined for all
    ignoreExports: new Set(['addResourceStrings']), // define's in /loader subpath, no need to ignore
  },
  ignore: new Set<string>(),
  ignoreEvents: new Set<string>(),
  templatesFilter: (_prop: ClassField, _declaration: CustomElementWithPath) => false,
} as const;

const dockManager = parseElementsJSON(manifest as Package).find(
  (declaration) => declaration.tagName === 'igc-dockmanager',
)!;

const buffer: string[] = [
  '/**',
  ' * @module',
  ' * @mergeModuleWith igniteui-react',
  ' */',
  "import * as React from 'react'",
  `import { IgcDockManagerComponent as Component } from '${config.imports.default}'`,
  `import type { IgcDockManagerComponentEventMap } from '${config.imports.types}'`,
  "import { type EventName, createComponent } from '../react-props.js'",
  '// HACK',
  `import { defineCustomElements } from '${pkgScope}igniteui-dockmanager/loader'`,
  'defineCustomElements()',
];

const root = fileURLToPath(new URL(config.path, import.meta.url));
await rimraf(root);
await mkdir(root, { recursive: true });

const name = toReactName(dockManager.name);
buffer.push(`
/**
 * A Dock Manager component that provides means to manage the layout of your application through panes, allowing your end-users to customize it further by pinning, resizing, moving, maximizing and hiding panes.
 * @class
 */
export const ${name} = createComponent({
  tagName: '${dockManager.tagName}',
  displayName: '${name}',
  elementClass: Component,
  react: React,
  ${createEvents(dockManager, config)}
});

export type ${name} = Component;

/** @deprecated Module register is no longer needed and can be removed */
export const IgrDockManagerModule = { register: () => {} };
`);

const exports = await getExports(config.types.entry);
const types = createTypeExports(
  exports,
  // should be dockManager.name, but that's listed as 'IgcDockManager'
  ['IgcDockManagerComponent', ...config.types.ignoreExports],
  config,
);
await writeFile(join(root, 'types.ts'), await formatSource(types), 'utf8');
buffer.push(`export * from './types.js';`);

await writeFile(join(root, 'index.ts'), await formatSource(buffer.join('\n')), 'utf8');
