---
name: igniteui-react-customize-theme
description: Theme Ignite UI for React with CSS custom properties — brand palette, dark mode, size/spacing/roundness, per-component tokens, and scoped themes, optionally via the igniteui-theming MCP server. Use when applying brand colors, switching light/dark, overriding a component's appearance (grid headers, buttons, avatars), or when theme overrides are not taking effect.
user-invocable: true
---

# Ignite UI for React — Theming

## How the palette actually works

Every palette role (`primary`, `secondary`, `surface`, `gray`, `info`, `success`, `warn`, `error`) exposes shades `50`–`900` plus a `-contrast` variant per shade. **Shades other than `500` are derived from `500` via relative color functions** — the theme CSS defines them as `hsl(from var(--ig-primary-500) h calc(s * …) calc(l * …))`.

So to rebrand, override the `500` shade and everything else follows:

```css
/* src/index.css — imported AFTER the theme CSS */
:root {
  --ig-primary-500: #0d6efd;
  --ig-secondary-500: #ff9800;
}
```

**There are no `--ig-primary-h` / `-s` / `-l` tokens.** Writing them is a silent no-op — a common and hard-to-spot mistake. The same applies to `--ig-surface-h`, `--ig-gray-h`, and every other `-h`/`-s`/`-l` name.

Always reference palette tokens rather than literals in your own CSS: `var(--ig-primary-500)`, `var(--ig-primary-500-contrast)` for text on top of it. `50` is lightest, `900` darkest.

## Order matters

```tsx
// main.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css'; // theme
import 'igniteui-react-grids/grids/themes/light/bootstrap.css'; // grid theme, if using grids
import './index.css'; // your overrides — last
```

Design systems: `bootstrap` (default), `material`, `fluent`, `indigo`; each in `light` and `dark`.

## Global layout knobs

```css
:root {
  --ig-size: 2;          /* 1 small, 2 medium, 3 large */
  --ig-spacing: 1;       /* 0.5 compact … 2 spacious; also -inline / -block variants */
  --ig-radius-factor: 1; /* 0 square … 1 fully rounded */
}
```

All three cascade, so they scope to a subtree or a single element: `igc-button { --ig-size: 1; }`.

## Component-level overrides

Selectors target the **rendered element**, never the React name:

```css
igc-avatar {
  --ig-avatar-background: var(--ig-primary-500);
  --ig-avatar-color: var(--ig-primary-500-contrast);
}

igc-input::part(input) { font-size: 1.1rem; }   /* ::part() reaches shadow DOM internals */
```

**Component token names are per-component and not guessable.** `igc-avatar` has `--ig-avatar-background`, but `igc-button` exposes only typographic tokens (`--ig-button-font-size`, …) and has no `--ig-button-foreground`. Before writing any component token, get the real list: `get_component_design_tokens({ component: 'button' })`, or read the `@cssproperty` annotations in `node_modules/igniteui-webcomponents/components/<name>/*.d.ts`. If a component exposes no token for what you need, use `::part()`.

## Scoping

Palette tokens cascade, so a scoped theme is just custom properties on a container:

```css
.admin { --ig-primary-500: #7c4dff; }
```

## Dark mode

The theme CSS also declares `--ig-theme` and `--ig-theme-variant` on `:root`. Components read those **once, globally**, from `document.documentElement` to pick their shadow-DOM styles. Two consequences:

- **The variant cannot be scoped to a subtree.** Overriding `--ig-theme-variant` on a wrapper does nothing. Dark mode is an app-wide switch.
- **Swapping the stylesheet is not enough at runtime** — the value is cached. Call `configureTheme`, which is re-exported from `igniteui-react`, to update it and notify mounted components:

```tsx
import { configureTheme } from 'igniteui-react';

configureTheme('bootstrap', 'dark'); // design system, variant
```

Prefer a real dark theme file (`themes/dark/bootstrap.css`) over hand-overriding palette tokens: it re-tunes surface, gray, elevations, and every component schema. See [CSS-THEMING.md](./reference/CSS-THEMING.md) for the switching patterns.

When choosing colors for a dark palette, `surface` must be dark (luminance ≤ 0.5) and the `gray` base must be **light**. Gray shades are generated to contrast *against* the surface, so the gray base is always inverted relative to the variant — reversing it produces unreadable text.

## Using the `igniteui-theming` MCP server

Optional but preferred when available — it generates palettes with luminance-safe shades and correct contrast. Verify with `detect_platform`; if missing, add the config below and tell the user to reload the editor. Pass `platform: 'react'`.

| Stage | Tool |
|---|---|
| Brand colors → palette | `create_palette` (`primary`, `secondary`, `surface`, `gray`, `info`, `success`, `warn`, `error`, `variant`) |
| Multiple surface depths or several accent families | `create_custom_palette` |
| Fonts, type scale | `create_typography` |
| Shadow depth | `create_elevations` |
| Full global theme | `create_theme` (`primaryColor`, `secondaryColor`, `surfaceColor`, `variant`, `designSystem`, `fontFamily`) |
| Discover a component's tokens | `get_component_design_tokens` (`component`) |
| Component override block | `create_component_theme` (`component`, `tokens`, `selector`, `variant`, `designSystem`) |
| Resolve a palette color | `get_color` (`color`, `variant`, `contrast`, `opacity`) |
| Size / spacing / roundness | `set_size`, `set_spacing`, `set_roundness` |
| Guidance documents | `read_resource` (`uri`), e.g. `theming://guidance/colors/rules` |

All tools take named arguments. There is no `get_theming_guidance` tool — guidance is read through `read_resource`.

Sequence: `create_palette` → `create_typography` / `create_elevations` → `create_theme` → per component `get_component_design_tokens` → `create_component_theme` with only the tokens that differ from the global theme. Read any luminance warning the tools return instead of ignoring it; if one generated surface color cannot express every depth in the design, use `create_custom_palette` or define your own `--surface-1` / `--surface-2` semantic variables.

**Never overwrite an existing stylesheet.** Propose generated theme code as an edit the user reviews.

VS Code — `.vscode/mcp.json` (Cursor and Claude Desktop use the same entry under `mcpServers`):

```json
{
  "servers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

## Reference

- [CSS-THEMING.md](./reference/CSS-THEMING.md) — scoping patterns, CSS Modules, light/dark switching, inline overrides

## Related skills

- [igniteui-react-components](../igniteui-react-components/SKILL.md) — components, theme CSS setup, slots and events
