import { defineWrapperConfig } from './config';

export default defineWrapperConfig({
  path: '../src/dock-manager',
  package: 'igniteui-dockmanager',
  scoped: true,
  types: {
    // Now deprecated, so keeping previous ignore for React until removed
    ignoreExports: ['addResourceStrings'],
  },
  ignore: [
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
    'igc-splitter-component',
    'igc-unpinned-pane-header',
  ],
  typedocModuleName: 'igniteui-react-dockmanager',
});
