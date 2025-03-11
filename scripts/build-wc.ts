import { join } from 'node:path';
import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, getPackageJsonTypesEntry, wrapWebComponents } from './utils';

import manifest from '../node_modules/igniteui-webcomponents/custom-elements.json';
import pkg from '../node_modules/igniteui-webcomponents/package.json';

const config = {
  path: '../src/components',
  imports: {
    default: 'igniteui-webcomponents',
    types: 'igniteui-webcomponents',
  },
  types: {
    entry: join('node_modules/igniteui-webcomponents', getPackageJsonTypesEntry(pkg)),
    ignoreExports: new Set(['defineComponents', 'defineAllComponents']),
  },
  ignoreEvents: new Set(['igc-step']),
  ignore: new Set([
    'igc-popover',
    'igc-focus-trap',
    'igc-days-view',
    'igc-months-view',
    'igc-years-view',
    'igc-carousel-indicator-container',
    'igc-validator',
  ]),
  templates: new Map<string, Array<string>>(
    Object.entries({
      'igc-combo': ['itemTemplate', 'groupHeaderTemplate'],
    }),
  ),
  templatesFilter: (prop: ClassField, declaration: CustomElementWithPath) =>
    config.templates.has(declaration.tagName!) &&
    config.templates.get(declaration.tagName!)!.includes(prop.name),
} as const;

await wrapWebComponents(manifest as Package, config);
