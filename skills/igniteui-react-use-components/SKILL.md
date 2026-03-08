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

## Step 1 — Installation & Setup

### Install the Package

```bash
# Core UI components (MIT)
npm install igniteui-react

# If you need advanced grids (commercial)
npm install igniteui-react-grids

# If you need charts (commercial)
npm install igniteui-react-charts

# If you need gauges (commercial)
npm install igniteui-react-gauges

# If you need maps (commercial)
npm install igniteui-react-maps
```

### Peer Dependencies

`igniteui-react` requires `react` and `react-dom` (v18+ or v19+). These are typically already in your project:

```bash
npm install react react-dom
```

### Import a Theme (REQUIRED)

> **CRITICAL:** Components will render without styles, with broken icons and missing visuals if the theme CSS is not imported. **Always import the theme CSS before using any Ignite UI component.**

Import one theme CSS file in your entry point (`main.tsx`, `index.tsx`, or `App.tsx`). The theme CSS must be imported **in every file that uses Ignite UI components** if your framework does not have a single global entry point (e.g., Next.js — see below).

```tsx
// main.tsx or index.tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
```

Available themes:

| Import | Theme |
|---|---|
| `igniteui-webcomponents/themes/light/bootstrap.css` | Bootstrap Light |
| `igniteui-webcomponents/themes/dark/bootstrap.css` | Bootstrap Dark |
| `igniteui-webcomponents/themes/light/material.css` | Material Light |
| `igniteui-webcomponents/themes/dark/material.css` | Material Dark |
| `igniteui-webcomponents/themes/light/fluent.css` | Fluent Light |
| `igniteui-webcomponents/themes/dark/fluent.css` | Fluent Dark |
| `igniteui-webcomponents/themes/light/indigo.css` | Indigo Light |
| `igniteui-webcomponents/themes/dark/indigo.css` | Indigo Dark |

**For grids**, you **must also** import the grid theme CSS. Without it, the grid will be missing styles and icons will show as placeholders:

```tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
```

> **Note:** The theme CSS is imported from the underlying `igniteui-webcomponents` and `igniteui-webcomponents-grids` packages (dependencies of `igniteui-react` and `igniteui-react-grids`), not from `igniteui-react` itself.

### Next.js Setup

In Next.js, there is no single `main.tsx` entry point. Import the theme CSS **in each client component file** that uses Ignite UI components, or in a shared layout component:

```tsx
// app/components/DataTable.tsx
'use client';

import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';

import { IgrGrid, IgrColumn, IgrPaginator } from 'igniteui-react-grids';

export default function DataTable({ data }: { data: any[] }) {
  return (
    <IgrGrid dataSource={data} autoGenerate={false}>
      <IgrColumn field="name" header="Name" />
      <IgrColumn field="email" header="Email" />
      <IgrPaginator perPage={10} />
    </IgrGrid>
  );
}
```

Alternatively, import themes once in a root layout:

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

### Minimal App Example (Vite / CRA)

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```tsx
// App.tsx
import { IgrButton, IgrInput } from 'igniteui-react';

function App() {
  return (
    <div>
      <IgrInput label="Name" />
      <IgrButton><span>Submit</span></IgrButton>
    </div>
  );
}

export default App;
```

> **No `defineComponents()` needed.** Unlike the underlying web components library, the React wrappers automatically register the web component when you import and render them. You never need to call `defineComponents()`.

---

## Step 2 — JSX Usage Patterns

### Props vs HTML Attributes

Ignite UI React components accept props just like any React component. Use JSX expression syntax for dynamic values:

```tsx
// ✅ Correct — JSX expression
<IgrInput label="Email" placeholder="you@example.com" type="email" />
<IgrSlider value={50} min={0} max={100} />
<IgrButton disabled={isLoading}>Submit</IgrButton>

// ❌ Wrong — string for numeric/boolean values
<IgrSlider value="50" />
```

### Boolean Props

Pass `true` / `false` explicitly, or use the shorthand (presence = `true`):

```tsx
// These are equivalent:
<IgrInput disabled />
<IgrInput disabled={true} />

// Explicitly false:
<IgrInput disabled={false} />
```

### Children vs Slots

Ignite UI components use the web component **slot** mechanism under the hood. In JSX, pass children to the default slot and use the `slot` attribute to target named slots:

```tsx
<IgrButton>
  {/* Default slot — button label */}
  <span>Click Me</span>
</IgrButton>

<IgrCard>
  <IgrCardHeader>
    <h3 slot="title">Card Title</h3>
    <p slot="subtitle">Card subtitle</p>
  </IgrCardHeader>
  <IgrCardContent>
    <p>Default slot content inside the card body.</p>
  </IgrCardContent>
  <IgrCardActions>
    <IgrButton slot="start">Cancel</IgrButton>
    <IgrButton slot="end">Confirm</IgrButton>
  </IgrCardActions>
</IgrCard>

<IgrNavDrawerItem>
  <span slot="icon">📊</span>
  <span slot="content">Dashboard</span>
</IgrNavDrawerItem>
```

> **Tip:** Check the component documentation for available slot names. Common slots include `start`, `end`, `prefix`, `suffix`, `header`, `content`, `icon`, `title`, `subtitle`.

### Render Props (Grids & Complex Components)

Some components like the Data Grid support **render props** for custom cell rendering:

```tsx
import { IgrDataGrid, IgrColumn } from 'igniteui-react-grids';

function UserGrid({ users }: { users: User[] }) {
  return (
    <IgrDataGrid dataSource={users} autoGenerate={false}>
      <IgrColumn field="name" header="Name" />
      <IgrColumn field="email" header="Email" />
      <IgrColumn
        field="status"
        header="Status"
        bodyTemplate={(ctx) => (
          <IgrBadge>{ctx.cell.value}</IgrBadge>
        )}
      />
    </IgrDataGrid>
  );
}
```

### IgrTabs — Content Panels vs Navigation

`IgrTabs` supports two distinct usage patterns. Choosing the wrong one is a common mistake.

#### Pattern 1: Tabs with Content Panels (inline content)

Use `IgrTab` + `IgrTabPanel` when the tabbed content is rendered inline — no routing involved:

```tsx
import { IgrTabs, IgrTab, IgrTabPanel } from 'igniteui-react';

function SettingsPage() {
  return (
    <IgrTabs>
      <IgrTab panel="profile" selected>Profile</IgrTab>
      <IgrTab panel="security">Security</IgrTab>
      <IgrTab panel="notifications">Notifications</IgrTab>

      <IgrTabPanel id="profile">
        <p>Profile settings content here</p>
      </IgrTabPanel>
      <IgrTabPanel id="security">
        <p>Security settings content here</p>
      </IgrTabPanel>
      <IgrTabPanel id="notifications">
        <p>Notification preferences content here</p>
      </IgrTabPanel>
    </IgrTabs>
  );
}
```

#### Pattern 2: Tabs as Navigation (with React Router — NO `IgrTabPanel`)

> **⚠️ CRITICAL:** When using `IgrTabs` for navigation with React Router (or any router), **do NOT include `IgrTabPanel`**. Adding tab panels creates empty content areas that fill the view and push the routed content out of sight. Only render `IgrTab` elements and let the router's `<Outlet />` handle the content below the tabs.

```tsx
import { IgrTabs, IgrTab } from 'igniteui-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/orders', label: 'Orders' },
  { path: '/customers', label: 'Customers' },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (e: CustomEvent) => {
    const selectedIndex = (e.target as any).selectedIndex;
    if (selectedIndex !== undefined && tabs[selectedIndex]) {
      navigate(tabs[selectedIndex].path);
    }
  };

  return (
    <div>
      {/* Tabs for navigation — NO IgrTabPanel */}
      <IgrTabs onChange={handleTabChange}>
        {tabs.map((tab) => (
          <IgrTab
            key={tab.path}
            selected={location.pathname === tab.path}
          >
            {tab.label}
          </IgrTab>
        ))}
      </IgrTabs>

      {/* Router outlet renders the routed view */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

**Key rules for tabs-as-navigation:**
- ✅ Use only `IgrTab` inside `IgrTabs` — no `IgrTabPanel`
- ✅ Sync the active tab to the current route using the `selected` prop
- ✅ Handle `onChange` to call `navigate()` for route changes
- ✅ Use `<Outlet />` (or the equivalent in your router) for content rendering
- ❌ Do NOT add `IgrTabPanel` — it creates an empty panel body that fills the viewport

---

## Step 3 — Event Handling

### How Events Work

Ignite UI React wrappers map web component custom events to React-style `onXxx` callback props. The event name is converted from the web component event name to a camelCase `on`-prefixed prop.

```tsx
import { IgrButton, IgrInput, IgrCheckbox } from 'igniteui-react';

function MyForm() {
  const handleClick = (event: CustomEvent) => {
    console.log('Button clicked');
  };

  const handleInput = (event: CustomEvent) => {
    // event.target is the underlying web component element (e.g., igc-input)
    console.log('Input value:', (event.target as any).value);
  };

  const handleChange = (event: CustomEvent) => {
    console.log('Checkbox changed:', event.detail);
  };

  return (
    <>
      <IgrButton onClick={handleClick}>
        <span>Submit</span>
      </IgrButton>
      <IgrInput label="Name" onInput={handleInput} />
      <IgrCheckbox onChange={handleChange}>Accept terms</IgrCheckbox>
    </>
  );
}
```

### Common Event Props

| Component | Event Prop | Fires When |
|---|---|---|
| `IgrButton` | `onClick` | Button is clicked |
| `IgrInput` | `onInput` | Value changes (each keystroke) |
| `IgrInput` | `onChange` | Value committed (blur / Enter) |
| `IgrCheckbox` | `onChange` | Checked state changes |
| `IgrSwitch` | `onChange` | Toggle state changes |
| `IgrSelect` | `onChange` | Selection changes |
| `IgrCombo` | `onChange` | Selection changes |
| `IgrSlider` | `onInput` | Slider value changes (live) |
| `IgrSlider` | `onChange` | Slider value committed |
| `IgrDialog` | `onClosing` | Dialog is about to close |
| `IgrDialog` | `onClosed` | Dialog has closed |
| `IgrTabs` | `onChange` | Active tab changes |
| `IgrCalendar` | `onChange` | Selected date changes |
| `IgrDatepicker` | `onChange` | Selected date changes |

### TypeScript Event Types

When using TypeScript, event handlers receive the underlying `CustomEvent`:

```tsx
import { IgrInput } from 'igniteui-react';

function SearchBar() {
  const handleInput = (e: CustomEvent) => {
    const value = (e.target as HTMLInputElement).value;
    console.log('Search:', value);
  };

  return <IgrInput label="Search" onInput={handleInput} />;
}
```

---

## Step 4 — Refs & Imperative API

Use `useRef` to access the underlying web component element and call imperative methods (e.g., showing/hiding a dialog, focusing an input):

```tsx
import { useRef } from 'react';
import { IgrDialog, IgrButton, IgrInput } from 'igniteui-react';

function MyPage() {
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLElement>(null);

  const openDialog = () => {
    // Access the underlying web component and call its methods
    (dialogRef.current as any)?.show();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <IgrButton onClick={openDialog}>
        <span>Open Dialog</span>
      </IgrButton>

      <IgrDialog ref={dialogRef} title="Confirmation">
        <p>Are you sure?</p>
        <IgrButton slot="footer" onClick={() => (dialogRef.current as any)?.hide()}>
          <span>Close</span>
        </IgrButton>
      </IgrDialog>

      <IgrButton onClick={focusInput}>
        <span>Focus Input</span>
      </IgrButton>
      <IgrInput ref={inputRef} label="Name" />
    </>
  );
}
```

> **Tip:** The ref gives you direct access to the web component's DOM element. You can call any method documented in the web component API.

---

## Step 5 — Controlled vs Uncontrolled Components

### Controlled Components with `useState`

Wire up Ignite UI form components with React state for controlled behavior:

```tsx
import { useState } from 'react';
import { IgrInput, IgrCheckbox, IgrSelect, IgrSelectItem } from 'igniteui-react';

function ProfileForm() {
  const [name, setName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [role, setRole] = useState('user');

  return (
    <form>
      <IgrInput
        label="Name"
        value={name}
        onInput={(e: CustomEvent) =>
          setName((e.target as HTMLInputElement).value)
        }
      />

      <IgrCheckbox
        checked={newsletter}
        onChange={(e: CustomEvent) =>
          setNewsletter((e.target as any).checked)
        }
      >
        Subscribe to newsletter
      </IgrCheckbox>

      <IgrSelect
        label="Role"
        value={role}
        onChange={(e: CustomEvent) =>
          setRole((e.detail as any).value)
        }
      >
        <IgrSelectItem value="user">User</IgrSelectItem>
        <IgrSelectItem value="admin">Admin</IgrSelectItem>
        <IgrSelectItem value="editor">Editor</IgrSelectItem>
      </IgrSelect>
    </form>
  );
}
```

### Uncontrolled Components

For simpler scenarios, omit state and read the value on submit:

```tsx
import { useRef } from 'react';
import { IgrInput, IgrButton } from 'igniteui-react';

function SimpleForm() {
  const nameRef = useRef<HTMLElement>(null);

  const handleSubmit = () => {
    const value = (nameRef.current as any)?.value;
    console.log('Name:', value);
  };

  return (
    <form>
      <IgrInput ref={nameRef} label="Name" />
      <IgrButton onClick={handleSubmit}>
        <span>Submit</span>
      </IgrButton>
    </form>
  );
}
```

### React Hook Form Integration

Ignite UI components are form-associated web components. You can integrate them with React Hook Form using `Controller`:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { IgrInput, IgrCheckbox, IgrButton } from 'igniteui-react';

interface FormData {
  email: string;
  acceptTerms: boolean;
}

function SignUpForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Email is required' }}
        render={({ field }) => (
          <IgrInput
            label="Email"
            type="email"
            value={field.value || ''}
            onInput={(e: CustomEvent) =>
              field.onChange((e.target as HTMLInputElement).value)
            }
            onBlur={() => field.onBlur()}
            invalid={!!errors.email}
          />
        )}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <Controller
        name="acceptTerms"
        control={control}
        rules={{ required: 'You must accept the terms' }}
        render={({ field }) => (
          <IgrCheckbox
            checked={field.value || false}
            onChange={(e: CustomEvent) =>
              field.onChange((e.target as any).checked)
            }
          >
            I accept the terms and conditions
          </IgrCheckbox>
        )}
      />

      <IgrButton type="submit">
        <span>Sign Up</span>
      </IgrButton>
    </form>
  );
}
```

---

## Step 6 — TypeScript

### Importing Component Types

Each component exports its props interface. Import and use them for type-safe code:

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';
import type { ComponentProps } from 'react';

// Get the props type for a component
type ButtonProps = ComponentProps<typeof IgrButton>;
type InputProps = ComponentProps<typeof IgrInput>;

// Use in your own components
interface FormFieldProps {
  label: string;
  inputProps?: Partial<InputProps>;
}

function FormField({ label, inputProps }: FormFieldProps) {
  return (
    <div>
      <IgrInput label={label} {...inputProps} />
    </div>
  );
}
```

### Auto-complete

IDEs with TypeScript support will provide auto-complete for all `Igr*` component props. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

---

## Step 7 — Reveal SDK Integration (Embedded BI Dashboards)

Reveal SDK is a companion product for embedding interactive BI dashboards and data visualizations inside your React application. It uses separate packages and requires a backend Reveal server URL.

### Install Reveal SDK

```bash
npm install reveal-sdk-wrappers-react reveal-sdk-wrappers
```

> **Note:** `reveal-sdk-wrappers-react` provides the React component (`RvRevealView`), while `reveal-sdk-wrappers` provides the options and configuration types (`RevealViewOptions`).
>
> The Reveal SDK exposes its API through the `$.ig` global namespace. If TypeScript reports that `$` is not defined, add a declaration at the top of your file:
> ```tsx
> declare const $: any;
> ```

### Basic Usage

```tsx
import { RvRevealView } from 'reveal-sdk-wrappers-react';
import { RevealViewOptions } from 'reveal-sdk-wrappers';

declare const $: any;

function DashboardView() {
  // Set the Reveal SDK backend URL (required)
  $.ig.RevealSdkSettings.setBaseUrl('https://your-reveal-server/reveal-api/');

  const options: RevealViewOptions = {
    visualizations: {
      menu: {
        copy: false,
        duplicate: false
      }
    }
  };

  return <RvRevealView options={options} />;
}
```

### Syncing Reveal Theme with Ignite UI Theme

When using Reveal SDK alongside Ignite UI components, sync the Reveal theme with Ignite UI's CSS custom properties so both share the same visual style. Call `setRevealTheme()` at component initialization:

```tsx
import { RvRevealView } from 'reveal-sdk-wrappers-react';
import { RevealViewOptions } from 'reveal-sdk-wrappers';

declare const $: any;

export default function DashboardView() {
  const options: RevealViewOptions = {
    visualizations: {
      menu: {
        copy: false,
        duplicate: false
      }
    }
  };

  $.ig.RevealSdkSettings.setBaseUrl('https://your-reveal-server/reveal-api/');
  setRevealTheme();

  function setRevealTheme() {
    const style = window.getComputedStyle(document.body);
    const theme = new $.ig.RevealTheme();

    // Sync font with Ignite UI's --ig-font-family token
    theme.regularFont = style.getPropertyValue('--ig-font-family')?.trim() || 'sans-serif';
    theme.mediumFont = theme.regularFont;
    theme.boldFont = theme.regularFont;

    // Auto-detect light/dark mode from the surface color brightness
    const color = style.getPropertyValue('--ig-surface-500').trim() || '#fff';
    const [r, g, b] = [1, 3, 5].map(i => parseInt(color.substring(i, i + 2), 16));
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    theme.isDark = brightness < 128;
    theme.fontColor = theme.isDark ? 'white' : 'black';

    // Sync background colors with Ignite UI palette tokens
    theme.dashboardBackgroundColor = style.getPropertyValue('--ig-gray-100').trim();
    theme.visualizationBackgroundColor = style.getPropertyValue('--ig-surface-500').trim();

    $.ig.RevealSdkSettings.theme = theme;
  }

  return <RvRevealView options={options} />;
}
```

> **Key points:**
> - `--ig-font-family`, `--ig-surface-500`, and `--ig-gray-100` are Ignite UI CSS custom properties set by the active theme
> - The brightness calculation detects whether the current Ignite UI theme is light or dark, and sets Reveal's `isDark` accordingly
> - This ensures Reveal dashboards automatically match the Ignite UI theme — including when switching between light and dark modes

See the [customize-theme skill](../igniteui-react-customize-theme/SKILL.md) for more details on Ignite UI CSS custom properties and theme switching.

---

## Common Issues & Solutions

### Issue: Components render without styles

**Cause:** Missing theme CSS import. Without the theme CSS, components will render with broken layouts, missing icons (showing placeholders), and no visual styling.

**Solution:** Add the theme CSS import **before** any component usage. In Vite/CRA apps, add it to your entry point. In Next.js, add it to each client component file or the root layout:

```tsx
// Always required for core components
import 'igniteui-webcomponents/themes/light/bootstrap.css';

// Also required when using grids (IgrGrid, IgrDataGrid, IgrTreeGrid, etc.)
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
```

**Next.js example:**

```tsx
'use client';

import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';

import { IgrNavbar, IgrButton } from 'igniteui-react';
import { IgrGrid, IgrColumn, IgrPaginator } from 'igniteui-react-grids';
```

### Issue: Grid renders but icons show as placeholders and styles are missing

**Cause:** The grid theme CSS (`igniteui-webcomponents-grids/grids/themes/...`) is not imported. The base theme CSS alone is not enough for grids.

**Solution:** Import **both** theme CSS files:

```tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';           // Base theme
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css'; // Grid theme
```

### Issue: `IgrGrid` from `igniteui-react/grid-lite` is confused with `IgrDataGrid` from `igniteui-react-grids`

**Solution:** These are different components:
- `igniteui-react/grid-lite` → lightweight MIT grid (`IgrGrid`)
- `igniteui-react-grids` → full-featured commercial grids (`IgrDataGrid`, `IgrTreeGrid`, etc.)

Import from the correct package for your needs:

```tsx
// Lightweight grid (MIT)
import { IgrGrid } from 'igniteui-react/grid-lite';

// Full-featured grid (commercial)
import { IgrDataGrid } from 'igniteui-react-grids';
```

### Issue: Events fire but have unexpected shape

**Cause:** Ignite UI events are `CustomEvent` objects from the underlying web component, not React `SyntheticEvent` objects.

**Solution:** Type the handler parameter as `CustomEvent` and access `.detail` for event-specific data or `.target` for the element:

```tsx
const handleChange = (e: CustomEvent) => {
  const target = e.target as HTMLElement;
  const detail = e.detail;
  // Use target or detail as appropriate
};
```

### Issue: Component methods not accessible

**Solution:** Use `useRef` and cast to the underlying web component type:

```tsx
const dialogRef = useRef<HTMLElement>(null);

// Call imperative method
(dialogRef.current as any)?.show();
```

### Issue: IgrTabs used for navigation fills the entire view with an empty panel

**Cause:** `IgrTabPanel` elements were included alongside `IgrTab` elements when using tabs for navigation with React Router. The tab panels create empty content areas that take up space and push the routed content out of view.

**Solution:** When using `IgrTabs` for navigation, use **only `IgrTab`** — do NOT include `IgrTabPanel`. Let the router's `<Outlet />` render the content:

```tsx
// ✅ Correct — navigation tabs without panels
<IgrTabs onChange={handleTabChange}>
  <IgrTab selected={location.pathname === '/dashboard'}>Dashboard</IgrTab>
  <IgrTab selected={location.pathname === '/orders'}>Orders</IgrTab>
</IgrTabs>
<Outlet />

// ❌ Wrong — panels create empty space when used for navigation
<IgrTabs>
  <IgrTab panel="dashboard">Dashboard</IgrTab>
  <IgrTab panel="orders">Orders</IgrTab>
  <IgrTabPanel id="dashboard">...</IgrTabPanel>  {/* Don't do this for navigation */}
  <IgrTabPanel id="orders">...</IgrTabPanel>      {/* Don't do this for navigation */}
</IgrTabs>
```

---

## Best Practices

1. **Always import theme CSS** — components will not render correctly without it. Import `igniteui-webcomponents/themes/...` for core components and additionally `igniteui-webcomponents-grids/grids/themes/...` for grids. In Next.js, import in each client component file or the root layout
2. **Don't call `defineComponents()`** — the React wrappers handle registration automatically
3. **Use named imports** — `import { IgrButton } from 'igniteui-react'` enables tree-shaking
4. **Handle events as `CustomEvent`** — not `React.SyntheticEvent`
5. **Use refs sparingly** — prefer declarative props; use refs only for imperative methods like `show()` / `hide()`
6. **Prefer controlled components** for forms — wire up `value` + `onInput` / `onChange` with `useState`
7. **Check slot names** in the docs — use the `slot` attribute on child elements to target named slots
8. **Tabs for navigation** — when using `IgrTabs` with React Router, do NOT include `IgrTabPanel`. Use only `IgrTab` and render content via `<Outlet />`

## Additional Resources

- [Ignite UI for React — Getting Started](https://www.infragistics.com/reactsite/components/general-getting-started)
- [React Examples Repository](https://github.com/IgniteUI/igniteui-react-examples)
- [npm: igniteui-react](https://www.npmjs.com/package/igniteui-react)
- [@lit/react Documentation](https://lit.dev/docs/frameworks/react/)
