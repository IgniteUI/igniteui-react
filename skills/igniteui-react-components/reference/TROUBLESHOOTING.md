# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Components render unstyled, icons show as placeholder boxes | No theme CSS | Import `igniteui-webcomponents/themes/<variant>/<design-system>.css` before use; in Next.js, in `app/layout.tsx` or each `'use client'` file |
| Grid unstyled but other components fine | Grid theme CSS missing — the base theme does not cover grids | Also import `igniteui-react-grids/grids/themes/<variant>/<design-system>.css` |
| Theme overrides do nothing | Override CSS imported before the theme | Import overrides *after* the theme |
| `--ig-primary-h` / `-s` / `-l` overrides do nothing | Those tokens do not exist | Override the shade: `--ig-primary-500: #0d6efd` — other shades derive from it |
| CSS rules never match | Selector uses the React name | Target the element: `igc-button`, not `IgrButton`; `::part()` for internals |
| Chart / gauge / map invisible | Module not registered, or container has no height | `.register()` at module scope; size the container |
| A chart series or axis silently missing | `IgrDataChart` capability module not registered | Register the module for that series/layer type |
| Grid Lite fails to resolve | `igniteui-grid-lite` not installed (optional peer) | `npm install igniteui-grid-lite`; import from `igniteui-react/grid-lite` |
| Grid renders no rows | No `height` on the grid | Set `height` — row virtualization needs it |
| Dead space right of the last column | Explicit `width` on every column | Remove widths, or leave one column without one |
| Event handler gets `undefined` | Reading React `SyntheticEvent` fields | It is a `CustomEvent`; read `e.detail` (or `e.target`) |
| Navigation tabs push routed content off screen | Inline content inside router-driven `IgrTab` | Label-only tabs; render the route outlet outside `IgrTabs` |
| Filter UI never appears | Only `filterable` set | `allowFiltering` on the grid *and* `filterable` on the column |
| `*Module.register()` reported as deprecated | `igniteui-react` / `-grids` / `grid-lite` / `-dockmanager` auto-register | Delete the call — it is only needed for charts, gauges, and maps |
| Child renders in the wrong place | Wrong or misspelled `slot` name | Confirm the name via `get_doc` or the `@slot` annotations in the component `.d.ts` |
