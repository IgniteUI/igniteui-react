# Troubleshooting

## Issue: Components render without styles

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

## Issue: Grid renders but icons show as placeholders and styles are missing

**Cause:** The grid theme CSS (`igniteui-webcomponents-grids/grids/themes/...`) is not imported. The base theme CSS alone is not enough for grids.

**Solution:** Import **both** theme CSS files:

```tsx
import 'igniteui-webcomponents/themes/light/bootstrap.css';           // Base theme
import 'igniteui-webcomponents-grids/grids/themes/light/bootstrap.css'; // Grid theme
```

## Issue: Grid Lite does not render or compilation error

**Cause:** Grid Lite (`IgcGridLite`) is a **web component** from `igniteui-grid-lite` — not a React wrapper from `igniteui-react`. It uses the `Igc` prefix and requires explicit registration.

**Solution:**

1. Install the correct package: `npm install igniteui-grid-lite`
2. Import `IgcGridLite` from `igniteui-grid-lite` (not from `igniteui-react`)
3. Call `IgcGridLite.register()` at module level
4. Wrap in a sized container

```tsx
import { IgcGridLite } from 'igniteui-grid-lite';

IgcGridLite.register();

// Use in JSX with a sized container:
<div className={styles['grid-lite']}>
  <IgcGridLite data={data} />
</div>
```

```css
.grid-lite {
  min-width: 400px;
  min-height: 220px;
  flex-grow: 1;
  flex-basis: 0;
}
```

## Issue: `IgcGridLite` from `igniteui-grid-lite` is confused with `IgrDataGrid` from `igniteui-react-grids`

**Solution:** These are different components:
- `igniteui-grid-lite` → lightweight MIT grid (`IgcGridLite`, web component — requires `.register()`)
- `igniteui-react-grids` → full-featured commercial grids (`IgrDataGrid`, `IgrTreeGrid`, etc. — React wrappers)

Import from the correct package for your needs:

```tsx
// Lightweight grid (MIT, web component)
import { IgcGridLite } from 'igniteui-grid-lite';
IgcGridLite.register();

// Full-featured grid (commercial, React wrapper)
import { IgrDataGrid } from 'igniteui-react-grids';
```

## Issue: Events fire but have unexpected shape

**Cause:** Ignite UI events are `CustomEvent` objects from the underlying web component, not React `SyntheticEvent` objects.

**Solution:** Type the handler parameter as `CustomEvent` and access `.detail` for event-specific data or `.target` for the element:

```tsx
const handleChange = (e: CustomEvent) => {
  const target = e.target as HTMLElement;
  const detail = e.detail;
  // Use target or detail as appropriate
};
```

## Issue: Component methods not accessible

**Solution:** Use `useRef` and cast to the underlying web component type:

```tsx
const dialogRef = useRef<HTMLElement>(null);

// Call imperative method
(dialogRef.current as any)?.show();
```

## Issue: Chart / gauge / map does not render or is invisible

**Cause:** Two common causes:
1. The corresponding module was not registered (e.g., `IgrCategoryChartModule.register()` was not called)
2. The parent container has no explicit dimensions — these components inherit size from their container and will be invisible if the container has zero height/width

**Solution:**

1. **Register the module** at the top level of the file (outside the component):

```tsx
import { IgrCategoryChart, IgrCategoryChartModule } from 'igniteui-react-charts';
IgrCategoryChartModule.register();
```

2. **Wrap the chart in a sized container** with explicit dimensions:

```css
.chart-container {
  min-width: 400px;
  min-height: 300px;
  flex-grow: 1;
  flex-basis: 0;
}
.chart-container > * { height: 100%; width: 100%; }
```

```tsx
<div className={styles['chart-container']}>
  <IgrCategoryChart dataSource={data} />
</div>
```

## Issue: IgrTabs used for navigation fills the entire view with an empty panel

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
