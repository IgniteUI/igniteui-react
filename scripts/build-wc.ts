import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Options, format } from 'prettier';
import { rimraf } from 'rimraf';

import manifest from '../node_modules/igniteui-webcomponents/custom-elements.json';
import type { Package } from './schema';
import {
  type CustomElementWithPath,
  createFileContent,
  hasEvents,
  parseElementsJSON,
} from './utils';

const config = {
  path: '../src/components',
  imports: {
    default: 'igniteui-webcomponents',
    types: 'igniteui-webcomponents',
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
  templates: new Map<string, Record<string, string>>(
    Object.entries({
      'igc-combo': {
        itemTemplate: 'itemTemplate',
        groupHeaderTemplate: 'groupHeaderTemplate',
      },
    }),
  ),
} as const;

const prettierConfig: Options = {
  parser: 'babel-ts',
  singleQuote: true,
  tabWidth: 2,
};

type WebComponentsConfig = typeof config;

async function wrapWebComponents(config: WebComponentsConfig) {
  const buffer: string[] = [];
  const root = fileURLToPath(new URL(config.path, import.meta.url));

  function createImports(
    { name, events, tagName }: CustomElementWithPath,
    config: WebComponentsConfig,
  ) {
    const buffer: string[] = [
      "import * as React from 'react'",
      `import { ${name} as Component} from '${config.imports.default}'`,
    ];

    hasEvents(events) && !config.ignoreEvents.has(tagName!)
      ? buffer.push(
          ...[
            `import type { ${name}EventMap } from '${config.imports.types}'`,
            "import { type EventName, createComponent } from '../react-props.js'",
          ],
        )
      : buffer.push("import { createComponent} from '../react-props.js'");

    return buffer.join('\n');
  }

  function createEvents(
    { events, name: component, tagName }: CustomElementWithPath,
    config: WebComponentsConfig,
  ) {
    const buffer: string[] = [];

    if (hasEvents(events) && !config.ignoreEvents.has(tagName!)) {
      for (const { name } of events) {
        if (name) {
          buffer.push(`${name}: '${name}' as EventName<${component}EventMap['${name}']>`);
        }
      }
    }

    return buffer.length ? `events: {${buffer.join(',\n')}},` : '';
  }

  function createTemplates(declaration: CustomElementWithPath, config: WebComponentsConfig) {
    const buffer: string[] = [];

    if (config.templates.has(declaration.tagName!)) {
      for (const [key, value] of Object.entries(config.templates.get(declaration.tagName!)!)) {
        buffer.push(`${key}: '${value}'`);
      }
    }

    return buffer.length ? `renderProps: {${buffer.join(',\n')}}` : '';
  }

  function getPaths(declaration: CustomElementWithPath) {
    const fileName = declaration.tagName?.replace(/^igc-/, '');
    return {
      filePath: join(root, `${fileName}.ts`),
      importPath: `./${fileName}.js`,
    };
  }

  await rimraf(root);
  await mkdir(root, { recursive: true });

  const files = await Promise.all(
    parseElementsJSON(manifest as Package)
      .filter((declaration) => !config.ignore.has(declaration.tagName || ''))
      .map(async (declaration) => {
        const { filePath, importPath } = getPaths(declaration);

        buffer.push(`export { default as ${declaration.name} } from '${importPath}'`);
        const fileContent = await format(
          createFileContent(declaration, createEvents, createImports, createTemplates, config),
          prettierConfig,
        );

        return { filePath, fileContent };
      }),
  );

  await Promise.all(files.map(async (data) => writeFile(data.filePath, data.fileContent, 'utf8')));
  await writeFile(join(root, 'index.ts'), await format(buffer.join('\n'), prettierConfig), 'utf8');
}

await wrapWebComponents(config);
