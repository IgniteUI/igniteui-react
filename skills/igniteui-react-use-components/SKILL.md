---
name: igniteui-react-use-components
description: Install, import, and use Ignite UI for React components — covers JSX patterns, event handling, refs, forms, and TypeScript usage
user-invocable: true
---

# Use Ignite UI for React Components

This skill covers everything you need to install, set up, and use Ignite UI for React components in a React application — including JSX patterns, event handling, refs, controlled/uncontrolled form components, and TypeScript.

## Example Usage

- "How do I install Ignite UI for React?"
- "Set up igniteui-react in my project"
- "How do I handle events on IgrCombo?"
- "How do I use IgrInput with React Hook Form?"
- "Show me how to use refs with IgrDialog"
- "What TypeScript types should I use for IgrButton props?"
- "How do I pass children vs slots to Ignite UI components?"

## Related Skills

- [igniteui-react-choose-components](../igniteui-react-choose-components/SKILL.md) — Pick the right component for your UI
- [igniteui-react-customize-theme](../igniteui-react-customize-theme/SKILL.md) — Theme and style components
- [igniteui-react-optimize-bundle-size](../igniteui-react-optimize-bundle-size/SKILL.md) — Reduce bundle size

## When to Use

- Setting up Ignite UI for React in a new or existing project
- Writing JSX that uses Ignite UI components
- Handling events from Ignite UI components
- Integrating components with React state or form libraries
- Using refs to call imperative methods on components
- Working with TypeScript prop types

---

## Content Guide

This skill is organized into focused sections. Refer to the appropriate file for detailed instructions:

| Topic | File | When to Use |
|---|---|---|
| Installation & Setup | [INSTALLATION.md](./INSTALLATION.md) | Setting up packages, importing theme CSS, Next.js setup |
| JSX Patterns | [JSX-PATTERNS.md](./JSX-PATTERNS.md) | Props, children, slots, IgrTabs content vs navigation |
| Event Handling | [EVENT-HANDLING.md](./EVENT-HANDLING.md) | Event props, CustomEvent types, common events |
| Refs & Forms | [REFS-FORMS.md](./REFS-FORMS.md) | useRef, controlled/uncontrolled forms, React Hook Form |
| Charts, Gauges, Maps & Grid Lite | [CHARTS-GRIDS.md](./CHARTS-GRIDS.md) | Module registration, container sizing |
| Reveal SDK | [REVEAL-SDK.md](./REVEAL-SDK.md) | Embedded BI dashboards, theme sync |
| Troubleshooting | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |

---

## Quick Start

### 1. Install

```bash
npm install igniteui-react
```

### 2. Import Theme CSS (REQUIRED)

```tsx
// main.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

> **CRITICAL:** Without the theme CSS, components will render without styles and icons will be broken.

### 3. Use Components

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';

function App() {
  return (
    <div>
      <IgrInput label="Name" />
      <IgrButton><span>Submit</span></IgrButton>
    </div>
  );
}
```

> **No `defineComponents()` needed.** React wrappers auto-register. See [CHARTS-GRIDS.md](./CHARTS-GRIDS.md) for exceptions (charts, gauges, maps, Grid Lite).

---

## Key Concepts

### Theme CSS Import

- **Always import theme CSS** before using components — see [INSTALLATION.md](./INSTALLATION.md)
- **For grids**, also import `igniteui-webcomponents-grids/grids/themes/...`
- **In Next.js**, import in each client component file or root layout

### JSX Patterns

- Use `slot` attribute for named slots: `<span slot="icon">📊</span>`
- Boolean props: `<IgrInput disabled />` is shorthand for `disabled={true}`
- See [JSX-PATTERNS.md](./JSX-PATTERNS.md)

### IgrTabs: Content vs Navigation

- **Content panels**: Use `IgrTab` + `IgrTabPanel` together
- **Navigation (router)**: Use **only `IgrTab`** — no `IgrTabPanel`
- See [JSX-PATTERNS.md](./JSX-PATTERNS.md)

### Events

- Events are `CustomEvent` objects, not React `SyntheticEvent`
- Access data via `e.target` or `e.detail`
- See [EVENT-HANDLING.md](./EVENT-HANDLING.md)

### Refs

- Use `useRef<HTMLElement>(null)` and cast to access imperative API
- See [REFS-FORMS.md](./REFS-FORMS.md)

### Charts, Gauges, Maps & Grid Lite

- **Require explicit registration**: `IgrCategoryChartModule.register()`, `IgcGridLite.register()`
- **Require sized container**: `min-width`, `min-height`, or `flex-grow`
- **Grid Lite** uses `Igc` prefix (web component, not React wrapper)
- See [CHARTS-GRIDS.md](./CHARTS-GRIDS.md)

---

## Best Practices

1. **Import theme CSS first** — components need it to render correctly
2. **Don't call `defineComponents()`** — React wrappers auto-register
3. **Register chart/gauge/map/Grid Lite modules** — call `.register()` at module level
4. **Wrap charts/gauges/maps/Grid Lite in sized containers** — they need explicit dimensions
5. **Grid Lite uses `Igc` prefix** — `IgcGridLite` from `igniteui-grid-lite`
6. **Use named imports** — enables tree-shaking
7. **Handle events as `CustomEvent`** — not `React.SyntheticEvent`
8. **Use refs sparingly** — prefer declarative props
9. **Prefer controlled components** for forms
10. **Check slot names** in the docs
11. **Tabs for navigation** — do NOT include `IgrTabPanel` when using with router

## Additional Resources

- [Ignite UI for React — Getting Started](https://www.infragistics.com/reactsite/components/general-getting-started)
- [React Examples Repository](https://github.com/IgniteUI/igniteui-react-examples)
- [npm: igniteui-react](https://www.npmjs.com/package/igniteui-react)
- [@lit/react Documentation](https://lit.dev/docs/frameworks/react/)
