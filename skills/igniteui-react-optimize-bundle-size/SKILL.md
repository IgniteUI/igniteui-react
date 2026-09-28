---
license: MIT
name: igniteui-react-optimize-bundle-size
description: "Covers reducing bundle size in apps that use Ignite UI for React: package selection, tree-shaking, and route-level code splitting of grids, charts, maps, and gauges. WHEN TO USE: the bundle or initial load is too large, tree-shaking is not removing unused Ignite UI code, heavy packages appear in the initial chunk, or the user is deciding what to lazy load. WHEN NOT TO USE: first-time package installation or component setup (use igniteui-react-components), theming (use igniteui-react-customize-theme), upgrading from Grid Lite to the premium grid (use igniteui-react-migrate-grid-lite-to-premium), or runtime performance problems unrelated to bundle size, such as rendering or data virtualization."
user-invocable: true
---

# Optimizing Ignite UI for React Bundle Size

Standard React techniques (`React.lazy` + `Suspense`, route splitting, minification, compression, bundle analyzers) apply unchanged. This skill covers only what is specific to Ignite UI.

## Where the weight is

`igniteui-react` is published with `"sideEffects": false` and per-component modules, so named imports tree-shake well — a handful of core components costs little. The heavy families are separate packages:

| Package | Weight | Notes |
|---|---|---|
| `igniteui-react` | light per component | core UI; tree-shakes cleanly |
| `igniteui-grid-lite` | small | MIT grid; far lighter than the premium grids |
| `igniteui-react-grids` | heavy | Data/Tree/Pivot/Hierarchical grid |
| `igniteui-react-charts` / `-maps` / `-gauges` | heavy | legacy DV packages, weaker tree-shaking |

Two conclusions: **install only the families you use**, and **split the heavy families out of the initial chunk**. Downgrading `IgrGrid` to `IgrGridLite` is often the single largest win when the app only displays flat, read-only data — check the feature list in [DATAVIZ.md](../igniteui-react-components/references/DATAVIZ.md) first.

## Import rules

```tsx
import { IgrButton, IgrCard } from 'igniteui-react';        // ✅ tree-shakes
import * as IgniteUI from 'igniteui-react';                 // ❌ defeats tree-shaking
import { IgcButtonComponent } from 'igniteui-webcomponents'; // ❌ bypasses the wrapper
```

Never import from `igniteui-webcomponents` (or `igniteui-webcomponents-grids`) directly. It pulls a second copy of the element definitions alongside the wrappers and skips the auto-registration the wrapper performs.

## Splitting the heavy families

Lazy-load at the **route or panel** boundary, not the component. `IgrGrid` and the DV charts are only worth splitting when the whole view that uses them is deferred.

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard')); // grid + its theme CSS
const Analytics = lazy(() => import('./pages/Analytics')); // charts + registration
```

Two Ignite-UI-specific details:

- **Keep the grid theme CSS import inside the lazy chunk** (`import 'igniteui-react-grids/grids/themes/light/bootstrap.css'` in `Dashboard.tsx`), so the grid stylesheet is not in the initial payload. The base theme CSS stays in the entry point — every page needs it.
- **Keep `.register()` calls inside the lazy chunk too.** Chart, gauge, and map modules must register at module scope of the file that uses them; hoisting the registration to the entry point pulls the whole DV package back into the initial bundle.

For manual chunking, give each family its own chunk so a page needing charts does not download grids:

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'ig-core': ['igniteui-react'],
        'ig-grids': ['igniteui-react-grids'],   // only if actually installed
        'ig-charts': ['igniteui-react-charts'], // only if actually installed
      },
    },
  },
}
```

## Auditing

```bash
# components referenced in JSX
grep -rhoE "<Igr[A-Za-z]+" src --include="*.tsx" | sort -u
# what is imported
grep -rn "from 'igniteui-react" src --include="*.tsx" --include="*.ts"
```

Then run any bundle analyzer and check the initial chunk for `igniteui-react-grids` / `-charts`. If either appears there while only used on secondary routes, the split is not working — usually a shared module (a barrel `index.ts`, a types file, or a hoisted `.register()` call) re-imports it eagerly.

## When tree-shaking still fails

1. A wildcard or barrel import somewhere in `src`.
2. A local barrel file re-exporting Ignite UI components — it creates one module that depends on everything.
3. CommonJS output: set `"module": "esnext"` and `"moduleResolution": "bundler"` in `tsconfig.json`.
4. Both `igniteui-react-grids` and `@infragistics/igniteui-react-grids` resolved at once — pick one scope.

## Related skills

- [igniteui-react-components](../igniteui-react-components/SKILL.md) — package routing and what each family provides
- [igniteui-react-migrate-grid-lite-to-premium](../igniteui-react-migrate-grid-lite-to-premium/SKILL.md) — the reverse direction, when Grid Lite is not enough
