import { glob } from 'glob';
import {
  createProgram,
  isExportSpecifier,
  isTypeAliasDeclaration,
  SymbolFlags,
  type TypeChecker,
  type Symbol as tsSymbol,
} from 'typescript';
import type { ExportMeta } from './types';

/**
 * Resolves exports meta for an entry
 * @param entry path to declaration entry point
 */
export async function getExports(entry: string): Promise<ExportMeta[]> {
  // grab any and all files under src that reference wc packages
  const files = await glob('src/**/*{.ts,.tsx}');
  // add entry to ensure package is resolved if no file picks it up
  files.push(entry);
  // default options will also load the root tsconfig
  const program = createProgram(files, {});
  const checker = program.getTypeChecker();
  const entrySource = program.getSourceFile(entry);
  const entrySymbol = entrySource && checker.getSymbolAtLocation(entrySource);
  if (entrySymbol) {
    return checker.getExportsOfModule(entrySymbol).map((x) => {
      // try to respect both package export specifiers and types that just transpile away:
      const type = isTypeOnlyExport(x) || wouldBeElided(x, checker) ? 'type' : 'js';
      return { name: x.name, type };
    });
  }
  return [];
}

/**
 * Returns if the symbol is of type that would be automatically elided by TypeScript
 * (e.g. interface, type alias, const enum) and as such can't be js imported.
 * See {@link https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports Modules - Reference docs}.
 */
function wouldBeElided(x: tsSymbol, checker: TypeChecker) {
  // resolve alias to actual symbol to interrogate
  const symbol = x.getFlags() & SymbolFlags.Alias ? checker.getAliasedSymbol(x) : x;
  return (
    symbol.getFlags() & (SymbolFlags.Interface | SymbolFlags.TypeAlias | SymbolFlags.ConstEnum)
  );
}

/**
 * Returns if the export itself it marked as type-only or is type alias
 * @example
 * ```ts
 * export type { x, y } from 'z';
 * export { type x } from 'y';
 * export type X = any;
 * ```
 */
function isTypeOnlyExport(x: tsSymbol) {
  return x.getDeclarations()?.every((x) => {
    if (isExportSpecifier(x)) {
      return x.isTypeOnly || x.parent.parent.isTypeOnly;
    }
    return isTypeAliasDeclaration(x);
  });
}
