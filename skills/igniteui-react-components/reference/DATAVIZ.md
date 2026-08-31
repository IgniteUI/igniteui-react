# Charts, Gauges, Maps, and Grids

## Two rules cover most failures

**1. Charts, gauges, and maps require module registration.** These live in the older `igniteui-react-charts` / `-gauges` / `-maps` packages, which are not auto-registering wrappers. Call `.register()` once at module scope, outside the component. A missing registration fails silently — the chart, an axis, or a series simply does not appear.

**2. Charts, gauges, maps, and grids size themselves from their parent.** A parent with no resolved height renders them at zero. Give the container real dimensions and let the component fill it.

```css
.viz {
  min-height: 320px;
  flex-grow: 1;
  flex-basis: 0;
}
.viz > * { width: 100%; height: 100%; }
```

Inside a flexible CSS Grid track, also set `min-height: 0` on the cell, or the track refuses to shrink and the chart overflows.

## Registration

```tsx
import { IgrCategoryChart, IgrCategoryChartModule } from 'igniteui-react-charts';

IgrCategoryChartModule.register();   // module scope, once

export default function Trend({ data }: { data: Point[] }) {
  return (
    <div className="viz">
      <IgrCategoryChart dataSource={data} chartType="column" yAxisTitle="Revenue" />
    </div>
  );
}
```

One module per component: `IgrCategoryChartModule`, `IgrPieChartModule`, `IgrFinancialChartModule`, `IgrSparklineModule`, `IgrLinearGaugeModule`, `IgrRadialGaugeModule`, `IgrBulletGraphModule`, `IgrGeographicMapModule`.

`IgrDataChart` is the exception — it needs one module per capability, and each missing one drops a feature silently:

| Module | Provides |
|---|---|
| `IgrDataChartCoreModule` | the chart itself (always) |
| `IgrDataChartCategoryCoreModule` | category axis base (always, with category series) |
| `IgrDataChartCategoryModule` | column, line, area, spline series |
| `IgrDataChartVerticalCategoryModule` | bar series (horizontal) |
| `IgrDataChartInteractivityModule` | hover, selection, highlight layers |
| `IgrDataChartAnnotationModule` | tooltip and callout layers |
| `IgrLegendModule` | `IgrLegend` |

Bar charts are horizontal: categories on `IgrCategoryYAxis`, values on `IgrNumericXAxis` — the reverse of a column chart. The category axis needs its own `dataSource` in addition to the series'. Pass a legend by ref (`<IgrLegend ref={legend} />` rendered before the chart, then `legend={legend.current ?? undefined}`).

Note: `igniteui-react-charts` components are not the `igc-*` wrappers, so their visuals are set through props (`brushes`, `outlines`, `markerTypes`, `xAxisLabelTextColor`, …), not through `--ig-*` design tokens.

## Grid Lite

MIT, needs both `igniteui-react` and `igniteui-grid-lite` installed, imports from `igniteui-react/grid-lite`, and needs no registration.

```tsx
import { IgrGridLite, IgrGridLiteColumn, type IgrCellContext } from 'igniteui-react/grid-lite';

const money = (ctx: IgrCellContext<Order>) => <span>${(ctx.value as number).toFixed(2)}</span>;

<div className="viz">
  <IgrGridLite data={orders} sortingExpressions={sort} onSorted={onSorted}>
    <IgrGridLiteColumn field="id" dataType="number" />
    <IgrGridLiteColumn field="customer" dataType="string" sortable />
    <IgrGridLiteColumn field="total" dataType="number" cellTemplate={money} />
  </IgrGridLite>
</div>
```

- `dataType` is `'string' | 'number' | 'boolean'` and drives sorting and filtering; set it explicitly.
- `cellTemplate` / `headerTemplate` receive `IgrCellContext<T>` / `IgrHeaderContext<T>` — `ctx.value`, `ctx.row.data`, `ctx.row.index`, `ctx.column.field`. Define templates outside the component or memoize them.
- Sorting expressions are `{ key, direction: 'ascending' | 'descending' }`.
- `autoGenerate` defaults to `false`. Set it and pass no column children to derive columns from the data; explicit columns always win.

## Column widths

**Do not set `width` on `IgrGridLiteColumn` or `IgrColumn` unless the user asked for specific widths.** Both are fluid by default (`IgrGridLiteColumn` falls back to `minmax(136px, 1fr)`). Fixed pixel widths pin the layout and leave dead space to the right of the last column. If some columns genuinely need a fixed width, leave at least one without one so it absorbs the remainder.

## Premium grid essentials

`igniteui-react-grids`, no registration, needs its own theme CSS (`igniteui-react-grids/grids/themes/<variant>/<design-system>.css`) on top of the base theme.

- `height` is required for row virtualization; `primaryKey` is required for editing, selection, and row-targeted APIs.
- Cell templates use `bodyTemplate` with `IgrCellTemplateContext` (`ctx.cell.value`, `ctx.cell.row.data`) — not Grid Lite's `cellTemplate`/`ctx.value`.
- Header templates use `headerTemplate` with `IgrColumnTemplateContext` (`ctx.column.header`).
- Filtering needs `allowFiltering` on the grid *and* `filterable` on each column.

For anything beyond this, see [grid-lite-to-igr-grid-migration](../../grid-lite-to-igr-grid-migration/SKILL.md) or `get_doc({ framework: 'react', name: 'grid-editing' })`.
