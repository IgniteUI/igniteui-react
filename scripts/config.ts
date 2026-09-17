import { join } from 'node:path';
import { NODE_MODULES, readJson } from './paths';
import type { ClassField } from './schema';
import type { PackageDelegateEvent, PackageJson } from './types';
import {
  type CustomElementWithPath,
  getPackageJsonTypesEntry,
  type WebComponentsConfig,
} from './utils';

/** Scope prefix for the packages republished under `@infragistics` in licensed builds. */
const LICENSED_SCOPE = process.env.IG_LICENSED_BUILD ? '@infragistics/' : '';

/** Resolves the declaration entry of an installed package from its `package.json`. */
function typesEntry(name: string): string {
  const pkg = readJson<PackageJson>(join(NODE_MODULES, name, 'package.json'));
  return join(NODE_MODULES, name, getPackageJsonTypesEntry(pkg));
}

type WrapperConfigInput = Pick<
  WebComponentsConfig,
  'path' | 'moveBackOnDelete' | 'typedocModuleName'
> & {
  /** Directory of the package under `node_modules`; the manifest and types are read from it. */
  readonly package: string;
  /** Bare specifier the wrappers import from. Defaults to the package name. */
  readonly specifier?: string;
  /**
   * Whether the package is republished under the `@infragistics` scope, in which case the
   * scope is prepended to the emitted specifiers for licensed builds.
   */
  readonly scoped?: boolean;
  readonly types: {
    /** Declaration entry point. Defaults to the one the package's `package.json` declares. */
    readonly entry?: string;
    readonly ignoreExports?: readonly string[];
  };
  /** Component tag names to skip entirely. */
  readonly ignore?: readonly string[];
  /** Component tag names whose events should not be wired up. */
  readonly ignoreEvents?: readonly string[];
  /** Events delegated from child components, which the manifest does not list. */
  readonly extraEvents?: Readonly<Record<string, PackageDelegateEvent[]>>;
  /** Template member names per component tag name. */
  readonly renderProps?: Readonly<Record<string, readonly string[]>>;
  /** Render props emitted verbatim; see {@link WebComponentsConfig.rawRenderProps}. */
  readonly rawRenderProps?: Readonly<Record<string, string>>;
  /**
   * Detects template members by inspecting the member itself, for packages that mark
   * templates by property type rather than by a known set of names. Mutually exclusive
   * with {@link WrapperConfigInput.renderProps}.
   */
  readonly templatesFilter?: (prop: ClassField, declaration: CustomElementWithPath) => boolean;
};

/**
 * Fills in the defaults for a generator config, so each `build-*.ts` only declares what is
 * actually specific to its package.
 */
export function defineWrapperConfig(input: WrapperConfigInput): WebComponentsConfig {
  const {
    package: pkg,
    specifier,
    scoped,
    types,
    ignore,
    ignoreEvents,
    extraEvents,
    ...rest
  } = input;
  const { renderProps, rawRenderProps, templatesFilter, ...common } = rest;

  if (templatesFilter && renderProps) {
    throw new Error(
      `${pkg}: use either "renderProps" or "templatesFilter" - the predicate would shadow the names.`,
    );
  }

  const names = new Map(Object.entries(renderProps ?? {}));
  const raw = new Map(Object.entries(rawRenderProps ?? {}));

  const both = [...names.keys()].filter((tag) => raw.has(tag));
  if (both.length) {
    throw new Error(`${pkg}: ${both.join(', ')} set both "renderProps" and "rawRenderProps".`);
  }

  const scopedSpecifier = `${scoped ? LICENSED_SCOPE : ''}${specifier ?? pkg}`;

  return {
    ...common,
    manifest: join(NODE_MODULES, pkg, 'custom-elements.json'),
    imports: { default: scopedSpecifier, types: scopedSpecifier },
    types: { entry: types.entry ?? typesEntry(pkg), ignoreExports: new Set(types.ignoreExports) },
    ignore: new Set(ignore),
    ignoreEvents: new Set(ignoreEvents),
    extraEvents: extraEvents && new Map(Object.entries(extraEvents)),
    rawRenderProps: raw.size ? raw : undefined,
    renderPropNames: new Set(names.keys()),
    isTemplate:
      templatesFilter ??
      ((prop, declaration) => !!names.get(declaration.tagName)?.includes(prop.name)),
  };
}
