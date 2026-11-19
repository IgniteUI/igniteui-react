import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import comboEventRename from '../../migrations/19.11.0-poc.3/combo-event-rename.js';

const LICENSED = (text) => text.replaceAll("'igniteui-react'", "'@infragistics/igniteui-react'");

/** Asserts the migration turns `before` into `after`, then changes nothing more */
function migrates(before, after, file = 'src/App.tsx') {
  const files = { [file]: before };
  const writes = [];
  const host = {
    root: '.',
    typescript: ts,
    files: () => Object.keys(files),
    read: (path) => files[path],
    write: (path, content) => {
      writes.push(path);
      files[path] = content;
    },
  };
  comboEventRename(host);
  assert.equal(files[file], after);
  comboEventRename(host);
  assert.deepEqual(writes, before === after ? [] : [file]);
}

test('renames onOpening to onOpened on IgrCombo', () => {
  migrates(
    `import { IgrCombo } from 'igniteui-react';

<IgrCombo onOpening={handleOpening} />;
`,
    `import { IgrCombo } from 'igniteui-react';

<IgrCombo onOpened={handleOpening} />;
`,
  );
});

test('renames on IgrCombo imported by name, alias or namespace only', () => {
  const app = (event) => `import { IgrCombo, IgrCombo as Combo, IgrSelect } from 'igniteui-react';
import * as UI from 'igniteui-react';
import { Custom } from './custom';

export const App = ({ onOpening }: { onOpening: () => void }) => (
  <>
    <IgrCombo ${event}={onOpening} onClosing={onOpening} />
    <Combo ${event}={() => console.log('onOpening')}>
      onOpening
    </Combo>
    <UI.IgrCombo
      ${event}={onOpening}
    ></UI.IgrCombo>
    <IgrSelect onOpening={onOpening} />
    <UI.IgrSelect onOpening={onOpening} />
    <Custom onOpening={onOpening} />
  </>
);
const handlers = { onOpening: () => {} };
export const Shadowed = (IgrCombo: typeof Custom) => <IgrCombo onOpening={handlers.onOpening} />;
`;
  migrates(app('onOpening'), app('onOpened'));
  migrates(LICENSED(app('onOpening')), LICENSED(app('onOpened')));
  migrates(
    `import { IgrCombo } from 'igniteui-react';\nexport const App = () => <IgrCombo onOpening={() => {}} />;\n`,
    `import { IgrCombo } from 'igniteui-react';\nexport const App = () => <IgrCombo onOpened={() => {}} />;\n`,
    'src/App.jsx',
  );
});

test('skips IgrCombo from another module, and an element that has onOpened already', () => {
  for (const text of [
    "import { IgrCombo } from './combo';\n<IgrCombo onOpening={h} />;\n",
    "import { IgrCombo } from 'igniteui-react';\n<IgrCombo onOpening={a} onOpened={b} />;\n",
    "import { IgrCombo } from 'igniteui-react';\n<IgrCombo onOpening={a} onOpening={b} />;\n",
  ]) {
    migrates(text, text);
  }
});
