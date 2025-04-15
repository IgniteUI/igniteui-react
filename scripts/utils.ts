import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Options, format } from 'prettier';
import { rimraf } from 'rimraf';
import type {
  ClassField,
  ClassMember,
  CustomElementDeclaration,
  Declaration,
  Package,
  Event as PackageEvent,
} from './schema';
import type { ExportMeta, PackageDelegateEvent, PackageJsonTypes } from './types';
import { getExports } from './typescript-utils';

/**
 * CustomElementDeclaration with a `path` property added for convenience
 */
export interface CustomElementWithPath extends CustomElementDeclaration {
  path: string;
  /**
   * @inheritdoc
   * @remarks
   * Non-optional override guaranteed by {@link isCustomElement}
   */
  tagName: string;
  events?: PackageDelegateEvent[];
}

// Helpers

/**
 * Returns whether the given declaration is an actual custom element
 */
function isCustomElement(declaration: Declaration): declaration is CustomElementDeclaration {
  return declaration.kind === 'class' && 'tagName' in declaration;
}

/**
 * Returns whether the given declaration member is a field
 */
export function isField(member: ClassMember): member is ClassField {
  return member.kind === 'field';
}

export function hasEvents(events?: PackageEvent[]): events is PackageEvent[] {
  return !!events?.filter((x) => x.name).length;
}

export function isNonNullable(x: any): x is NonNullable<typeof x> {
  return x !== null && x !== undefined;
}

export function indent(string: string) {
  return string.replace(/^(.*)/, '* $1');
}

export function toReactName(string: string) {
  return string.replace(/^Igc/, 'Igr').replace(/Component$/, '');
}

export function toReactEventName(string: string) {
  const name = string.replace(/^igc/, '');
  return `on${name.at(0)?.toLocaleUpperCase()}${name.slice(1)}`;
}

/** Gets either the main export entry (`'.'`) or root types/typings path*/
export function getPackageJsonTypesEntry(pkg: PackageJsonTypes): string {
  // either main entry or root types
  const entry = pkg.exports?.['.']?.types || pkg.types || pkg.typings;
  if (!entry) {
    throw new Error(`Failed to get types entry from ${pkg.name}'s package.json`);
  }
  return entry;
}

/**
 * Parses a custom-elements.json file and returns all custom elements from it
 */
export function parseElementsJSON(json: Package) {
  return json.modules
    .flatMap(({ declarations, path }) => {
      if (!declarations) {
        return null;
      }

      return declarations.flatMap((declaration) => {
        return isCustomElement(declaration) ? Object.assign(declaration, { path }) : null;
      });
    })
    .filter((declaration) => Boolean(declaration)) as CustomElementWithPath[];
}

export function createJSDoc({
  description,
  events,
  slots,
  cssParts,
  cssProperties,
}: CustomElementWithPath) {
  const buffer: string[] = [];

  if (description) {
    for (const line of description.split('\n')) {
      buffer.push(indent(line));
    }
  }

  if (slots) {
    for (const slot of slots) {
      buffer.push(indent(`@slot ${slot.name} - ${slot.description}`));
    }
  }

  if (hasEvents(events)) {
    for (const event of events) {
      if (event.name) {
        buffer.push(indent(`@fires ${event.name} - ${event.description}`));
      }
    }
  }

  if (cssParts) {
    for (const part of cssParts) {
      buffer.push(indent(`@csspart ${part.name} - ${part.description}`));
    }
  }

  if (cssProperties) {
    for (const prop of cssProperties) {
      buffer.push(indent(`@cssproperty ${prop.name} - ${prop.description}`));
    }
  }

  return `/**\n${buffer.join('\n')}\n*/`;
}

export type WebComponentsConfig = {
  readonly path: string;
  readonly imports: {
    readonly default: string;
    readonly types: string;
  };
  readonly types: {
    readonly entry: string;
    readonly ignoreExports: Set<string>;
  };
  readonly ignoreEvents: Set<string>;
  readonly extraEvents?: Map<string, PackageDelegateEvent[]>;
  readonly ignore: Set<string>;
  readonly templatesFilter: (prop: ClassField, declaration: CustomElementWithPath) => boolean;
};

export function createEvents(
  { events, name: component, tagName }: CustomElementWithPath,
  config: WebComponentsConfig,
) {
  const buffer: string[] = [];

  if (config.extraEvents?.has(tagName)) {
    events ??= [];
    events.push(...config.extraEvents.get(tagName)!);
  }

  if (hasEvents(events) && !config.ignoreEvents.has(tagName)) {
    for (const { name, delegateFrom } of events) {
      if (name) {
        const reactName = toReactEventName(name);
        const comp = delegateFrom ?? component;
        buffer.push(`${reactName}: '${name}' as EventName<${comp}EventMap['${name}']>`);
      }
    }
  }

  return buffer.length ? `events: {${buffer.join(',\n')}},` : '';
}

export function createImports(
  { name, events, tagName }: CustomElementWithPath,
  config: WebComponentsConfig,
) {
  const buffer: string[] = [
    "import * as React from 'react'",
    `import { ${name} as Component } from '${config.imports.default}'`,
  ];

  const eventMaps: string[] = [];
  if (hasEvents(events) && !config.ignoreEvents.has(tagName)) {
    eventMaps.push(`${name}EventMap`);
  }
  if (config.extraEvents?.has(tagName)) {
    eventMaps?.push(
      ...new Set(
        config.extraEvents
          .get(tagName)!
          .map((x) => x.delegateFrom?.concat('EventMap'))
          .filter(isNonNullable),
      ),
    );
  }

  eventMaps.length
    ? buffer.push(
        ...[
          `import type { ${eventMaps.join(', ')} } from '${config.imports.types}'`,
          "import { type EventName, createComponent} from '../react-props.js'",
        ],
      )
    : buffer.push("import { createComponent } from '../react-props.js'");

  return buffer.join('\n');
}

export function createTypeExports(
  pkgExports: ExportMeta[],
  ignore: string[],
  config: WebComponentsConfig,
) {
  const buffer: string[] = [];
  const imports: string[] = [];
  const exports: string[] = [];
  const direct: string[] = [];
  const eventArgs: string[] = [];
  const relevantExports = pkgExports
    .filter((x) => !x.name.endsWith('EventMap'))
    .filter((x) => !ignore.includes(x.name));

  function shouldAlias(name: string) {
    return name.startsWith('Igc');
  }

  function toAlias(name: string, force = false) {
    if (shouldAlias(name)) {
      return name.replace('Igc', 'Igr');
    }
    if (force) {
      return `Igr${name}`;
    }
    return name;
  }

  for (const { name, type } of relevantExports) {
    // ensure type-only exports to allow esbuild / isolated module-like handling
    // https://github.com/vitejs/vite/issues/2117
    const typeKeyword = type === 'type' ? 'type ' : '';

    // Separate event args handling; TODO: mark such types with some meta
    if (name.endsWith('EventArgs')) {
      const alias = toAlias(name, false);
      imports.push(`${typeKeyword}${name} as ${alias}Detail`);
      eventArgs.push(alias);
      exports.push(`${typeKeyword}${alias}Detail`);
      continue;
    }

    if (shouldAlias(name)) {
      imports.push(`${typeKeyword}${name} as ${toAlias(name)}`);
      exports.push(typeKeyword + toAlias(name));
    } else {
      direct.push(typeKeyword + name);
    }
  }

  buffer.push(`import { ${imports.join(',')} } from '${config.imports.types}'`, '');

  for (const arg of eventArgs) {
    const detail = `${arg}Detail`;
    buffer.push(`export type ${arg} = CustomEvent<${detail}>;`);
  }

  buffer.push('', `export { ${exports.join(',')} }`);
  buffer.push('', `export { ${direct.join(',')} } from '${config.imports.types}'`);

  return buffer.join('\n');
}

type ImportRendererParams<T> = (declaration: CustomElementWithPath, config: T) => string;

export function createFileContent<T>(
  declaration: CustomElementWithPath,
  eventRenderer: ImportRendererParams<T>,
  importRenderer: ImportRendererParams<T>,
  templateRenderer: ImportRendererParams<T>,
  config: T,
) {
  const name = toReactName(declaration.name);

  // TODO: Conditional? Not all components had modules exposed, but CEM doesn't have that meta
  const moduleBackfill = `
    /** @deprecated Module register is no longer needed and can be removed */
    export const ${name}Module = Component;`;

  return `
    ${importRenderer(declaration, config)}

    ${createJSDoc(declaration)}
    export const ${name} = createComponent({
      tagName: '${declaration.tagName}',
      displayName: '${name}',
      elementClass: Component,
      react: React,
      ${eventRenderer(declaration, config)}
      ${templateRenderer(declaration, config)}
    });

    export type ${name} = Component;
    ${moduleBackfill}
  `;
}

/** Format source with prettier */
export function formatSource(source: string) {
  const prettierConfig: Options = {
    parser: 'babel-ts',
    singleQuote: true,
    tabWidth: 2,
  };
  return format(source, prettierConfig);
}

/** Main entry point generating wrapped component files from config */
export async function wrapWebComponents(manifest: Package, config: WebComponentsConfig) {
  const buffer: string[] = [];
  const root = fileURLToPath(new URL(config.path, import.meta.url));

  function createTemplates(declaration: CustomElementWithPath, config: WebComponentsConfig) {
    const buffer: string[] = [];
    const templateProps =
      declaration.members?.filter((x) => isField(x) && config.templatesFilter(x, declaration)) ||
      [];

    for (const prop of templateProps) {
      buffer.push(`${prop.name}: '${prop.name}'`);
    }

    return buffer.length ? `renderProps: {${buffer.join(',\n')}}` : '';
  }

  function getPaths(declaration: CustomElementWithPath) {
    const fileName = declaration.tagName.replace(/^igc-/, '');
    return {
      filePath: join(root, `${fileName}.ts`),
      importPath: `./${fileName}.js`,
    };
  }

  await rimraf(root);
  await mkdir(root, { recursive: true });

  const components = parseElementsJSON(manifest).filter(
    (declaration) => !config.ignore.has(declaration.tagName),
  );

  const files = await Promise.all(
    components.map(async (declaration) => {
      const { filePath, importPath } = getPaths(declaration);

      buffer.push(`export * from '${importPath}'`);
      const fileContent = await formatSource(
        createFileContent(declaration, createEvents, createImports, createTemplates, config),
      );

      return { filePath, fileContent };
    }),
  );

  // types:
  const pkgExports = await getExports(config.types.entry);
  const typesContent = createTypeExports(
    pkgExports,
    [...components.map((c) => c.name), ...config.types.ignoreExports],
    config,
  );
  await writeFile(join(root, 'types.ts'), await formatSource(typesContent), 'utf8');
  // TODO: split direct exports and export type:
  buffer.push(`export * from './types.js';`);

  await Promise.all(files.map(async (data) => writeFile(data.filePath, data.fileContent, 'utf8')));
  await writeFile(join(root, 'index.ts'), await formatSource(buffer.join('\n')), 'utf8');
}
