---
name: igniteui-react-components
description: Pick, install, and use Ignite UI for React (Igr*) components — package routing, theme CSS, JSX and slots, events, refs, forms, TypeScript, charts/gauges/maps, grids. Use when choosing a component for a UI pattern, setting up igniteui-react, writing Igr* JSX, wiring events or refs, or debugging components that render unstyled, invisible, or with broken icons.
user-invocable: true
---

# Ignite UI for React Components

`Igr*` components are React wrappers around `igc-*` web components. Everything below follows from that.

## Non-negotiables

1. **Import a theme CSS file** or components render unstyled with broken icons.
2. **No `.register()`** for `igniteui-react`, `igniteui-react-grids`, `igniteui-react/grid-lite`, or `igniteui-react-dockmanager` — the wrapper registers the element on import. Charts, gauges, and maps (separate legacy packages) **do** require `.register()`.
3. **CSS selectors must target `igc-*`**, never `IgrButton`. Use `::part()` for shadow DOM internals.
4. **Events are `CustomEvent`**, not React `SyntheticEvent`. Read `e.detail`.
5. **Never set column `width`** on `IgrColumn` / `IgrGridLiteColumn` unless asked — see [DATAVIZ.md](./reference/DATAVIZ.md).
6. **Charts, gauges, maps, and grids need an explicitly sized container** or they render at zero height.

## Packages

| Need | Install | Import from |
|---|---|---|
| Core UI (MIT) | `igniteui-react` | `igniteui-react` |
| Grid Lite (MIT) | `igniteui-react` **+** `igniteui-grid-lite` | `igniteui-react/grid-lite` |
| Data/Tree/Pivot/Hierarchical Grid | `igniteui-react-grids` | `igniteui-react-grids` |
| Dock Manager | `igniteui-react-dockmanager` | `igniteui-react-dockmanager` |
| Charts, gauges, maps | `igniteui-react-charts` / `-gauges` / `-maps` | same |

Commercial packages also publish under `@infragistics/…` for licensed workspaces; use that scope and its matching CSS path when the workspace already uses it. `igniteui-grid-lite` is an optional peer of `igniteui-react` — Grid Lite needs both installed.

## Quick start

```bash
npm install igniteui-react
```

```tsx
// main.tsx — theme first, your overrides after
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';

<IgrInput label="Name" />
<IgrButton>Submit</IgrButton>
```

Themes: `igniteui-webcomponents/themes/{light|dark}/{bootstrap|material|fluent|indigo}.css`.
**Grids need a second import**: `igniteui-react-grids/grids/themes/{light|dark}/<design-system>.css`.
Next.js has no single entry point — import the theme CSS in `app/layout.tsx` or in each `'use client'` file that uses components.

## Reference

| File | Load when |
|---|---|
| [COMPONENTS.md](./reference/COMPONENTS.md) | Choosing a component for a described UI pattern |
| [USAGE.md](./reference/USAGE.md) | Writing JSX — slots, events, refs, forms, TypeScript |
| [DATAVIZ.md](./reference/DATAVIZ.md) | Charts, gauges, maps, Grid Lite, grid columns |
| [MCP.md](./reference/MCP.md) | Looking up authoritative API docs; setting up the MCP server |
| [TROUBLESHOOTING.md](./reference/TROUBLESHOOTING.md) | Something renders wrong |

## Verify before you write

Component APIs change between versions. Prefer the `igniteui-cli` MCP server (`get_doc`, `get_api_reference`, `search_api`) over recall for prop names, slot names, event names, and enum values — see [MCP.md](./reference/MCP.md). Without MCP, read the installed `.d.ts` files under `node_modules/igniteui-webcomponents/components/<component>/` (or `igniteui-webcomponents-grids/grids/lib/`), which carry `@slot`, `@csspart`, `@fires`, and `@cssproperty` annotations.

## Related skills

- [igniteui-react-customize-theme](../igniteui-react-customize-theme/SKILL.md) — brand colors, dark mode, component tokens
- [igniteui-react-optimize-bundle-size](../igniteui-react-optimize-bundle-size/SKILL.md) — code splitting heavy families
- [grid-lite-to-igr-grid-migration](../grid-lite-to-igr-grid-migration/SKILL.md) — Grid Lite → premium `IgrGrid`
