import { join } from 'node:path';
import { defineWrapperConfig } from './config';
import { NODE_MODULES } from './paths';

const TEMPLATE_TYPE = 'IgcRenderFunction';

export default defineWrapperConfig({
  path: '../src/grids',
  package: 'igniteui-webcomponents-grids',
  // TODO: use direct /grids/index.js until package is updated; CRA/Webpack can't resolve (possibly ESM mode)
  specifier: 'igniteui-webcomponents-grids/grids/index.js',
  scoped: true,
  types: {
    // `/grids` entry not in package.json & not exported from main.d.ts (which also includes DataGrid)
    entry: join(NODE_MODULES, 'igniteui-webcomponents-grids/grids/index.d.ts'),
    ignoreExports: ['defineComponents', 'defineAllComponents', TEMPLATE_TYPE, 'TemplateContent'],
  },
  // grids expose templates by property type rather than by a known set of names
  templatesFilter: (prop) => !!prop.type?.text.startsWith(TEMPLATE_TYPE),
  moveBackOnDelete: true,
  typedocModuleName: 'igniteui-react-grids',
});
