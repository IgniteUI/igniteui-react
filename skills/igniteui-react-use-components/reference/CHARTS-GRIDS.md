# Charts, Gauges, Maps & Grid Lite

## Module Registration

> **⚠️ IMPORTANT:** Unlike core UI components (from `igniteui-react`), chart, gauge, and map components from `igniteui-react-charts`, `igniteui-react-gauges`, and `igniteui-react-maps` **require explicit module registration** before use. You must import the corresponding `*Module` class and call `.register()` at the module level (outside the component function).
>
> **Grid Lite** (`IgcGridLite` from `igniteui-grid-lite`) is a **web component** — not a React wrapper. It also requires `IgcGridLite.register()` and a sized container.

### Registration Syntax

```tsx
import { IgrCategoryChart, IgrCategoryChartModule } from 'igniteui-react-charts';

// ⚠️ REQUIRED — register the module before using the component
IgrCategoryChartModule.register();
```

### Common Module Registrations

| Component | Module Import | Registration |
|---|---|---|
| `IgrCategoryChart` | `IgrCategoryChartModule` | `IgrCategoryChartModule.register()` |
| `IgrPieChart` | `IgrPieChartModule` | `IgrPieChartModule.register()` |
| `IgrFinancialChart` | `IgrFinancialChartModule` | `IgrFinancialChartModule.register()` |
| `IgrRadialGauge` | `IgrRadialGaugeModule` | `IgrRadialGaugeModule.register()` |
| `IgrLinearGauge` | `IgrLinearGaugeModule` | `IgrLinearGaugeModule.register()` |
| `IgrGeographicMap` | `IgrGeographicMapModule` | `IgrGeographicMapModule.register()` |
| `IgcGridLite` | (self-registering) | `IgcGridLite.register()` |

## Container Sizing (REQUIRED)

> **⚠️ CRITICAL:** Charts, gauges, maps, and Grid Lite **require an explicit-sized container** to render. They inherit their dimensions from the parent element — if the parent has no height/width, the component will not be visible. Always wrap these components in a container with explicit `min-width`, `min-height`, or `flex-grow` styling.

```css
/* Chart container CSS */
.chart-container {
  min-width: 400px;
  min-height: 300px;
  flex-grow: 1;
  flex-basis: 0;
}

/* Ensure the chart fills its container */
.chart-container > * {
  height: 100%;
  width: 100%;
}
```

## Complete Chart Example

```tsx
import { IgrCategoryChart, IgrCategoryChartModule } from 'igniteui-react-charts';
import styles from './dashboard-view.module.css';

// Register the chart module (required, called once at module level)
IgrCategoryChartModule.register();

export default function DashboardView() {
  const salesData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 18200 },
    { month: 'Mar', revenue: 15800 },
  ];

  return (
    <div className={styles['chart-container']}>
      <IgrCategoryChart
        dataSource={salesData}
        chartType="column"
        xAxisTitle="Month"
        yAxisTitle="Revenue ($)"
      />
    </div>
  );
}
```

```css
/* dashboard-view.module.css */
.chart-container {
  min-width: 400px;
  min-height: 300px;
  flex-grow: 1;
  flex-basis: 0;
}
.chart-container > * {
  height: 100%;
  width: 100%;
}
```

> **Note:** Core UI components from `igniteui-react` (e.g., `IgrButton`, `IgrInput`) do NOT require module registration — they auto-register when imported. Charts, gauges, maps, and Grid Lite all need explicit `.register()` calls.

## Complete Grid Lite Example

> **⚠️ IMPORTANT:** Grid Lite (`IgcGridLite`) is a **web component** from `igniteui-grid-lite` — it uses the `Igc` prefix (not `Igr`). It requires `IgcGridLite.register()` and a sized container.

```tsx
import { IgcGridLite } from 'igniteui-grid-lite';
import { useGetCustomers } from '../hooks/northwind-hooks';
import styles from './master-view.module.css';

// ⚠️ REQUIRED — register the web component before use
IgcGridLite.register();

export default function MasterView() {
  const { northwindCustomers } = useGetCustomers();

  return (
    <div className={styles['grid-lite']}>
      <IgcGridLite data={northwindCustomers} />
    </div>
  );
}
```

```css
/* master-view.module.css */
.grid-lite {
  min-width: 400px;
  min-height: 220px;
  flex-grow: 1;
  flex-basis: 0;
}
```
