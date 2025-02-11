import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Options, format } from 'prettier';
import { rimraf } from 'rimraf';
import manifest from '../node_modules/igniteui-dockmanager/custom-elements.json';
import type { Package } from './schema';
import { parseElementsJSON, toReactName } from './utils';

const prettierConfig: Options = {
  parser: 'babel-ts',
  singleQuote: true,
  tabWidth: 2,
};

const dockManager = parseElementsJSON(manifest as Package).find(
  (declaration) => declaration.tagName === 'igc-dockmanager',
)!;

const buffer: string[] = [
  "import * as React from 'react'",
  `import { IgcDockManagerComponent as Component} from 'igniteui-dockmanager'`,
  "import type { IgcDockManagerEventMap } from 'igniteui-dockmanager'",
  "import { type EventName, createComponent } from '../react-props.js'",
  '// HACK',
  "import { defineCustomElements } from 'igniteui-dockmanager/loader'",
  'defineCustomElements()',
];

const events: string[] = [];
for (const { name } of dockManager.events!) {
  if (name) {
    events.push(`${name}: '${name}' as EventName<IgcDockManagerEventMap['${name}']>`);
  }
}

const root = fileURLToPath(new URL('../src/dock-manager', import.meta.url));
await rimraf(root);
await mkdir(root, { recursive: true });

const name = toReactName(dockManager.name);
buffer.push(`
export const ${name} = createComponent({
  tagName: '${dockManager.tagName}',
  displayName: '${name}',
  elementClass: Component,
  react: React,
  events: {${events.join(',\n')}}
});

export type ${name} = Component;

/** @deprecated Module register is no longer needed and can be removed */
export const IgrDockManagerModule = { register: () => {} };
`);

await writeFile(join(root, 'index.ts'), await format(buffer.join('\n'), prettierConfig), 'utf8');
