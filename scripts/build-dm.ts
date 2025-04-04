import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rimraf } from 'rimraf';
import manifest from '../node_modules/igniteui-dockmanager/custom-elements.json';
import type { ClassField, Package } from './schema';
import {
  type CustomElementWithPath,
  createEvents,
  formatSource,
  parseElementsJSON,
  toReactName,
} from './utils';

const config = {
  path: '../src/dock-manager',
  imports: {
    // TODO: @infragistics scope packages? Read/resolve from CEM path?
    default: 'igniteui-dockmanager',
    types: 'igniteui-dockmanager',
  },
  ignore: new Set<string>(),
  ignoreEvents: new Set<string>(),
  templatesFilter: (_prop: ClassField, _declaration: CustomElementWithPath) => false,
} as const;

const dockManager = parseElementsJSON(manifest as Package).find(
  (declaration) => declaration.tagName === 'igc-dockmanager',
)!;

const buffer: string[] = [
  "import * as React from 'react'",
  `import { IgcDockManagerComponent as Component } from '${config.imports.default}'`,
  `import type { IgcDockManagerEventMap } from '${config.imports.types}'`,
  "import { type EventName, createComponent } from '../react-props.js'",
  '// HACK',
  "import { defineCustomElements } from 'igniteui-dockmanager/loader/index.js'",
  'defineCustomElements()',
];

const root = fileURLToPath(new URL(config.path, import.meta.url));
await rimraf(root);
await mkdir(root, { recursive: true });

const name = toReactName(dockManager.name);
buffer.push(`
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

await writeFile(join(root, 'index.ts'), await formatSource(buffer.join('\n')), 'utf8');
