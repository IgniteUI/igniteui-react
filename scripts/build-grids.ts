import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, wrapWebComponents } from './utils';

import manifest from '../node_modules/igniteui-webcomponents-grids/custom-elements.json';

const TEMPLATE_TYPE = 'IgcRenderFunction';
const config = {
  path: '../src/grids',
  imports: {
    // TODO: @infragistics scope packages? Read/resolve from CEM path?
    default: 'igniteui-webcomponents-grids/grids',
    types: 'igniteui-webcomponents-grids/grids',
  },
  templatesFilter: (prop: ClassField, _declaration: CustomElementWithPath) =>
    !!prop.type?.text.startsWith(TEMPLATE_TYPE),
  ignore: new Set<string>(),
  ignoreEvents: new Set<string>(),
} as const;

await wrapWebComponents(manifest as Package, config);
