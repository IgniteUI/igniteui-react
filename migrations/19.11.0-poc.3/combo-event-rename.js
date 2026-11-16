// PoC only, synthetic: onOpening and onOpened are distinct, real events of IgrCombo; never ship this.
import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgrCombo';
const OLD = 'onOpening';
const NEW = 'onOpened';

/**
 * Renames the `onOpening` prop to `onOpened` on `IgrCombo` elements, imported by name, alias or namespace.
 * Skips an element that has `onOpened` already, or `onOpening` more than once.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function comboEventRename(host) {
  migrateScripts(host, COMPONENT, ({ ts, source, isComponent, replace }) => {
    const isCombo = isComponent(COMPONENT);
    const edits = [];
    const visit = (node) => {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        isCombo(node.tagName)
      ) {
        const names = node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((attribute) => attribute.name);
        const old = names.filter((name) => name.getText(source) === OLD);
        if (old.length === 1 && !names.some((name) => name.getText(source) === NEW)) {
          edits.push(replace(old[0], NEW));
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return edits;
  });
}
