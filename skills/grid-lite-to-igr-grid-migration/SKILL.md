---
name: grid-lite-to-igr-grid-migration
description: Migrate from Grid Lite (IgrGridLite) to the premium Ignite UI for React Data Grid (IgrGrid) — imports, theme CSS, column and template API changes, sorting and filtering, remote data replacing dataPipelineConfiguration, and the toolbar/export APIs. Use when Grid Lite lacks a needed feature such as editing, selection, paging, grouping, summaries, pinning, or export.
user-invocable: true
---

# Grid Lite → Premium Data Grid

Read the user's current Grid Lite usage first — columns, templates, data binding, `dataPipelineConfiguration` — then confirm APIs with `get_doc({ framework: 'react', name: 'grid-editing' })` or `get_api_reference({ platform: 'react', component: 'IgrGrid' })` rather than from memory. Grid APIs change between versions.

## Is the migration warranted?

Grid Lite has none of these; each is a valid reason to move:

| Feature | `IgrGrid` |
|---|---|
| Cell / row editing | `editable` on the column, `rowEditable` on the grid |
| Batch editing with undo | transaction service |
| Row add / delete | `rowEditable` + `IgrActionStrip` |
| Row / cell / column selection | `rowSelection`, `cellSelection`, `columnSelection` |
| Paging | `IgrPaginator` child |
| Grouping | `groupingExpressions` |
| Summaries | `hasSummary` on the column |
| Column pinning / moving / hiding | `pinned`, `moving`, toolbar actions |
| Master-detail, hierarchical rows | row expansion, `IgrTreeGrid`, `IgrHierarchicalGrid` |
| Excel / CSV export | `IgrGridToolbarExporter` |
| Advanced filtering UI | `filterMode="excelStyleFilter"`, `IgrGridToolbarAdvancedFiltering` |
| State persistence | `IgrGridState` |
| Row drag and drop | `rowDraggable` |

If none applies, staying on Grid Lite is lighter — see [igniteui-react-optimize-bundle-size](../igniteui-react-optimize-bundle-size/SKILL.md).

## Setup

```bash
npm install --save igniteui-react-grids   # or @infragistics/igniteui-react-grids when licensed
```

```tsx
import { IgrGrid, IgrColumn } from 'igniteui-react-grids';
import 'igniteui-react-grids/grids/themes/light/bootstrap.css'; // in addition to the base theme
```

**No registration.** `IgrGridModule.register()` is deprecated and unnecessary — the React wrapper registers the element on import. Do not add it, and delete it if present.

## Minimal port

```tsx
import { useRef, useState } from 'react';
import { IgrGrid, IgrColumn } from 'igniteui-react-grids';
import 'igniteui-react-grids/grids/themes/light/bootstrap.css';

export default function Products({ data }: { data: Product[] }) {
  const grid = useRef<IgrGrid>(null);

  return (
    <IgrGrid ref={grid} data={data} primaryKey="id" autoGenerate={false}
             height="600px" allowFiltering={true}>
      <IgrColumn field="name" header="Name" sortable filterable resizable />
      <IgrColumn field="price" header="Price" dataType="number" sortable />
    </IgrGrid>
  );
}
```

Three additions Grid Lite did not need:

- `primaryKey` — required for editing, selection, and any row-targeted API.
- `height` — required for row virtualization; without it the grid renders no rows.
- `allowFiltering` on the grid **and** `filterable` on each column — the grid-level flag alone shows no UI.

As in Grid Lite, **do not set column `width`** unless the user asked; `IgrColumn` sizes itself and fixed widths leave dead space.

## API renames

| | Grid Lite | `IgrGrid` |
|---|---|---|
| Cell template prop | `cellTemplate` | `bodyTemplate` |
| Cell context type | `IgrCellContext<T>` | `IgrCellTemplateContext` |
| Cell value | `ctx.value` | `ctx.cell.value` (or `ctx.implicit`) |
| Row data | `ctx.row.data` | `ctx.cell.row.data` |
| Header context type | `IgrHeaderContext<T>` | `IgrColumnTemplateContext` |
| Header prop | `headerTemplate` | `headerTemplate` (unchanged) |
| Editor template | — | `inlineEditorTemplate` |
| Sorting expression | `{ key, direction: 'ascending' }` | `{ fieldName, dir: SortingDirection.Asc }` |
| Remote data | `dataPipelineConfiguration` | noop strategies + done events |

```tsx
import { type IgrCellTemplateContext, IgrColumn } from 'igniteui-react-grids';

const status = (ctx: IgrCellTemplateContext) => (
  <span style={{ color: ctx.cell.value === 'Active' ? 'green' : 'red' }}>{ctx.cell.value}</span>
);

<IgrColumn field="status" bodyTemplate={status} />
```

Note the context types are no longer generic over the row type.

## Programmatic sort and filter

```tsx
import { SortingDirection, IgrNumberFilteringOperand } from 'igniteui-react-grids';

grid.current.sort([{ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true }]);
grid.current.clearSort('name');                    // or clearSort() for all

grid.current.filter('age', 21, IgrNumberFilteringOperand.instance().condition('greaterThan'));
grid.current.clearFilter('age');
```

Operands are available per data type: `IgrStringFilteringOperand`, `IgrNumberFilteringOperand`, `IgrBooleanFilteringOperand`, `IgrDateFilteringOperand`, `IgrDateTimeFilteringOperand`, `IgrTimeFilteringOperand`.

## Remote data (replacing `dataPipelineConfiguration`)

Assign noop strategies so the grid stops processing locally, then re-fetch on the done events.

```tsx
import { IgrNoopSortingStrategy, IgrNoopFilteringStrategy } from 'igniteui-react-grids';

useEffect(() => {
  if (!grid.current) return;
  grid.current.sortStrategy = IgrNoopSortingStrategy.instance();
  grid.current.filterStrategy = IgrNoopFilteringStrategy.instance();
}, []);

<IgrGrid ref={grid} data={data} primaryKey="id" height="600px"
         onSortingDone={async () => setData(await api.sort(grid.current!.sortingExpressions))}
         onFilteringDone={async () => setData(await api.filter(grid.current!.filteringExpressionsTree))}>
```

## Toolbar and export

```tsx
<IgrGrid data={data} primaryKey="id" height="600px" onToolbarExporting={onExporting}>
  <IgrGridToolbar>
    <IgrGridToolbarTitle>Products</IgrGridToolbarTitle>
    <IgrGridToolbarActions>
      <IgrGridToolbarHiding />
      <IgrGridToolbarPinning />
      <IgrGridToolbarAdvancedFiltering />
      <IgrGridToolbarExporter exportExcel={true} exportCSV={true} />
    </IgrGridToolbarActions>
  </IgrGridToolbar>
</IgrGrid>
```

```tsx
const onExporting = (e: IgrGridToolbarExportEventArgs) => {
  e.detail.options.fileName = 'products';
  // e.detail.cancel = true to abort
};
```

For programmatic export, `IgrExcelExporterService` / `IgrExcelExporterOptions` and the CSV equivalents come from **`igniteui-react-grids`** — the same package as the grid.

## Other feature snippets

```tsx
<IgrGrid data={data} primaryKey="id" height="600px" rowEditable={true} onRowEditDone={onDone}>
  <IgrColumn field="name" editable={true} />
  <IgrColumn field="price" dataType="number" hasSummary={true} />
</IgrGrid>

<IgrGrid data={data} primaryKey="id" height="600px" rowSelection="multiple">   {/* grid.current.selectedRows */}
  <IgrPaginator perPage={15} />
</IgrGrid>
```

## Cleanup

1. Remove `dataPipelineConfiguration` and any hooks it used.
2. Remove `IgrCellContext` / `IgrHeaderContext` imports from `igniteui-react/grid-lite`.
3. Remove any `IgrGridModule.register()` calls.
4. `npm uninstall igniteui-grid-lite` once no `IgrGridLite` instances remain.
5. Keep the base theme CSS; add the grid theme CSS.

## Related skills

- [igniteui-react-components](../igniteui-react-components/SKILL.md) — the wider grid feature set, events, refs
- [igniteui-react-customize-theme](../igniteui-react-customize-theme/SKILL.md) — grid tokens such as `--ig-grid-header-background`
