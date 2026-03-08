---
name: igniteui-react-customize-theme
description: Customize Ignite UI for React component styling using CSS custom properties, Sass, and the theming system in a React application context
user-invocable: true
---

# Ignite UI for React — Theming Skill

## Description

This skill teaches AI agents how to theme Ignite UI for React applications. Two approaches are supported:

- **CSS custom properties** — works in any project without additional build tooling
- **Sass** — available when the project has Sass configured; provides the full palette/typography/elevation API

The skill also covers component-level theming, layout controls (spacing, sizing, roundness), and how to use the **Ignite UI Theming MCP server** for AI-assisted code generation — all in a React application context.

## Example Usage

- "How do I change the primary color in my Ignite UI React app?"
- "Apply a dark theme to my React app"
- "Customize the grid header colors"
- "How do I scope a theme to a specific section of my React app?"
- "Set up Material Design theming for Ignite UI components"

## Prerequisites

- A React project with `igniteui-react` installed
- A theme CSS file imported in your entry point (see [igniteui-react-use-components](../igniteui-react-use-components/SKILL.md))
- **Optional**: Sass configured in the project (enables the Sass-based theming API)
- **Optional**: The **Ignite UI Theming MCP server** (`igniteui-theming`) for AI-assisted code generation

## Related Skills

- [igniteui-react-choose-components](../igniteui-react-choose-components/SKILL.md) — Choose the right components first
- [igniteui-react-use-components](../igniteui-react-use-components/SKILL.md) — Set up your React project
- [igniteui-react-optimize-bundle-size](../igniteui-react-optimize-bundle-size/SKILL.md) — Optimize after theming

## When to Use

- Applying custom brand colors or a dark theme to an Ignite UI React app
- Overriding individual component styles (e.g., grid header color, button appearance)
- Switching between light and dark mode in a React app
- Scoping different themes to different sections of a React app
- Setting up the Ignite UI Theming MCP server for AI-assisted theming

---

## Theming Architecture

The Ignite UI theming system is built on four pillars:

| Concept | Purpose |
|---|---|
| **Palette** | Color system with primary, secondary, surface, gray, info, success, warn, error families, each with shades 50–900 + accents A100–A700 |
| **Typography** | Font family, type scale (h1–h6, subtitle, body, button, caption, overline) |
| **Elevations** | Box-shadow levels 0–24 for visual depth |
| **Schema** | Per-component recipes mapping palette colors to component tokens |

### Design Systems

Four built-in design systems are available:

- **Material** (default) — Material Design 3
- **Bootstrap** — Bootstrap-inspired
- **Fluent** — Microsoft Fluent Design
- **Indigo** — Infragistics Indigo Design

Each has light and dark variants (e.g., `$light-material-schema`, `$dark-fluent-schema`).

---

## Pre-built Themes

The quickest way to theme an app is to import a pre-built CSS file in your React entry point:

```tsx
// main.tsx or index.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

> **CRITICAL:** Theme CSS imports are **required** for components to render correctly. Without them, components will appear unstyled, with missing icons and broken layouts.

**For grids**, you **must also** import the grid theme CSS:

```tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
```

Available pre-built CSS files:

| Import path | Theme |
|---|---|
| `igniteui-webcomponents/themes/light/bootstrap.css` | Bootstrap Light |
| `igniteui-webcomponents/themes/dark/bootstrap.css` | Bootstrap Dark |
| `igniteui-webcomponents/themes/light/material.css` | Material Light |
| `igniteui-webcomponents/themes/dark/material.css` | Material Dark |
| `igniteui-webcomponents/themes/light/fluent.css` | Fluent Light |
| `igniteui-webcomponents/themes/dark/fluent.css` | Fluent Dark |
| `igniteui-webcomponents/themes/light/indigo.css` | Indigo Light |
| `igniteui-webcomponents/themes/dark/indigo.css` | Indigo Dark |

Grid theme CSS files follow the same pattern under `igniteui-webcomponents-grids/grids/themes/`:

| Import path | Theme |
|---|---|
| `igniteui-webcomponents-grids/grids/themes/light/bootstrap.css` | Grid Bootstrap Light |
| `igniteui-webcomponents-grids/grids/themes/dark/bootstrap.css` | Grid Bootstrap Dark |
| `igniteui-webcomponents-grids/grids/themes/light/material.css` | Grid Material Light |
| `igniteui-webcomponents-grids/grids/themes/dark/material.css` | Grid Material Dark |
| `igniteui-webcomponents-grids/grids/themes/light/fluent.css` | Grid Fluent Light |
| `igniteui-webcomponents-grids/grids/themes/dark/fluent.css` | Grid Fluent Dark |
| `igniteui-webcomponents-grids/grids/themes/light/indigo.css` | Grid Indigo Light |
| `igniteui-webcomponents-grids/grids/themes/dark/indigo.css` | Grid Indigo Dark |

> **Note:** The theme CSS comes from the underlying `igniteui-webcomponents` and `igniteui-webcomponents-grids` packages (dependencies of `igniteui-react` and `igniteui-react-grids`).

### Next.js

In Next.js, import the theme CSS in each client component file that uses Ignite UI components, or in a shared root layout:

```tsx
// app/layout.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Custom Theme via CSS Custom Properties

> No Sass required. Works in any React project after importing a pre-built theme.

After importing a pre-built theme, override individual design tokens with CSS custom properties.

### Global Overrides (in your CSS file)

Create or edit your app's CSS file (e.g., `src/index.css`, `src/App.css`, or a CSS module):

```css
/* src/index.css */
:root {
  --ig-primary-h: 211deg;
  --ig-primary-s: 100%;
  --ig-primary-l: 50%;

  --ig-secondary-h: 33deg;
  --ig-secondary-s: 100%;
  --ig-secondary-l: 50%;
}
```

Then import it in your entry point:

```tsx
// main.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import './index.css'; // Your overrides — must come after the theme import
```

### Scoped Overrides (to a section of your React app)

Use a CSS class to scope theme overrides to a specific container:

```css
/* src/AdminPanel.css */
.admin-panel {
  --ig-primary-h: 260deg;
  --ig-primary-s: 60%;
  --ig-primary-l: 45%;
}
```

```tsx
// AdminPanel.tsx
import './AdminPanel.css';
import { IgrButton, IgrInput } from 'igniteui-react';

function AdminPanel() {
  return (
    <div className="admin-panel">
      <IgrInput label="Admin Search" />
      <IgrButton>Save</IgrButton>
    </div>
  );
}
```

### CSS Modules

You can also use CSS Modules for scoped theming:

```css
/* AdminPanel.module.css */
.panel {
  --ig-primary-h: 260deg;
  --ig-primary-s: 60%;
  --ig-primary-l: 45%;
}
```

```tsx
import styles from './AdminPanel.module.css';
import { IgrButton } from 'igniteui-react';

function AdminPanel() {
  return (
    <div className={styles.panel}>
      <IgrButton>Save</IgrButton>
    </div>
  );
}
```

### Inline Styles on a Wrapper

For truly dynamic one-off overrides, you can apply CSS custom properties via inline styles. **Prefer CSS classes or CSS modules** for better type safety and maintainability — use inline styles only when values need to change at runtime:

```tsx
<div style={{ '--ig-primary-h': '260deg', '--ig-primary-s': '60%', '--ig-primary-l': '45%' } as React.CSSProperties}>
  <IgrButton>Custom Color Button</IgrButton>
</div>
```

> **Note:** TypeScript requires the `as React.CSSProperties` cast because CSS custom properties are not in the standard `CSSProperties` type. This bypasses type safety — prefer CSS classes when possible.

---

## Custom Theme via Sass

> Requires Sass configured in the project (e.g., `sass` in `devDependencies` and Vite/webpack configured to handle `.scss` files).

```scss
// src/styles.scss
@use 'igniteui-theming' as *;

// 1. Define a palette
$my-palette: palette(
  $primary: #1976D2,
  $secondary: #FF9800,
  $surface: #FAFAFA
);

// 2. Apply the palette
@include palette($my-palette);

// 3. Optional: Typography
@include typography($font-family: "'Roboto', sans-serif");

// 4. Optional: Elevations
@include elevations();

// 5. Optional: Spacing
@include spacing();
```

Import in your React entry point:

```tsx
// main.tsx
import './styles.scss';
```

For dark themes, use a dark surface color and a dark schema:

```scss
@use 'igniteui-theming' as *;

$dark-palette: palette(
  $primary: #90CAF9,
  $secondary: #FFB74D,
  $surface: #121212
);

@include palette($dark-palette, $schema: $dark-material-schema);
```

> **Important:** Use `@use 'igniteui-theming'` — this is the correct module for Ignite UI web components and React. Do not use `igniteui-angular/theming` or Angular-specific `core()` / `theme()` mixins.

---

## Component-Level Theming

Override individual component appearance using CSS custom properties.

### CSS Approach

```css
/* Target the Ignite UI web component tag name */
igc-avatar {
  --ig-avatar-background: var(--ig-primary-500);
  --ig-avatar-color: var(--ig-primary-500-contrast);
}

igc-button {
  --ig-button-foreground: var(--ig-secondary-500);
}
```

> **IMPORTANT — No Hardcoded Colors**
>
> Once a palette is applied, **every color reference must use palette tokens** — never hardcode hex/RGB/HSL values.
>
> ✅ **Right:** `--ig-avatar-background: var(--ig-primary-500);`
> ❌ **Wrong:** `--ig-avatar-background: #E91E63;`
>
> Raw hex values are only acceptable in the initial `palette()` seed call.

### Sass Approach

When Sass is configured, use component theme functions and the `tokens` mixin:

```scss
@use 'igniteui-theming' as *;

$custom-avatar: avatar-theme(
  $schema: $light-material-schema,
  $background: var(--ig-primary-500),
  $color: var(--ig-primary-500-contrast)
);

igc-avatar {
  @include tokens($custom-avatar);
}
```

### Discovering Available Tokens

Each component has its own set of themeable CSS custom properties. Use the **Ignite UI Theming MCP server** tool `get_component_design_tokens` to discover them, or consult the component documentation.

### CSS `::part()` Selectors

Since Ignite UI components use shadow DOM, you can use `::part()` selectors to style internal elements that expose a CSS part:

```css
/* Style the internal input part of IgrInput */
igc-input::part(input) {
  font-size: 1.1rem;
}

/* Style the header part of IgrCard */
igc-card::part(header) {
  padding: 1rem;
}
```

> **Note:** In CSS, use the web component tag name (`igc-input`, `igc-card`) even though in JSX you use the React wrapper name (`IgrInput`, `IgrCard`). The CSS targets the underlying web component element in the DOM.

---

## Layout Controls

### Sizing

Controls the size of components via `--ig-size` (values: 1 = small, 2 = medium, 3 = large):

```css
/* Global */
:root { --ig-size: 2; }

/* Component-scoped — target the web component tag */
igc-button { --ig-size: 1; }
```

### Spacing

Controls internal padding via `--ig-spacing` (1 = default, 0.5 = compact, 2 = spacious):

```css
:root { --ig-spacing: 1; }
.compact-section { --ig-spacing: 0.75; }
```

### Roundness

Controls border-radius via `--ig-radius-factor` (0 = square, 1 = maximum radius):

```css
:root { --ig-radius-factor: 1; }
igc-avatar { --ig-radius-factor: 0.5; }
```

---

## Switching Between Light and Dark Themes in React

### Approach 1: CSS class toggle

```tsx
// App.tsx
import { useState } from 'react';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import './theme-overrides.css';

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? 'dark-theme' : ''}>
      <button onClick={() => setIsDark(!isDark)}>Toggle Theme</button>
      {/* Your Ignite UI components here */}
    </div>
  );
}
```

```css
/* theme-overrides.css */
.dark-theme {
  --ig-surface-h: 0deg;
  --ig-surface-s: 0%;
  --ig-surface-l: 7%;

  --ig-gray-h: 0deg;
  --ig-gray-s: 0%;
  --ig-gray-l: 100%;
}
```

### Approach 2: CSS media query

```css
/* Auto-detect system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --ig-surface-h: 0deg;
    --ig-surface-s: 0%;
    --ig-surface-l: 7%;
  }
}
```

### Approach 3: Dynamically swap theme stylesheet

```tsx
import { useEffect } from 'react';

function useTheme(variant: 'light' | 'dark', design = 'bootstrap') {
  useEffect(() => {
    const link = document.getElementById('igc-theme') as HTMLLinkElement;
    if (link) {
      link.href = `node_modules/igniteui-webcomponents/themes/${variant}/${design}.css`;
    }
  }, [variant, design]);
}
```

### Approach 4: Sass with class-based toggle

```scss
@use 'igniteui-theming' as *;

$light-palette: palette($primary: #1976D2, $secondary: #FF9800, $surface: #FAFAFA);
$dark-palette: palette($primary: #90CAF9, $secondary: #FFB74D, $surface: #121212);

@include typography($font-family: "'Roboto', sans-serif");
@include elevations();

// Light is default
@include palette($light-palette, $schema: $light-material-schema);

// Dark via class on a container or <body>
.dark-theme {
  @include palette($dark-palette, $schema: $dark-material-schema);
}
```

---

## Using the Theming MCP Server

The Ignite UI Theming MCP server enables AI assistants to generate production-ready theming code. It must be configured in your editor before the theming tools become available.

> **AGENT INSTRUCTION — MCP Server Setup (REQUIRED)**
>
> Before using any theming tools, you MUST verify the MCP server is available
> by calling `detect_platform`. If the tool is not available or the call fails,
> configure it by following the setup steps below.

### VS Code

Create or edit `.vscode/mcp.json` in your project:

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

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### Claude Desktop

Edit the Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "igniteui-theming": {
      "command": "npx",
      "args": ["-y", "igniteui-theming", "igniteui-theming-mcp"]
    }
  }
}
```

### WebStorm / JetBrains IDEs

1. Go to **Settings → Tools → AI Assistant → MCP Servers**
2. Click **+ Add MCP Server**
3. Set Command to `npx` and Arguments to `igniteui-theming igniteui-theming-mcp`
4. Click OK and restart the AI Assistant

### MCP Server Workflow

1. **Detect platform**: Call `detect_platform` — it will detect `webcomponents` from `package.json`
2. **Generate a theme**: Call `create_theme` with your desired colors and design system
3. **Customize components**: Call `get_component_design_tokens` first, then `create_component_theme` with palette token values
4. **Get color references**: Call `get_color` to get the correct CSS custom property for any palette shade
5. **Adjust layout**: Call `set_size`, `set_spacing`, or `set_roundness`

> **IMPORTANT — File Safety Rule**: When generating theme code, **never overwrite existing style files directly**. Always propose changes as an update and let the user review before writing to disk.

---

## Common Issues & Solutions

### Issue: Theme overrides not taking effect

**Cause:** Override CSS is loaded before the theme CSS.

**Solution:** Make sure your custom CSS is imported *after* the theme:

```tsx
// main.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css'; // Theme first
import './custom-overrides.css'; // Overrides second
```

### Issue: CSS custom properties not recognized by TypeScript in inline styles

**Solution:** Cast to `React.CSSProperties`:

```tsx
<div style={{ '--ig-primary-h': '260deg' } as React.CSSProperties}>
```

### Issue: Component-level CSS selectors don't match

**Cause:** Using React component name instead of web component tag name in CSS.

**Solution:** Use the underlying web component tag name in CSS selectors:

```css
/* ✅ Correct — web component tag */
igc-button { --ig-size: 1; }

/* ❌ Wrong — React wrapper name */
IgrButton { --ig-size: 1; }
```

---

## Best Practices

1. **Import the theme CSS first**, then your custom overrides
2. **Use palette tokens** (`var(--ig-primary-500)`) for all colors — never hardcode hex values after initial palette setup
3. **Use CSS custom properties on `:root`** for global theme adjustments
4. **Scope overrides with CSS classes** to apply different themes to different sections
5. **Use `::part()` selectors** to style shadow DOM internals
6. **In CSS selectors, use web component tag names** (`igc-button`, `igc-input`), not React component names (`IgrButton`, `IgrInput`)
7. **Test both light and dark themes** to make sure your overrides work in both modes
8. **Use the MCP server** for AI-assisted theme generation when available

## Additional Resources

- [Ignite UI for React — Theming Documentation](https://www.infragistics.com/reactsite/components/general-getting-started)
- [igniteui-theming npm package](https://www.npmjs.com/package/igniteui-theming)
- [CSS Custom Properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS ::part() on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)

## Key Rules

1. **Never overwrite existing files directly** — always propose theme code as an update for user review
2. **Always call `detect_platform` first** when using MCP tools
3. **Always call `get_component_design_tokens` before `create_component_theme`** to discover valid token names
4. **Palette shades 50 = lightest, 900 = darkest** for all chromatic colors
5. **Surface color must match the variant** — light color for `light`, dark color for `dark`
6. **Sass**: Use `@use 'igniteui-theming'` — not `igniteui-angular/theming`
7. **Sass**: Component themes use `@include tokens($theme)` inside a selector
8. **Never hardcode colors after palette generation** — use `var(--ig-<family>-<shade>)` palette tokens everywhere
