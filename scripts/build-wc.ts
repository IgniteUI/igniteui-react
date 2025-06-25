import { join } from 'node:path';
import manifest from '../node_modules/igniteui-webcomponents/custom-elements.json';
import pkg from '../node_modules/igniteui-webcomponents/package.json';
import type { ClassField, Package } from './schema';
import { type CustomElementWithPath, getPackageJsonTypesEntry, wrapWebComponents } from './utils';

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
  extraEvents: new Map([
    [
      'igc-radio-group',
      [{ name: 'igcChange', type: { text: '' }, delegateFrom: 'IgcRadioComponent' }],
    ],
    [
      'igc-tile-manager',
      [
        { name: 'igcTileFullscreen', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileMaximize', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileDragStart', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileDragEnd', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileDragCancel', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileResizeStart', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileResizeEnd', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
        { name: 'igcTileResizeCancel', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      ],
    ],
    [
      'igc-accordion',
      [
        { name: 'igcOpening', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
        { name: 'igcOpened', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
        { name: 'igcClosing', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
        { name: 'igcClosed', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
      ],
    ],
  ]),
  ignore: new Set([
    'igc-popover',
    'igc-focus-trap',
    'igc-days-view',
    'igc-months-view',
    'igc-years-view',
    'igc-carousel-indicator-container',
    'igc-validator',
    'igc-resize',
    'igc-predefined-ranges-area',
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
