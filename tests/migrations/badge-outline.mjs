// Run by node --test: the name stays outside vitest's browser test glob.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeOutline from '../../migrations/19.11.0-poc.0/badge-outline.js';

/** In-memory project; `typescript` stands in for the CLI's */
function project(files, typescript = ts) {
  const writes = [];
  const host = {
    root: '.',
    typescript,
    files: () => Object.keys(files),
    read: (path) => files[path],
    write: (path, content) => {
      writes.push(path);
      files[path] = content;
    },
  };
  return { files, writes, run: () => badgeOutline(host) };
}

const app = (old, outlined) => `import { IgrAvatar, IgrBadge, IgrButton } from 'igniteui-react';
import './App.css';

// <IgrBadge outline> in a comment
export function App({ isActive, count }: { isActive: boolean; count: number }) {
  return (
    <div className="outline" title="outline">
      <IgrBadge ${old}>3</IgrBadge>
      <IgrBadge ${old}={isActive} variant="success" />
      <IgrBadge
        variant="info"
        ${old}={isActive && count > 0}
      >
        outline text
      </IgrBadge>
      <IgrBadge outlined variant="warning" />
      <IgrBadge ${outlined}outlined={isActive} />
      <IgrAvatar outline shape="circle" />
      <IgrButton outline>outline</IgrButton>
      <span>{'<IgrBadge outline />'}</span>
    </div>
  );
}
`;

const aliased = (old) => `import { IgrBadge as Badge } from 'igniteui-react';
import * as Ig from 'igniteui-react';

export const A = () => <Badge ${old} />;
export const B = () => <Ig.IgrBadge ${old}>1</Ig.IgrBadge>;
`;

const notIgnite = `import { IgrBadge } from './my-badge';

export const C = () => <IgrBadge outline />;
`;

const css = 'igc-badge { outline: 1px solid; }\n';

test('renames outline to outlined on IgrBadge only, keeping everything else', () => {
  const { files, writes, run } = project({
    'src/App.tsx': app('outline', 'outline '),
    'src/Aliased.jsx': aliased('outline'),
    'src/NotIgnite.tsx': notIgnite,
    'src/App.css': css,
  });

  run();

  assert.equal(files['src/App.tsx'], app('outlined', ''));
  assert.equal(files['src/Aliased.jsx'], aliased('outlined'));
  assert.equal(files['src/NotIgnite.tsx'], notIgnite);
  assert.equal(files['src/App.css'], css);
  assert.deepEqual(writes, ['src/App.tsx', 'src/Aliased.jsx']);
});

test('also renames on IgrBadge from the licensed package', () => {
  const licensed = (text) =>
    text.replaceAll("from 'igniteui-react'", "from '@infragistics/igniteui-react'");
  const other = notIgnite.replace("'./my-badge'", "'@acme/igniteui-react'");
  const { files, writes, run } = project({
    'src/App.tsx': licensed(app('outline', 'outline ')),
    'src/Aliased.jsx': licensed(aliased('outline')),
    'src/Other.tsx': other,
  });

  run();
  run();

  assert.equal(files['src/App.tsx'], licensed(app('outlined', '')));
  assert.equal(files['src/Aliased.jsx'], licensed(aliased('outlined')));
  assert.equal(files['src/Other.tsx'], other);
  assert.deepEqual(writes, ['src/App.tsx', 'src/Aliased.jsx']);
});

test('changes nothing when run again', () => {
  const { files, writes, run } = project({ 'src/App.tsx': app('outline', 'outline ') });

  run();
  const migrated = files['src/App.tsx'];
  run();

  assert.equal(files['src/App.tsx'], migrated);
  assert.equal(writes.length, 1);
});

test('skips a locally shadowed IgrBadge', () => {
  const app = (old) => `import { IgrBadge } from 'igniteui-react';

const Example = (IgrBadge) => <IgrBadge outline />;
export const App = () => <IgrBadge ${old} />;
`;
  const { files, run } = project({ 'src/App.tsx': app('outline') });

  run();

  assert.equal(files['src/App.tsx'], app('outlined'));
});

test('skips a file with syntax errors, with a warning, and migrates the others', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const broken = `import { IgrBadge } from 'igniteui-react';
function App() {
  return <IgrBadge outline />;
`;
  const { files, writes, run } = project({
    'src/Broken.tsx': broken,
    'src/App.tsx': app('outline', 'outline '),
  });

  run();

  assert.equal(files['src/Broken.tsx'], broken);
  assert.equal(files['src/App.tsx'], app('outlined', ''));
  assert.deepEqual(writes, ['src/App.tsx']);
  assert.equal(warn.mock.callCount(), 1);
  assert.match(warn.mock.calls[0].arguments[0], /Skipped src\/Broken\.tsx/);
});

test("fails clearly without the CLI's TypeScript, but only for files that use IgrBadge", () => {
  assert.doesNotThrow(() =>
    project({ 'src/Other.tsx': notIgnite.replaceAll('IgrBadge', 'Other') }, null).run(),
  );
  assert.throws(
    () => project({ 'src/App.tsx': app('outline', '') }, null).run(),
    /requires TypeScript from the CLI/,
  );
});
