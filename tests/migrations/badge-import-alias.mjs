import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeImportAlias from '../../migrations/19.11.0-poc.1/badge-import-alias.js';

const LICENSED = (text) => text.replaceAll("'igniteui-react'", "'@infragistics/igniteui-react'");

/** Runs the migrations in order on the files, returning the written paths */
function run(files, ...migrations) {
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
  for (const migration of migrations) {
    migration(host);
  }
  return writes;
}

/** Asserts the migrations turn `before` into `after`, then change nothing more */
function migrates(migrations, before, after, file = 'src/App.tsx') {
  const files = { [file]: before };
  run(files, ...migrations);
  assert.equal(files[file], after);
  assert.deepEqual(run(files, ...migrations), []);
}

test('alias: imports IgrBadge by name and renames every reference to the alias', () => {
  migrates(
    [badgeImportAlias],
    `import { IgrBadge as Badge } from 'igniteui-react';

<Badge outlined>New</Badge>;
`,
    `import { IgrBadge } from 'igniteui-react';

<IgrBadge outlined>New</IgrBadge>;
`,
    'src/App.jsx',
  );

  const app = (badge, specifier) => `import React from 'react';
import { IgrAvatar, ${specifier}, IgrButton as Button } from 'igniteui-react';

export const App = ({ count }: { count: number }) => {
  const ref = React.useRef<${badge}>(null);
  const Wrapped = (Badge: string) => <Badge />;
  return (
    <div title="Badge">
      <${badge} ref={ref} outlined>{count}</${badge}>
      <${badge} dot />
      <IgrAvatar />
      <Button>Badge</Button>
      {Wrapped('span')}
    </div>
  );
};
const components = { ${badge === 'Badge' ? 'Badge' : 'Badge: IgrBadge'} };
export { ${badge === 'Badge' ? 'Badge' : 'IgrBadge as Badge'}, components };
`;
  migrates([badgeImportAlias], app('Badge', 'IgrBadge as Badge'), app('IgrBadge', 'IgrBadge'));
  migrates(
    [badgeImportAlias],
    LICENSED(app('Badge', 'IgrBadge as Badge')),
    LICENSED(app('IgrBadge', 'IgrBadge')),
  );
});

test('alias: drops the alias when IgrBadge is imported by name too', () => {
  migrates(
    [badgeImportAlias],
    `import { IgrBadge, IgrBadge as Badge } from 'igniteui-react';
<><Badge /><IgrBadge /></>;
`,
    `import { IgrBadge } from 'igniteui-react';
<><IgrBadge /><IgrBadge /></>;
`,
  );
});

test('alias: skips a script where IgrBadge names something else', () => {
  for (const conflict of [
    'const IgrBadge = 1;',
    'function f(IgrBadge) {}',
    "import { IgrBadge } from './badge';",
    "import { IgrBadge } from '@infragistics/igniteui-react';",
    "import { IgrBadge as Other } from 'igniteui-react';",
  ]) {
    const text = `import { IgrBadge as Badge } from 'igniteui-react';\n${conflict}\n<Badge />;\n`;
    migrates([badgeImportAlias], text, text);
  }
});

test('alias: keeps a side-effect import of the package', () => {
  migrates(
    [badgeImportAlias],
    `import 'igniteui-react';\nimport { IgrBadge as Badge } from 'igniteui-react';\n<Badge />;\n`,
    `import 'igniteui-react';\nimport { IgrBadge } from 'igniteui-react';\n<IgrBadge />;\n`,
  );
});
