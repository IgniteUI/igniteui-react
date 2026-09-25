# Gotchas When Matching a Design

Props and CSS names that do not exist, or that behave unlike their obvious form. Verified against current packages.

## Props that do not exist

| Written | Reality |
|---|---|
| `plotAreaBackground` on `IgrCategoryChart` | Not a prop. Style the container's background in CSS. |
| `areaFillOpacity` on `IgrSparkline` | Exists on `IgrCategoryChart` / `IgrDataChart` only. |
| `roundShape` on `IgrAvatar` | Use `shape` alone. |
| `--ig-button-foreground` | Button exposes only `--ig-button-font-*`. Use `::part()` or the tokens `get_component_design_tokens({ component: 'button' })` returns. |
| `--ig-primary-h` / `-s` / `-l` | No such tokens. Override the shade: `--ig-primary-500`. |

## Chart props

**Array props need array expressions**, not comma-joined strings:

```tsx
<IgrCategoryChart includedProperties={['revenue', 'cost']} />
```

**`markerTypes` takes documented marker-type values** (an `IgrMarkerTypeCollection`), not lowercase string arrays. Category charts show a marker at every point by default — if the design shows a bare line or area, you must turn markers off explicitly.

**Function-valued props take a reference**, not a call: `xAxisFormatLabel={labelFormatter}`.

**Smooth, continuous area charts** come from data density first: add points until the shape reads continuous at the rendered size, hide markers, then tune fill opacity and label density. Apply smoothing only if the design itself looks smoothed rather than point-to-point.

**Charts collapse inside a flexible CSS Grid track.** Set `min-height: 0` on the cell and make the chart fill it:

```css
.chart-panel { min-height: 0; }
.chart-panel > * { width: 100%; height: 100%; }
```

Charts, gauges, and maps also need `.register()` at module scope. Grid Lite and the `igc-*`-based components do not.

## Styling DV components

Charts, maps, gauges, and sparklines are not `igc-*` elements — they have **no design tokens and no `::part()`**. Set their appearance through props, resolving values to palette tokens or semantic variables rather than raw hex:

```tsx
<IgrCategoryChart
  brushes={seriesBrushes}
  outlines={seriesOutlines}
  xAxisLabelTextColor="var(--ig-gray-600)"
  yAxisMajorStroke="var(--ig-gray-200)"
/>
```

## Component specifics

**CSS targets the rendered element.** `igc-card::part(header)`, never `IgrCard`.

**Nav drawer width** comes from two custom properties, both measurable from the image:

```css
igc-nav-drawer {
  --menu-full-width: 15rem;
  --menu-mini-width: 5.5rem;
}
```

**Avatar background** is a custom property, so set it on a wrapper for per-instance colors:

```tsx
<div style={{ '--ig-avatar-background': color } as React.CSSProperties}>
  <IgrAvatar initials="KD" />
</div>
```

**Grid columns are fluid — do not add `width`.** Both `IgrGridLiteColumn` and `IgrColumn` size themselves; fixed widths leave dead space right of the last column. If some column truly needs a fixed width, leave at least one without one.

**Router-driven tabs are label-only.** Inline content inside a routed `IgrTab` renders in addition to the routed view and pushes it off screen. Keep the outlet outside `IgrTabs`.

## Theming

**Theme CSS imports are required** — the base theme for core components, plus the grid theme for grids. Do not remove or swap them unless the user wants a variant change.

**Dark mode is global.** Components read `--ig-theme-variant` once from `:root`, so a dark wrapper class cannot make Ignite UI components dark. For one dark panel in a light app, define your own `--surface-1` / `--surface-2` semantic variables and style your own markup; do not swap the app's theme import. To switch the whole app at runtime, call `configureTheme(design, variant)` from `igniteui-react` in addition to swapping the stylesheet.

**Multiple dark surface depths** rarely come from one generated surface color. Define the depths you need as semantic variables in shared CSS, and read any luminance warning `create_theme` returns instead of ignoring it.

## Maps

Series often have to be added programmatically once the ref exists:

```tsx
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;
  const series = new IgrGeographicSymbolSeries();
  series.dataSource = locations;
  series.latitudeMemberPath = 'lat';
  series.longitudeMemberPath = 'lon';
  map.series.add(series);
  map.zoomToGeographic({ left, top, width, height });
}, []);
```

OpenStreetMap tiles are light. For a dark design, filter the container and tune the values to match the image's map tone:

```css
.map-container { filter: grayscale(0.9) brightness(0.6); }
```
