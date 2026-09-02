import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, type Options } from 'prettier';
import type {
  ClassField,
  ClassMember,
  CustomElementDeclaration,
  Declaration,
  Package,
  Event as PackageEvent,
} from './schema';
import type { ExportMeta, PackageDelegateEvent, PackageJson } from './types';

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
function isCustomElement(
  declaration: Declaration,
): declaration is CustomElementDeclaration & { tagName: string } {
  return declaration.kind === 'class' && 'tagName' in declaration;
}

/**
 * Returns whether the given declaration member is a field
 */
function isField(member: ClassMember): member is ClassField {
  return member.kind === 'field';
}

function hasEvents<T extends PackageEvent>(events?: T[]): events is T[] {
  return !!events?.some((x) => x.name);
}

function isNonNullable<T>(x: T): x is NonNullable<T> {
  return x !== null && x !== undefined;
}

function indent(string: string) {
  return string.replace(/^(.*)/, '* $1');
}

function toReactName(string: string) {
  return string.replace(/^Igc/, 'Igr').replace(/Component$/, '');
}

function toReactEventName(string: string) {
  const name = string.replace(/^igc/, '');
  return `on${name.at(0)?.toLocaleUpperCase()}${name.slice(1)}`;
}

/** Gets either the main export entry (`'.'`) or root types/typings path*/
export function getPackageJsonTypesEntry(pkg: PackageJson): string {
  // `exports` may be a bare specifier string, in which case there is no `.` condition to read
  const mainExport = typeof pkg.exports === 'object' ? pkg.exports['.'] : undefined;
  const mainTypes = typeof mainExport === 'object' ? mainExport.types : undefined;

  // either main entry or root types
  const entry = mainTypes || pkg.types || pkg.typings;
  if (!entry) {
    throw new Error(`Failed to get types entry from ${pkg.name}'s package.json`);
  }
  return entry;
}

/**
 * Parses a custom-elements.json file and returns all custom elements from it
 *
 * @remarks
 * Declarations are copied rather than augmented in place - the manifest is an imported JSON
 * module shared for the lifetime of the process and must stay pristine.
 */
function parseElementsJSON(json: Package): CustomElementWithPath[] {
  return json.modules.flatMap(({ declarations, path }) =>
    (declarations ?? []).filter(isCustomElement).map((declaration) => ({ ...declaration, path })),
  );
}

function createJSDoc({
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

  buffer.push(indent('@class'));

  return `/**\n${buffer.join('\n')}\n*/`;
}

export type WebComponentsConfig = {
  readonly path: string;
  /** Absolute path to the package's `custom-elements.json`. */
  readonly manifest: string;
  readonly imports: {
    readonly default: string;
    readonly types: string;
  };
  readonly types: {
    readonly entry: string;
    readonly ignoreExports: ReadonlySet<string>;
  };
  readonly ignoreEvents: ReadonlySet<string>;
  readonly extraEvents?: ReadonlyMap<string, PackageDelegateEvent[]>;
  readonly ignore: ReadonlySet<string>;
  /**
   * Render props emitted verbatim, per component tag name, for renderers whose shape the
   * generated `{ prop: 'prop' }` map can't express (e.g. `igc-chat`'s nested renderers).
   */
  readonly rawRenderProps?: ReadonlyMap<string, string>;
  /**
   * Identifies the template members of a declaration. Resolved by `defineWrapperConfig`,
   * either from the configured render-prop names or from an explicit predicate.
   */
  readonly isTemplate: (prop: ClassField, declaration: CustomElementWithPath) => boolean;
  /** Tags that configured render props by name, kept so they can be checked for staleness. */
  readonly renderPropNames: ReadonlySet<string>;
  readonly moveBackOnDelete?: boolean;
  readonly typedocModuleName?: string;
};

function createEvents(declaration: CustomElementWithPath, config: WebComponentsConfig) {
  const { name: component, tagName } = declaration;
  const buffer: string[] = [];

  // build a new array - pushing would mutate the shared manifest declaration
  const extraEvents = config.extraEvents?.get(tagName);
  const events = extraEvents ? [...(declaration.events ?? []), ...extraEvents] : declaration.events;

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

function createImports(
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
  const extraEvents = config.extraEvents?.get(tagName);
  if (extraEvents) {
    eventMaps.push(
      ...new Set(extraEvents.map((x) => x.delegateFrom?.concat('EventMap')).filter(isNonNullable)),
    );
  }

  if (eventMaps.length) {
    buffer.push(
      `import type { ${eventMaps.join(', ')} } from '${config.imports.types}'`,
      "import { type EventName, createComponent} from '../react-props.js'",
    );
  } else {
    buffer.push("import { createComponent } from '../react-props.js'");
  }

  return buffer.join('\n');
}

function createTemplates(declaration: CustomElementWithPath, config: WebComponentsConfig) {
  const raw = config.rawRenderProps?.get(declaration.tagName);
  if (raw) {
    return `renderProps: ${raw}`;
  }

  const templateProps = (declaration.members ?? []).filter(
    (member): member is ClassField => isField(member) && config.isTemplate(member, declaration),
  );

  const buffer = templateProps.map((prop) => `${prop.name}: '${prop.name}'`);

  return buffer.length ? `renderProps: {${buffer.join(',\n')}}` : '';
}

function createTypeExports(
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

  function toAlias(name: string) {
    return shouldAlias(name) ? name.replace('Igc', 'Igr') : name;
  }

  for (const { name, type } of relevantExports) {
    // ensure type-only exports to allow esbuild / isolated module-like handling
    // https://github.com/vitejs/vite/issues/2117
    const typeKeyword = type === 'type' ? 'type ' : '';

    // Separate event args handling; TODO: mark such types with some meta
    if (name.endsWith('EventArgs')) {
      const alias = toAlias(name);
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
  if (direct.length) {
    buffer.push('', `export { ${direct.join(',')} } from '${config.imports.types}'`);
  }

  return buffer.join('\n');
}

function createFileContent(declaration: CustomElementWithPath, config: WebComponentsConfig) {
  const name = toReactName(declaration.name);

  // TODO: Conditional? Not all components had modules exposed, but CEM doesn't have that meta
  const moduleBackfill = `
    /** @deprecated Module register is no longer needed and can be removed */
    export const ${name}Module = Component;`;

  const extraProps = [
    config.moveBackOnDelete ? 'moveBackOnDelete: true,' : '',
    createEvents(declaration, config),
    createTemplates(declaration, config),
  ].filter((x) => x);

  return `
    ${createImports(declaration, config)}

    ${createJSDoc(declaration)}
    export const ${name} = /* @__PURE__ */ createComponent({
      tagName: '${declaration.tagName}',
      displayName: '${name}',
      elementClass: Component,
      react: React,
      ${extraProps.join('\n')}
    });

    export type ${name} = Component;
    ${moduleBackfill}
  `;
}

/** Format source with prettier */
function formatSource(source: string) {
  const prettierConfig: Options = {
    parser: 'babel-ts',
    singleQuote: true,
    tabWidth: 2,
  };
  return format(source, prettierConfig);
}

/** Result of a single package generation pass, for build reporting. */
export type WrapResult = {
  /** Output directory name, e.g. `components`. */
  readonly name: string;
  /** Number of wrapped components written. */
  readonly components: number;
  /** Number of type exports re-exported from `types.ts`. */
  readonly typeExports: number;
  /** Wall-clock duration in milliseconds. */
  readonly duration: number;
};

/**
 * Reports configured tag names that match no declaration in the manifest.
 *
 * The config is a set of unchecked references into the manifest, so an upstream rename or
 * removal leaves entries behind silently - a stale `ignore` is harmless, but a stale
 * `renderProps` or `extraEvents` key means that component quietly loses them.
 */
function reportStaleTags(config: WebComponentsConfig, declared: Set<string>): void {
  const configured = new Map<string, Iterable<string>>([
    ['ignore', config.ignore],
    ['ignoreEvents', config.ignoreEvents],
    ['extraEvents', config.extraEvents?.keys() ?? []],
    ['rawRenderProps', config.rawRenderProps?.keys() ?? []],
    ['renderProps', config.renderPropNames],
  ]);

  for (const [field, tags] of configured) {
    const stale = [...tags].filter((tag) => !declared.has(tag));
    if (stale.length) {
      console.warn(`  ! ${basename(config.path)}: ${field} has no such tag: ${stale.join(', ')}`);
    }
  }
}

/** Generates the wrapped component files for one package. */
export async function wrapWebComponents(
  manifest: Package,
  config: WebComponentsConfig,
  pkgExports: ExportMeta[],
): Promise<WrapResult> {
  const started = performance.now();
  const root = fileURLToPath(new URL(config.path, import.meta.url));

  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });

  const declarations = parseElementsJSON(manifest);
  reportStaleTags(config, new Set(declarations.map((declaration) => declaration.tagName)));

  const components = declarations.filter((declaration) => !config.ignore.has(declaration.tagName));

  const files = await Promise.all(
    components.map(async (declaration) => ({
      fileName: declaration.tagName.replace(/^igc-/, ''),
      content: await formatSource(createFileContent(declaration, config)),
    })),
  );

  const types = createTypeExports(
    pkgExports,
    [...components.map((c) => c.name), ...config.types.ignoreExports],
    config,
  );

  const index = [
    `/**\n * @module ${config.typedocModuleName}\n */`,
    ...files.map(({ fileName }) => `export * from './${fileName}.js'`),
    // TODO: split direct exports and export type:
    `export * from './types.js';`,
  ].join('\n');

  await Promise.all([
    ...files.map(({ fileName, content }) =>
      writeFile(join(root, `${fileName}.ts`), content, 'utf8'),
    ),
    formatSource(types).then((source) => writeFile(join(root, 'types.ts'), source, 'utf8')),
    formatSource(index).then((source) => writeFile(join(root, 'index.ts'), source, 'utf8')),
  ]);

  return {
    name: basename(root),
    components: components.length,
    typeExports: pkgExports.length,
    duration: performance.now() - started,
  };
}
