# CSS Theming Patterns

Read [../SKILL.md](../SKILL.md) first — it covers the token model (`--ig-primary-500` and derived shades), import order, and why `-h`/`-s`/`-l` tokens do not exist.

## Scoping overrides

Palette tokens are ordinary custom properties, so any of these work. Prefer a class over inline styles.

```css
/* plain class */
.admin-panel { --ig-primary-500: #7c4dff; }
```

```css
/* CSS Modules */
.panel { --ig-primary-500: #7c4dff; }
```

```tsx
import styles from './AdminPanel.module.css';

<div className={styles.panel}>
  <IgrButton>Save</IgrButton>
</div>
```

Inline styles need a cast, since TypeScript's `CSSProperties` does not accept custom property names:

```tsx
<div style={{ '--ig-primary-500': brandColor } as React.CSSProperties}>
  <IgrAvatar />
</div>
```

## Light / dark switching

Both `themes/light/*.css` and `themes/dark/*.css` define their tokens on `:root`, so importing both means the later import wins globally — you cannot scope one to a subtree. Pick one of these instead.

**Static, follow the OS.** No JavaScript, but the variant is fixed at load, so components that read `--ig-theme-variant` see whatever matched first.

```html
<link rel="stylesheet" href="/themes/light/bootstrap.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="/themes/dark/bootstrap.css" media="(prefers-color-scheme: dark)">
```

**Runtime toggle.** Swap the active stylesheet *and* call `configureTheme` so mounted components restyle:

```tsx
import { useEffect, useState } from 'react';
import { configureTheme, type Theme, type ThemeVariant } from 'igniteui-react';

export function useIgTheme(design: Theme = 'bootstrap') {
  const [variant, setVariant] = useState<ThemeVariant>('light');

  useEffect(() => {
    const link = document.getElementById('ig-theme') as HTMLLinkElement | null;
    if (link) link.href = `/themes/${variant}/${design}.css`;
    configureTheme(design, variant);
  }, [variant, design]);

  return [variant, setVariant] as const;
}
```

`Theme` is `'bootstrap' | 'material' | 'fluent' | 'indigo'` and `ThemeVariant` is `'light' | 'dark'`; both are re-exported from `igniteui-react`.

Serve the CSS from your own build output or public directory — do not point a `<link>` at `node_modules`, which is not deployed.

**Partial dark surfaces.** If only one panel must look dark, do not fight the global variant. Define semantic variables for the depths you need and use them in your own CSS, leaving Ignite UI components on the app-wide variant:

```css
.dark-panel {
  --surface-1: var(--ig-gray-900);
  --surface-2: var(--ig-gray-800);
  background: var(--surface-1);
  color: var(--ig-gray-50);
}
```

## Component internals

When a component exposes no custom property for what you need, reach for `::part()`:

```css
igc-input::part(input) { font-size: 1.1rem; }
igc-card::part(header) { padding: 1rem; }
```

Available parts are listed as `@csspart` annotations in `node_modules/igniteui-webcomponents/components/<name>/*.d.ts`. Parts are stable API; descendant selectors into the shadow DOM are not available at all.

## Grid themes

Grids need a second stylesheet alongside the base theme, matched on both variant and design system:

```tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-react-grids/grids/themes/light/bootstrap.css';
```

Grid tokens are prefixed per component, e.g. `--ig-grid-header-background`, `--ig-grid-content-background`, `--ig-grid-row-even-background`. Confirm names with `get_component_design_tokens({ component: 'grid' })` rather than guessing.
