import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgrCombo';
const OLD = 'show';
const NEW = 'toggle';

/**
 * Renames `ref.current.show()` to `ref.current.toggle()` for the refs of `IgrCombo`: those created by
 * `useRef<IgrCombo>()` or `createRef<IgrCombo>()`, or passed as `ref` to `IgrCombo` elements. Skips a ref also
 * passed to another element.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function comboMethodRename(host) {
  migrateScripts(host, COMPONENT, ({ ts, source, symbolOf, isComponent, replace }) => {
    const isCombo = isComponent(COMPONENT);
    // Look through `(x)` and `x!`.
    const skip = (node) =>
      ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node)
        ? skip(node.expression)
        : node;
    /** The symbol of `ref` or `this.ref` */
    const symbol = (node) => {
      const expression = skip(node);
      return ts.isIdentifier(expression)
        ? symbolOf(expression)
        : ts.isPropertyAccessExpression(expression)
          ? symbolOf(expression.name)
          : undefined;
    };
    // `useRef<IgrCombo>()` or `createRef<IgrCombo>()`, also when called as `React.useRef`.
    const isComboRef = (node) => {
      const call = skip(node);
      if (!ts.isCallExpression(call)) {
        return false;
      }
      const callee = skip(call.expression);
      const name = ts.isPropertyAccessExpression(callee) ? callee.name : callee;
      return (
        ts.isIdentifier(name) &&
        (name.text === 'useRef' || name.text === 'createRef') &&
        call.typeArguments?.length === 1 &&
        isCombo(call.typeArguments[0])
      );
    };

    // Collect the combo refs, the refs passed to other elements, and every `.show()` call.
    const refs = new Set();
    const otherRefs = new Set();
    const calls = [];
    const visit = (node) => {
      if (
        (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) &&
        node.initializer &&
        isComboRef(node.initializer)
      ) {
        refs.add(symbolOf(node.name));
      } else if (
        ts.isJsxAttribute(node) &&
        node.name.getText(source) === 'ref' &&
        node.initializer?.expression
      ) {
        // A ref also passed to another element may not hold a combo, so its calls are skipped.
        const element = node.parent.parent;
        (isCombo(element.tagName) ? refs : otherRefs).add(symbol(node.initializer.expression));
      } else if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === OLD
      ) {
        calls.push(node.expression);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);

    // Rename only `ref.current.show()` on a ref that belongs to combos alone.
    return calls.flatMap(({ expression, name }) => {
      const current = skip(expression);
      const ref =
        ts.isPropertyAccessExpression(current) &&
        current.name.text === 'current' &&
        symbol(current.expression);
      return ref && refs.has(ref) && !otherRefs.has(ref) ? [replace(name, NEW)] : [];
    });
  });
}
