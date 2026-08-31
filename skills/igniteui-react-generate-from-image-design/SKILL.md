---
name: igniteui-react-generate-from-image-design
description: Build a React view from a design image (screenshot, mockup, wireframe) using Ignite UI for React components and generated theme tokens. Use when the user supplies an image and asks to implement this design, build this UI, convert this mockup, or create a page from this screenshot in an Ignite UI React project.
user-invocable: true
---

# Implementing a React View from a Design Image

React only — pass `platform: 'react'` / `framework: 'react'` to every MCP call.

## Order of work

1. **Read the image.** Identify every region, its component, and the layout structure.
2. **Inspect the app.** Existing theme imports, design system, palette overrides, installed packages.
3. **Look up the components you chose** before writing them — `get_doc`, `get_api_reference`.
4. **Theme** — global layer only if the app has none, then per-component tokens.
5. **Implement** the layout, mock data, and view.
6. **Validate** — build, run, compare with the image, iterate.

Steps 3 and 4 use MCP servers where available; both are optional. Without them, read the installed `.d.ts` files (`node_modules/igniteui-webcomponents/components/<name>/`) for props, `@slot`, `@csspart`, and `@cssproperty` names, and theme with the palette shades documented in [igniteui-react-customize-theme](../igniteui-react-customize-theme/SKILL.md).

## 1. Read the image

Record, per region: layout role and proportions, component type, colors, type scale, borders/radius/shadow, data shape, and spacing rhythm.

Resolve layout as CSS Grid rows and columns that preserve the observed *proportions* — do not reverse-engineer exact pixel values or invent breakpoints yet. Get desktop proportions right first, then add stacking rules.

Before coding, state briefly: chosen component per region, any region falling back to plain HTML and why, theme strategy, packages needed, and assumptions you made where the image is ambiguous.

**Start every region from an Ignite UI component.** Fall back to semantic HTML only when the component's DOM structure stays incompatible after CSS overrides and `::part()` are considered, and say so in a comment. Component picks live in [COMPONENTS.md](../igniteui-react-components/reference/COMPONENTS.md); use `list_components({ framework: 'react', filter: '<narrow term>' })` to discover more. Narrow filters work better — `'list view'`, not `'list'`.

Judgement calls that recur:

- `IgrNavbar` for a top bar; plain `<header>` if the design's zones fight the slot structure.
- `IgrNavDrawer` for a sidebar — set open/mini to match fixed, collapsible, or icon-only navigation; plain `<aside>` for a purely static rail.
- `IgrGridLite` or `IgrGrid` **only** when the region is genuinely tabular. Repeated cards or rows with mixed content are `IgrList` or custom markup.
- `IgrChip` for tags and status pills when the chip anatomy matches; otherwise simple custom markup.
- `IgrFinancialChart` for OHLC; `IgrCategoryChart` for ordinary trends; `IgrDataChart` only when you need per-series or per-axis control.

## 2. Inspect the app first

Check `main.tsx`, `index.tsx`, `App.tsx`, `app/layout.tsx`, and shared CSS for theme CSS imports, grid theme imports, and existing palette or semantic-variable overrides. A bare stock theme import is required baseline setup — not evidence of a customized design system.

- **Customized theme already present** → do not generate a global theme or palette unless the user explicitly wants one. Reuse the existing design system, variant, and tokens; go straight to per-component overrides.
- **Stock theme import only** → keep it and add the minimal override layer.
- **No theme import** → add one first (see [igniteui-react-components](../igniteui-react-components/SKILL.md)).

## 3. Packages

Core components ship in `igniteui-react`. Grid Lite additionally needs `igniteui-grid-lite`; advanced grids, charts, maps, and gauges are separate packages that may be scoped `@infragistics/…` in licensed workspaces. Resolve versions against the installed Ignite UI version, install only what the selected components require, and **ask before modifying dependencies**. Charts, gauges, and maps need `.register()`; nothing else does.

## 4. Theme

### Global layer (only when the app has no customized theme)

Read `read_resource({ uri: 'theming://guidance/colors/rules' })` *before* extracting colors, so you know the available slots and the luminance constraints. Resolve the design system from the workspace, the user's request, or the closest visual match — in that order. Then extract only the values you need and generate:

```
create_theme({
  primaryColor: '<from image>',
  secondaryColor: '<from image>',
  surfaceColor: '<from image>',
  variant: 'light' | 'dark',
  designSystem: '<resolved>',
  fontFamily: '<from image or app>',
  platform: 'react'
})
```

Act on any luminance warning returned. Use `create_palette` for a small coherent color system, `create_custom_palette` when the design has several distinct surface depths or accent families that one generated surface cannot express.

### Per-component tokens (always)

For each **core** Ignite UI component in the design, in this order:

1. `get_component_design_tokens({ component })` — read the real token names first.
2. Now look at that region in the image and read a value for each relevant token.
3. `create_component_theme({ component, tokens, selector, platform: 'react' })` with **only** the tokens whose value differs from the global theme.

Querying tokens before reading the image matters: it stops you inventing token names, which is the most common failure here. Apply the generated block with a scoped wrapper plus `igc-*` selectors or `::part()`.

Charts, maps, gauges, and sparklines are **excluded** — they are not `igc-*` elements and have no design tokens. Style them through props (see [gotchas.md](reference/gotchas.md)). Skip regions built from custom HTML too.

Once a palette exists, resolve colors to palette tokens (`var(--ig-primary-500)`) or your own semantic variables rather than leaving hex literals in JSX and CSS. `get_color` resolves a palette token to a concrete value when you need one.

## 5. Implement

- **Layout** — Ignite UI components for standard regions, CSS Grid/Flexbox plus overrides for the composition.
- **Styles** — CSS Modules or shared CSS, not inline styles.
- **Data** — typed mock data matching the design's domain and density. Domain-appropriate content, never `Lorem ipsum` or `Item 1` when the image shows real subject matter.
- Preserve spacing, hierarchy, and data density before adding interactivity.
- Read [gotchas.md](reference/gotchas.md) before writing charts, maps, avatars, grids, or dark surfaces — it lists the props that do not exist and the ones that must be arrays or function references.

## 6. Validate

Build → test → run → compare against the image → fix. Fix TypeScript and runtime errors as they appear rather than at the end.

Compare in this order, coarse to fine: panel proportions, control density, chart shape, legend placement, button prominence, row heights, inter-region spacing. Use `set_size`, `set_spacing`, and `set_roundness` to close density and roundness gaps instead of hand-writing padding.

Only perform the visual check yourself if you can screenshot the running app; otherwise ask the user to compare and report mismatches. Recurring causes of a mismatch: missing chart module registration, chart data too sparse to read as continuous, markers visible when the design has none, a chart collapsed in a flexible grid track, wrong nav drawer mode, a missing theme import, or a section of the image overlooked entirely.
