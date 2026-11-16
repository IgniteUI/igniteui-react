import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeImportAlias from '../../migrations/19.11.0-poc.1/badge-import-alias.js';
import badgeNamespaceImport from '../../migrations/19.11.0-poc.2/badge-namespace-import.js';

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

test('namespace: imports IgrBadge by name, dropping the namespace import once unused', () => {
  migrates(
    [badgeNamespaceImport],
    `import * as UI from 'igniteui-react';

<UI.IgrBadge outlined>New</UI.IgrBadge>;
`,
    `import { IgrBadge } from 'igniteui-react';

<IgrBadge outlined>New</IgrBadge>;
`,
    'src/App.jsx',
  );

  const app = (badge, imports) => `import * as React from 'react';
${imports}
import * as Other from './other';

let ref: React.Ref<${badge}>;
export const App = () => (
  <>
    <${badge} ref={ref}>3</${badge}>
    <${badge} dot />
    <UI.IgrAvatar />
    <Other.IgrBadge />
  </>
);
export const Shadowed = (UI: typeof Other) => <UI.IgrBadge />;
`;
  migrates(
    [badgeNamespaceImport],
    app('UI.IgrBadge', "import * as UI from 'igniteui-react';"),
    app(
      'IgrBadge',
      "import * as UI from 'igniteui-react';\nimport { IgrBadge } from 'igniteui-react';",
    ),
  );
  migrates(
    [badgeNamespaceImport],
    LICENSED(app('UI.IgrBadge', "import * as UI from 'igniteui-react';")),
    LICENSED(
      app(
        'IgrBadge',
        "import * as UI from 'igniteui-react';\nimport { IgrBadge } from 'igniteui-react';",
      ),
    ),
  );
});

test('namespace: reuses an import of IgrBadge by name', () => {
  migrates(
    [badgeNamespaceImport],
    `import * as UI from 'igniteui-react';
import { IgrBadge } from 'igniteui-react';
<><UI.IgrBadge /><IgrBadge /></>;
`,
    `import { IgrBadge } from 'igniteui-react';
<><IgrBadge /><IgrBadge /></>;
`,
  );
});

test('namespace: skips a script where IgrBadge names something else', () => {
  for (const conflict of [
    'const IgrBadge = 1;',
    'const f = (IgrBadge) => IgrBadge;',
    "import { IgrBadge } from './badge';",
    "import { IgrBadge } from '@infragistics/igniteui-react';",
  ]) {
    const text = `import * as UI from 'igniteui-react';\n${conflict}\n<UI.IgrBadge />;\n`;
    migrates([badgeNamespaceImport], text, text);
  }
});

test('integration: the migrations run on their own or one after the other, in either order', () => {
  const before = `import { IgrBadge as Badge } from 'igniteui-react';
import * as UI from 'igniteui-react';

<><Badge /><UI.IgrBadge /><UI.IgrAvatar /></>;
`;
  migrates(
    [badgeImportAlias],
    before,
    `import { IgrBadge } from 'igniteui-react';
import * as UI from 'igniteui-react';

<><IgrBadge /><UI.IgrBadge /><UI.IgrAvatar /></>;
`,
  );
  migrates(
    [badgeNamespaceImport],
    before,
    `import { IgrBadge as Badge } from 'igniteui-react';
import * as UI from 'igniteui-react';
import { IgrBadge } from 'igniteui-react';

<><Badge /><IgrBadge /><UI.IgrAvatar /></>;
`,
  );
  const after = (imports) => `${imports}
import * as UI from 'igniteui-react';

<><IgrBadge /><IgrBadge /><UI.IgrAvatar /></>;
`;
  migrates(
    [badgeImportAlias, badgeNamespaceImport],
    before,
    after("import { IgrBadge } from 'igniteui-react';"),
  );
  migrates(
    [badgeNamespaceImport, badgeImportAlias],
    before,
    `import * as UI from 'igniteui-react';
import { IgrBadge } from 'igniteui-react';

<><IgrBadge /><IgrBadge /><UI.IgrAvatar /></>;
`,
  );
});
