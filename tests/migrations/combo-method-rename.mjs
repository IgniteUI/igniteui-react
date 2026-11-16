import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import comboMethodRename from '../../migrations/19.11.0-poc.4/combo-method-rename.js';

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
  comboMethodRename(host);
  assert.equal(files[file], after);
  comboMethodRename(host);
  assert.deepEqual(writes, before === after ? [] : [file]);
}

test('renames show() to toggle() on the ref of an IgrCombo', () => {
  const app = (method) => `import { useRef } from 'react';
import { IgrCombo } from 'igniteui-react';

export function App() {
  const comboRef = useRef<IgrCombo>(null);
  const open = () => comboRef.current?.${method}();
  return <IgrCombo ref={comboRef} />;
}
`;
  migrates(app('show'), app('toggle'));
  migrates(LICENSED(app('show')), LICENSED(app('toggle')));
});

test('finds the refs by type, alias, namespace, class property or IgrCombo element', () => {
  const app = (method) => `import React, { createRef, useRef } from 'react';
import { IgrCombo as Combo, IgrSelect } from 'igniteui-react';
import type * as UI from 'igniteui-react';

export function App({ dialog }: { dialog: { show(): void } }) {
  const typed = React.useRef<UI.IgrCombo | null>(null);
  const untyped = useRef(null);
  const select = useRef<IgrSelect>(null);
  const shared = useRef(null);
  typed.current!.${method}();
  (untyped.current as Combo).hide();
  untyped.current.${method}().then(() => select.current?.show());
  shared.current.show();
  dialog.show();
  const local = (typed: { current: { show(): void } }) => typed.current.show();
  return (
    <>
      <Combo ref={untyped} />
      <Combo ref={shared} />
      <IgrSelect ref={select} />
      <IgrSelect ref={shared} />
    </>
  );
}

export class Legacy extends React.Component {
  combo = createRef<Combo>();
  open() {
    this.combo.current?.${method}?.();
  }
}
`;
  migrates(app('show'), app('toggle'));
  migrates(
    `import { useRef } from 'react';
import { IgrCombo } from 'igniteui-react';

export const App = () => {
  const combo = useRef(null);
  return <IgrCombo ref={combo} onClick={() => combo.current.show()} />;
};
`,
    `import { useRef } from 'react';
import { IgrCombo } from 'igniteui-react';

export const App = () => {
  const combo = useRef(null);
  return <IgrCombo ref={combo} onClick={() => combo.current.toggle()} />;
};
`,
    'src/App.jsx',
  );
});

test('skips IgrCombo from another module', () => {
  const text = `import { useRef } from 'react';
import { IgrCombo } from './combo';

const combo = useRef<IgrCombo>(null);
combo.current?.show();
`;
  migrates(text, text);
});
