# Project Context

Concise context for ACS-aware tools. The contribution workflow and commit conventions live in
[`.github/CONTRIBUTING.md`](../../.github/CONTRIBUTING.md), and the lint and format rules in
[`biome.json`](../../biome.json). Read them before making changes; if they disagree with this
file, they win.

## Stack

- Language: TypeScript (strict), ESM only, `moduleResolution: bundler`
- Wrappers: `@lit/react` `createComponent` over `igniteui-webcomponents`,
  `igniteui-webcomponents-grids`, `igniteui-grid-lite` and `igniteui-dockmanager`
- Code generation: `tsx` scripts that read each package's `custom-elements.json`
- Build: Vite library mode for JS, `tsc` for declarations
- Tests: Vitest browser mode with Playwright (Chromium) and `vitest-browser-react`
- Tooling: Biome (lint and format, run on staged files by the lefthook pre-commit hook),
  `@arethetypeswrong/cli` for the published typings
- Docs: TypeDoc with the local plugin in `plugins/typedoc-plugin-react-components/`
- Release: Azure Pipelines in `.azure-pipelines/`; CI in `.github/workflows/ci.yml`

## Architecture

- `scripts/build-wc.ts`, `build-grids.ts`, `build-grid-lite.ts`, `build-dm.ts`: generate the
  wrappers into `src/components/`, `src/grids/`, `src/grid-lite/` and `src/dock-manager/`. These
  folders are git-ignored; change the generator config or `scripts/utils.ts`, never the output.
- `scripts/*.package.json`: the published manifest of each package (`components`, `grids`,
  `dock-manager`); `scripts/validate-dist.ts` checks the built `dist/` against them
- `src/components.ts`, `grids.ts`, `grid-lite.ts`, `dock-manager.ts`: package entry points
- `src/react-props.tsx`, `src/render-props.ts`: the `createComponent` wrapper and the render
  props bridge that turns React templates into Lit templates
- `src/backfills.ts`, `src/backfill-types-*.ts`: hand-written types the generated code relies on
- `src/extras/`: hand-written add-ons, published as `igniteui-react/extras`
- `tests/`: browser tests per package (`web-components`, `grids`, `grid-lite`, `dock-manager`)
- `.azure-pipelines/artifacts/`: the READMEs and licenses copied into each published package
- `skills/`: public, user-facing skills that ship with the `igniteui-react` package
- `.agents/`: contributor-facing skills and this context

## Workflow

Use the contributor skills instead of guessing (see [`.agents/skills/`](../skills/README.md)):

- Skills: [skill-authoring](../skills/skill-authoring/SKILL.md)

Run `npm run build` first: the tests and the entry points import the generated wrappers. Before
finishing, run `npm run lint`, `npm run validate:dist` and `npm run test:ci`. Update
`CHANGELOG.md` under `## Unreleased` for user-visible changes, including changes to `skills/`.

## Do not change without explicit instruction

- `tsconfig*.json` compiler options (strict mode is required)
- `package-lock.json` or new runtime dependencies; dependency versions are bumped deliberately,
  together with the matching `scripts/*.package.json`
- Public component names, prop names or event names without a deprecation plan
- Generated output: `src/components/`, `src/grids/`, `src/grid-lite/`, `src/dock-manager/`, `dist/`
- The `files` and `exports` fields of `scripts/*.package.json`; run `npm run validate:dist`
  after any change to them
