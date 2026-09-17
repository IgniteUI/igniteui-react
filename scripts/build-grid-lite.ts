import { defineWrapperConfig } from './config';

// TODO: Emit wrapped component type alias as:
// export type IgrGridLiteColumn<T extends object = any> = Component<T>;
export default defineWrapperConfig({
  path: '../src/grid-lite',
  package: 'igniteui-grid-lite',
  types: {
    ignoreExports: ['defineComponents', 'defineAllComponents'],
  },
  renderProps: {
    'igc-grid-lite-column': ['cellTemplate', 'headerTemplate'],
  },
  typedocModuleName: 'igniteui-react/grid-lite',
});
