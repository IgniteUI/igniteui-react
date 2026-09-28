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
 * Resolves the exports of each declaration entry, keyed by entry path.
 *
 * @remarks
 * One program covers every entry. The packages share most of their declaration closure
 * (lit, `@lit/react`, and the components package itself, which the grid packages pull in),
 * so a program per entry re-parses roughly half the graph - measurably about twice the work.
 *
 * Only the entry is needed to enumerate a module's exports; the wrappers under `src/` are
 * generated *from* this data, so including them only made the program grow with every
 * package that had already run.
 */
export function getExports(entries: string[]): Map<string, ExportMeta[]> {
  const program = createProgram(entries, {});
  const checker = program.getTypeChecker();
  const resolved = new Map<string, ExportMeta[]>();

  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    const symbol = source && checker.getSymbolAtLocation(source);

    if (!symbol) {
      throw new Error(`Failed to resolve types entry "${entry}". Are dependencies installed?`);
    }

    resolved.set(
      entry,
      checker.getExportsOfModule(symbol).map((x) => ({
        name: x.name,
        // try to respect both package export specifiers and types that just transpile away:
        type: isTypeOnlyExport(x) || wouldBeElided(x, checker) ? 'type' : 'js',
      })),
    );
  }

  return resolved;
}

/**
 * Returns if the symbol is of type that would be automatically elided by TypeScript
 * (e.g. interface, type alias, const enum) and as such can't be js imported.
 * See {@link https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports Modules - Reference docs}.
 */
function wouldBeElided(x: tsSymbol, checker: TypeChecker) {
  // resolve alias to actual symbol to interrogate
  const symbol = x.getFlags() & SymbolFlags.Alias ? checker.getAliasedSymbol(x) : x;

  if (symbol.getFlags() & SymbolFlags.Value) {
    // if the export symbol is any `Value` (exists at runtime - functions, classes, enums, variables,etc)
    // even if behind alias combining `TypeAlias` (e.g.`const UnpinnedLocation ..; type UnpinnedLocation`) - assume it won't be elided:
    return false;
  }

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
