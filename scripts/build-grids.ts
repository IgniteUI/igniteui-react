import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, wrapWebComponents } from './utils';

import manifest from '../node_modules/igniteui-webcomponents-grids/custom-elements.json';

const TEMPLATE_TYPE = 'IgcRenderFunction';
const config = {
  path: '../src/grids',
  imports: {
    // TODO: @infragistics scope packages? Read/resolve from CEM path?
    // use direct /grids/index.js until package is updated; CRA/Webpack can't resolve (possibly ESM mode)
    default: 'igniteui-webcomponents-grids/grids/index.js',
    types: 'igniteui-webcomponents-grids/grids/index.js',
  },
  types: {
    // `/grids` entry not in package.json & not exported from main.d.ts (which also includes DataGrid)
    // entry: join('node_modules/igniteui-webcomponents-grids', getPackageJsonTypesEntry(pkg)),
    entry: 'node_modules/igniteui-webcomponents-grids/grids/index.d.ts',
    ignoreExports: new Set([
      'defineComponents',
      'defineAllComponents',
      TEMPLATE_TYPE,
      'TemplateContent',
    ]),
  },
  templatesFilter: (prop: ClassField, _declaration: CustomElementWithPath) =>
    !!prop.type?.text.startsWith(TEMPLATE_TYPE),
  ignore: new Set<string>(),
  ignoreEvents: new Set<string>(),
} as const;

await wrapWebComponents(manifest as Package, config);
