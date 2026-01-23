import { join } from 'node:path';
import manifest from '../node_modules/igniteui-grid-lite/custom-elements.json';
import pkg from '../node_modules/igniteui-grid-lite/package.json';
import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, getPackageJsonTypesEntry, wrapWebComponents } from './utils';

const config = {
  path: '../src/grid-lite',
  imports: {
    default: 'igniteui-grid-lite',
    types: 'igniteui-grid-lite',
  },
  types: {
    entry: join('node_modules/igniteui-grid-lite', getPackageJsonTypesEntry(pkg)),
    ignoreExports: new Set(['defineComponents', 'defineAllComponents']),
  },
  ignoreEvents: new Set([]),
  ignore: new Set<string>([]),
  templates: new Map<string, Array<string>>(
    Object.entries({
      'igc-grid-lite-column': ['cellTemplate', 'headerTemplate'],
    }),
  ),
  templatesFilter: (prop: ClassField, declaration: CustomElementWithPath) =>
    config.templates.has(declaration.tagName!) &&
    config.templates.get(declaration.tagName!)!.includes(prop.name),
  typedocModuleName: 'igniteui-react/grid-lite',
} as const;

// TODO: Emit wrapped component type alias as:
// export type IgrGridLiteColumn<T extends object = any> = Component<T>;
await wrapWebComponents(manifest as Package, config);
