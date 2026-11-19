import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgrBadge';
const OLD = 'outline';
const NEW = 'outlined';

/**
 * Renames `outline` to `outlined` on `IgrBadge` from `igniteui-react` or `@infragistics/igniteui-react`;
 * drops `outline` when `outlined` is set.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function badgeOutline(host) {
  migrateScripts(host, COMPONENT, ({ ts, source, text, isComponent, replace }) => {
    // Compares symbols, so a local variable named IgrBadge is left alone.
    const isBadge = isComponent(COMPONENT);
    const edits = [];
    const visit = (node) => {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        isBadge(node.tagName)
      ) {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const hasNew = attributes.some((a) => a.name.getText(source) === NEW);
        for (const attribute of attributes.filter((a) => a.name.getText(source) === OLD)) {
          edits.push(
            hasNew
              ? { start: trimStart(text, attribute.getStart(source)), end: attribute.end, text: '' }
              : replace(attribute.name, NEW),
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return edits;
  });
}

// A removed attribute takes its leading whitespace along.
function trimStart(text, start) {
  let index = start;
  while (index > 0 && /\s/.test(text[index - 1])) {
    index--;
  }
  return index;
}
