// Shared by the script migrations: finds what a name in a script is bound to, through the TypeScript checker.
const PACKAGES = ['igniteui-react', '@infragistics/igniteui-react'];

/**
 * What `ig update` passes to a migration.
 *
 * @typedef {object} MigrationHost
 * @property {string} root The project directory.
 * @property {() => string[]} files Project-relative, `/`-separated paths.
 * @property {(path: string) => string} read
 * @property {(path: string, content: string) => void} write Staged until the migration completes.
 * @property {typeof import('typescript')} typescript The CLI's, to parse scripts without the project's.
 */

/**
 * Applies the edits `migrate` returns for each script that contains `keyword`.
 *
 * @param {MigrationHost} host
 * @param {string} keyword
 * @param {(script: Script) => Edit[]} migrate
 */
export function migrateScripts(host, keyword, migrate) {
  let ts;
  for (const file of host.files()) {
    if (!/\.[cm]?[jt]sx?$/.test(file)) {
      continue;
    }
    const text = host.read(file);
    // Cheap text check first, so we only parse files that can contain a match.
    if (!text.includes(keyword)) {
      continue;
    }

    // Load TypeScript only once a file actually needs it.
    ts ??= loadTypeScript(host);
    const script = parse(ts, file, text);
    if (!script) {
      console.warn(`    Skipped ${file}: TypeScript ${ts.version} found syntax errors in it.`);
      continue;
    }
    // Edits point into the original text, so apply them backwards to keep earlier offsets valid.
    const updated = migrate(script)
      .sort((a, b) => b.start - a.start)
      .reduce(
        (result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end),
        text,
      );
    if (updated !== text) {
      host.write(file, updated);
    }
  }
}

// From the CLI: igniteui-react doesn't depend on TypeScript, and the project may not have it.
function loadTypeScript(host) {
  if (!host.typescript) {
    throw new Error(
      `Migrating scripts requires TypeScript from the CLI, which this igniteui-cli doesn't provide; update igniteui-cli`,
    );
  }
  return host.typescript;
}

/** @typedef {{ start: number, end: number, text: string }} Edit */
/** @typedef {NonNullable<ReturnType<typeof parse>>} Script */

// A program of this file alone: enough to bind its names, without resolving modules; undefined on syntax errors.
function parse(ts, file, text) {
  const kind = /\.[cm]?ts$/.test(file)
    ? ts.ScriptKind.TS
    : file.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.JSX;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const options = {
    allowJs: true,
    jsx: ts.JsxEmit.Preserve,
    noLib: true,
    noResolve: true,
    types: [],
  };
  const program = ts.createProgram([file], options, {
    getSourceFile: (name) => (name === file ? source : undefined),
    fileExists: (name) => name === file,
    readFile: () => undefined,
    writeFile: () => {},
    getDefaultLibFileName: () => 'lib.d.ts',
    getCurrentDirectory: () => '',
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  });
  // The parser recovers from syntax errors, but then its tree may not match the code.
  if (program.getSyntacticDiagnostics(source).length) {
    return undefined;
  }
  const checker = program.getTypeChecker();

  /** The symbol an identifier refers to; for `{ a }` and `export { a }`, that of the local `a` */
  const symbolOf = (node) =>
    ts.isShorthandPropertyAssignment(node.parent)
      ? checker.getShorthandAssignmentValueSymbol(node.parent)
      : ts.isExportSpecifier(node.parent)
        ? checker.getExportSpecifierLocalTargetSymbol(node.parent)
        : checker.getSymbolAtLocation(node);

  /** The identifiers that refer to the symbol `name` declares, but `name` */
  const references = (name) => {
    const symbol = checker.getSymbolAtLocation(name);
    return identifiers(name.text).filter((node) => node !== name && symbolOf(node) === symbol);
  };

  const identifiers = (text) => {
    const found = [];
    const visit = (node) => {
      if (ts.isIdentifier(node) && node.text === text) {
        found.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return found;
  };

  /** Imports from the packages, `{ statement, specifier }` or `{ statement, namespace }`; type-only ones with `types` */
  const imports = (types = false) =>
    source.statements.flatMap((statement) => {
      const bindings = statement.importClause?.namedBindings;
      if (
        !ts.isImportDeclaration(statement) ||
        !PACKAGES.includes(statement.moduleSpecifier.text) ||
        (!types && statement.importClause?.isTypeOnly) ||
        !bindings
      ) {
        return [];
      }
      return ts.isNamespaceImport(bindings)
        ? [{ statement, namespace: bindings }]
        : bindings.elements
            .filter((specifier) => types || !specifier.isTypeOnly)
            .map((specifier) => ({ statement, specifier }));
    });

  /**
   * Whether a node refers to `component`, imported by name, alias or namespace: an identifier, `UI.Component`,
   * or a type, possibly `| null` or `| undefined`.
   */
  const isComponent = (component) => {
    const all = imports(true);
    // Compare symbols, not names, so a local variable with the same name doesn't match.
    const named = new Set(
      all
        .filter(
          ({ specifier }) =>
            specifier && (specifier.propertyName ?? specifier.name).text === component,
        )
        .map(({ specifier }) => checker.getSymbolAtLocation(specifier.name)),
    );
    const namespaces = new Set(
      all
        .filter(({ namespace }) => namespace)
        .map(({ namespace }) => checker.getSymbolAtLocation(namespace.name)),
    );
    const isNullish = (type) =>
      type.kind === ts.SyntaxKind.UndefinedKeyword ||
      (ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NullKeyword);
    const is = (node) => {
      if (ts.isTypeReferenceNode(node)) {
        return !node.typeArguments && is(node.typeName);
      }
      if (ts.isUnionTypeNode(node)) {
        return node.types.some(is) && node.types.every((type) => is(type) || isNullish(type));
      }
      if (ts.isIdentifier(node)) {
        return named.has(symbolOf(node));
      }
      // `UI.Component`: also check that `UI` is really one of our namespace imports.
      const [left, right] = ts.isPropertyAccessExpression(node)
        ? [node.expression, node.name]
        : ts.isQualifiedName(node)
          ? [node.left, node.right]
          : [];
      return right?.text === component && ts.isIdentifier(left) && namespaces.has(symbolOf(left));
    };
    return is;
  };

  /**
   * Whether `name` names nothing in the script but `existing`, the import it may already have,
   * so it can replace the references to another import of the same component.
   */
  const isFree = (name, existing) =>
    identifiers(name).every((node) => {
      const { parent } = node;
      // `obj.Name`, `UI.Name` and the `Name` in `Name as Alias` don't claim the name.
      return (
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isQualifiedName(parent) && parent.right === node) ||
        (ts.isImportSpecifier(parent) && parent.propertyName === node) ||
        (existing && symbolOf(node) === checker.getSymbolAtLocation(existing))
      );
    });

  /** Removes a specifier or namespace import, with its comma, or the whole statement if nothing else is left */
  const removeImport = (node) => {
    const elements = ts.isImportSpecifier(node) ? node.parent.elements : [node];
    const index = elements.indexOf(node);
    // Take a comma along: the one after the specifier, or the one before it when it's last.
    if (elements.length > 1) {
      return index < elements.length - 1
        ? { start: node.getStart(source), end: elements[index + 1].getStart(source), text: '' }
        : { start: elements[index - 1].end, end: node.end, text: '' };
    }
    const clause = ts.isImportSpecifier(node) ? node.parent.parent : node.parent;
    // `import Default, { Name }`: keep the default import.
    if (clause.name) {
      return { start: clause.name.end, end: clause.namedBindings.end, text: '' };
    }
    // Nothing else is left, so drop the whole statement and its line break.
    const statement = clause.parent;
    const lineBreak = /^\r?\n/.exec(text.slice(statement.end))?.[0] ?? '';
    return { start: statement.getStart(source), end: statement.end + lineBreak.length, text: '' };
  };

  const replace = (node, replacement) => ({
    start: node.getStart(source),
    end: node.end,
    text: replacement,
  });

  return {
    ts,
    source,
    text,
    symbolOf,
    imports,
    references,
    isComponent,
    isFree,
    removeImport,
    replace,
  };
}
