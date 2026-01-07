import { join } from 'node:path';
import manifest from '../node_modules/igniteui-dockmanager/custom-elements.json';
import pkg from '../node_modules/igniteui-dockmanager/package.json';
import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, getPackageJsonTypesEntry, wrapWebComponents } from './utils';

const pkgScope = process.env.IG_LICENSED_BUILD ? '@infragistics/' : '';
const config = {
  path: '../src/dock-manager',
  imports: {
    default: `${pkgScope}igniteui-dockmanager`,
    types: `${pkgScope}igniteui-dockmanager`,
  },
  types: {
    entry: join('node_modules/igniteui-dockmanager', getPackageJsonTypesEntry(pkg)),
    ignoreExports: new Set([
      // Now deprecated, so keeping previous ignore for React until removed
      'addResourceStrings',
    ]),
  },
  ignore: new Set([
    // TODO: Cleanup custom-elements.json...
    'igc-button-component',
    'igc-context-menu',
    'igc-icon-component',
    'sample-component',
    'igc-tab-header',
    'igc-tab-panel',
    'igc-tabs-component',
    'igc-edge-docking-indicator',
    'igc-joystick-icon',
    'igc-joystick-indicator',
    'igc-root-docking-indicator',
    'igc-splitter-docking-indicator',
    'igc-pane-navigator',
    'igc-content-pane',
    'igc-floating-pane',
    'igc-pane-header',
    'igc-resizer',
    'igc-split-pane',
    'igc-splitter',
    'igc-unpinned-pane-header',
  ]),
  ignoreEvents: new Set<string>(),
  templatesFilter: (_prop: ClassField, _declaration: CustomElementWithPath) => false,
} as const;

await wrapWebComponents(manifest as Package, config);
