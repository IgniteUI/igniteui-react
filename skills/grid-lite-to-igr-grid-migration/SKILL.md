---
name: grid-lite-to-igr-grid-migration
description: Step-by-step migration guide from Grid Lite (IgrGridLite) to the premium Ignite UI for React Data Grid (IgrGrid), covering every import, registration, component name, property, event, template, sorting, filtering, and toolbar API change.
user-invocable: true
---

# Ignite UI for React — Grid Lite → Premium Data Grid Migration

## MANDATORY AGENT PROTOCOL

> **DO NOT write any code from memory.** Grid APIs change between versions.

Before producing migration code:

1. **Read the user's existing component files** to understand current Grid Lite usage (columns, templates, data binding, `dataPipelineConfiguration`).
2. **Use the MCP server** — call `get_doc` or `search_docs` with `framework: "react"` to confirm API details when in doubt.
3. **Only then produce output** — base all code on verified references, not memory.

---

## When to Migrate from Grid Lite to Premium Grid

Migrate when you need any of the following features (not available in Grid Lite):

| Feature | Grid Lite | Premium Grid (`IgrGrid`) |
|---|---|---|
| Cell editing | ✗ | ✓ `editable`, `rowEditable` |
| Batch editing (with undo) | ✗ | ✓ Transaction service |
| Row adding / deleting | ✗ | ✓ `rowEditable` + `IgrActionStrip` |
| Row selection | ✗ | ✓ `rowSelection="single|multiple"` |
| Cell selection | ✗ | ✓ `cellSelection` |
| Column selection | ✗ | ✓ `columnSelection` |
| Paging | ✗ | ✓ `IgrPaginator` child |
| GroupBy | ✗ | ✓ `groupingExpressions` |
| Column summaries | ✗ | ✓ `hasSummary` on `IgrColumn` |
| Column pinning | ✗ | ✓ `pinned` on `IgrColumn` |
| Column moving | ✗ | ✓ `moving={true}` on grid |
| Master-detail rows | ✗ | ✓ `IgrGrid` row expansion |
| Excel / CSV export (toolbar) | ✗ | ✓ `IgrGridToolbarExporter` |
| Column hiding toolbar | ✗ | ✓ `IgrGridToolbarHiding` |
| Column pinning toolbar | ✗ | ✓ `IgrGridToolbarPinning` |
| Advanced filtering UI | ✗ | ✓ `filterMode="excelStyleFilter"` / `IgrGridToolbarAdvancedFiltering` |
| State persistence | ✗ | ✓ `IgrGridState` directive |
| Clipboard operations | ✗ | ✓ `clipboardOptions` |
| Action strip | ✗ | ✓ `IgrActionStrip` |
| Row drag and drop | ✗ | ✓ `rowDraggable={true}` |

---

## Setup

```bash
npm install --save igniteui-react-grids
# licensed: npm install --save @infragistics/igniteui-react-grids
```

```tsx
import { IgrGridModule, IgrGrid, IgrColumn, IgrPaginator,
         IgrCellTemplateContext, IgrColumnTemplateContext } from "igniteui-react-grids";
import "igniteui-react-grids/grids/themes/light/bootstrap.css";

// Required once before render — Grid Lite has no equivalent
IgrGridModule.register();
```

> Use `@infragistics/igniteui-react-grids` and the matching CSS path for the licensed package.
> Check `package.json` — `igniteui-grid-lite` may be a standalone dependency alongside `igniteui-react`.

---

## Minimal Migration Example

```tsx
import { useRef, useState } from "react";
import { IgrGrid, IgrColumn, IgrGridModule } from "igniteui-react-grids";
import "igniteui-react-grids/grids/themes/light/bootstrap.css";
IgrGridModule.register();

export default function MyView() {
  const gridRef = useRef<IgrGrid>(null);
  const [data] = useState<Product[]>([]);

  return (
    <IgrGrid ref={gridRef} data={data} primaryKey="id" autoGenerate={false}
             height="600px" allowFiltering={true}>
      <IgrColumn field="name" header="Name" sortable={true} filterable={true} resizable={true} />
      <IgrColumn field="price" header="Price" dataType="number" sortable={true} />
    </IgrGrid>
  );
}
```

**Key additions vs Grid Lite:**
- `primaryKey` — required for editing, selection, row-targeted APIs
- `height` — required for row virtualization
- `allowFiltering={true}` on the grid — required for filter UI; `filterable={true}` on the column opts that column in

---

## Cell Templates

Prop renamed: `cellTemplate` → `bodyTemplate`. Context type changes.

```tsx
import { IgrCellTemplateContext } from "igniteui-react-grids";

const statusCell = (ctx: IgrCellTemplateContext) => (
  <span style={{ color: ctx.cell.value === "Active" ? "green" : "red" }}>
    {ctx.cell.value}
  </span>
);

<IgrColumn field="status" bodyTemplate={statusCell} />
```

| | Grid Lite | Premium Grid |
|---|---|---|
| Prop | `cellTemplate` | `bodyTemplate` |
| Value | `ctx.value` | `ctx.cell.value` or `ctx.implicit` |
| Row data | `ctx.row.data` | `ctx.cell.row.data` |
| Edit template | — | `inlineEditorTemplate` |

---

## Header Templates

Prop name unchanged (`headerTemplate`); context type changes to `IgrColumnTemplateContext` from `igniteui-react-grids`.

```tsx
import { IgrColumnTemplateContext } from "igniteui-react-grids";

const priceHeader = (ctx: IgrColumnTemplateContext) => (
  <strong>{ctx.column.header}</strong>
);

<IgrColumn field="price" headerTemplate={priceHeader} />
```

---

## Remote Data (replaces `dataPipelineConfiguration`)

For server-side operations, disable local sort/filter processing first by assigning noop strategies, then listen to the done events to issue new requests.

```tsx
import { IgrGrid, IgrGridModule,
         IgrNoopSortingStrategy, IgrNoopFilteringStrategy } from "igniteui-react-grids";

// Disable built-in sort/filter so the grid does not process data locally.
// Set these once after the grid mounts (e.g., in a useEffect or ref callback).
useEffect(() => {
  if (!gridRef.current) return;
  gridRef.current.sortStrategy = IgrNoopSortingStrategy.instance();
  gridRef.current.filterStrategy = IgrNoopFilteringStrategy.instance();
}, []);
```

```tsx
const handleSortingDone = async () => {
  if (!gridRef.current) return;
  setData(await dataService.sort(gridRef.current.sortingExpressions));
};
const handleFilteringDone = async () => {
  if (!gridRef.current) return;
  setData(await dataService.filter(gridRef.current.filteringExpressionsTree));
};

<IgrGrid ref={gridRef} data={data} primaryKey="id" height="600px"
         onSortingDone={handleSortingDone} onFilteringDone={handleFilteringDone}>
  {/* columns */}
</IgrGrid>
```

---

## Programmatic Sort / Filter

```tsx
import { SortingDirection, IgrNumberFilteringOperand } from "igniteui-react-grids";

// fieldName + SortingDirection enum (not key + string)
gridRef.current.sort([{ fieldName: 'name', dir: SortingDirection.Asc, ignoreCase: true }]);
gridRef.current.clearSort('name');      // or clearSort() for all

// Positional args with operand
// Note: verify IgrNumberFilteringOperand.instance() is available in your version
gridRef.current.filter('age', 21, IgrNumberFilteringOperand.instance().condition('greaterThan'));
gridRef.current.clearFilter('age');     // or clearFilter() for all
```

---

## Common Enterprise Features

### Editing

```tsx
<IgrGrid data={data} primaryKey="id" rowEditable={true} onRowEditDone={handleRowEditDone} height="600px">
  <IgrColumn field="name" editable={true} />
</IgrGrid>
```

### Row Selection

```tsx
<IgrGrid data={data} primaryKey="id" rowSelection="multiple" height="600px">
  {/* columns */}
</IgrGrid>
// Read: gridRef.current.selectedRows
```

### Paging

```tsx
<IgrGrid data={data} primaryKey="id" height="600px">
  <IgrPaginator perPage={15} />
</IgrGrid>
```

### Summaries

```tsx
<IgrColumn field="price" dataType="number" hasSummary={true} />
```

### Toolbar + Export

> **Note:** `IgrExcelExporterService` / `IgrExcelExporterOptions` (programmatic export) must be imported from `"igniteui-react"`, **not** `"igniteui-react-grids"`. The toolbar approach below does not need them.

```tsx
import { IgrGrid, IgrColumn, IgrGridToolbar, IgrGridToolbarTitle,
         IgrGridToolbarActions, IgrGridToolbarHiding, IgrGridToolbarPinning,
         IgrGridToolbarExporter, IgrGridToolbarAdvancedFiltering,
         IgrGridToolbarExportEventArgs, IgrGridModule } from "igniteui-react-grids";
IgrGridModule.register();

<IgrGrid data={data} primaryKey="id" height="600px" onToolbarExporting={handleExporting}>
  <IgrGridToolbar>
    <IgrGridToolbarTitle>Products</IgrGridToolbarTitle>
    <IgrGridToolbarActions>
      <IgrGridToolbarHiding />
      <IgrGridToolbarPinning />
      <IgrGridToolbarAdvancedFiltering />
      <IgrGridToolbarExporter exportExcel={true} exportCSV={true} />
    </IgrGridToolbarActions>
  </IgrGridToolbar>
  {/* columns */}
</IgrGrid>
```

```tsx
const handleExporting = (e: IgrGridToolbarExportEventArgs) => {
  e.detail.options.fileName = "MyExport";
  // set e.detail.cancel = true to abort
};
```

---

## Cleanup After Migration

1. Remove all `dataPipelineConfiguration` usage — replace with events (see Remote Data).
2. Remove `IgrCellContext` / `IgrHeaderContext` imports from `igniteui-react/grid-lite`.
3. Uninstall `igniteui-grid-lite` if no Grid Lite instances remain: `npm uninstall igniteui-grid-lite`.

---

## Related Skills

- [igniteui-react-components](../igniteui-react-components/SKILL.md) — Identify the right `Igr*` components, install, import, and use them; covers JSX patterns, events, refs, and forms. Use this after migrating to explore the full premium grid feature set.
- [igniteui-react-customize-theme](../igniteui-react-customize-theme/SKILL.md) — Customize `IgrGrid` styling using CSS custom properties and the Ignite UI theming system.
- [igniteui-react-optimize-bundle-size](../igniteui-react-optimize-bundle-size/SKILL.md) — Reduce bundle size after migrating to `igniteui-react-grids` with granular imports, tree-shaking, and lazy loading.
- [igniteui-react-generate-from-image-design](../igniteui-react-generate-from-image-design/SKILL.md) — Build a full React view from a screenshot or mockup using Ignite UI components and MCP-driven theming.

