# Choosing Components

Ask the MCP server for the authoritative list: `list_components({ framework: 'react', filter: 'date' })`. This file only records the picks that are easy to get wrong.

## Disambiguation

| Requirement | Use | Not |
|---|---|---|
| Static list of rows | `IgrList` | a grid |
| Plain dropdown | `IgrSelect` | `IgrCombo` |
| Searchable or multi-select dropdown | `IgrCombo` | `IgrSelect` |
| Flat tabular data, display only | `IgrGridLite` | `IgrGrid` |
| Editing, selection, paging, grouping, summaries, export | `IgrGrid` | `IgrGridLite` |
| Parent/child rows | `IgrTreeGrid` | `IgrGrid` |
| Auto-dismissing message | `IgrToast` | `IgrSnackbar` |
| Message with an action | `IgrSnackbar` | `IgrToast` |
| One collapsible section | `IgrExpansionPanel` | `IgrAccordion` |
| Several collapsible sections | `IgrAccordion` | `IgrExpansionPanel` |
| Linear wizard with validation per step | `IgrStepper` | `IgrTabs` |
| View switching | `IgrTabs` | `IgrStepper` |

`IgrGridLite` has no editing, selection, paging, grouping, summaries, pinning, or export. If the requirement lists any of those, it is `IgrGrid`.

## Pattern → components

- **Form / login** — `IgrInput`, `IgrCheckbox`, `IgrSelect` + `IgrSelectItem`, `IgrRadioGroup` + `IgrRadio`, `IgrSwitch`, `IgrSlider`, `IgrButton`
- **Dates** — `IgrDatePicker`, `IgrDateRangePicker`, `IgrDateTimeInput`, `IgrCalendar`
- **App shell** — `IgrNavbar`, `IgrNavDrawer` + `IgrNavDrawerItem`, `IgrTabs`, `IgrSplitter`, `IgrTileManager`
- **Cards** — `IgrCard`, `IgrCardHeader`, `IgrCardMedia`, `IgrCardContent`, `IgrCardActions`
- **Status** — `IgrBadge`, `IgrChip`, `IgrAvatar`, `IgrIcon`, `IgrLinearProgress`, `IgrCircularProgress`
- **Overlays** — `IgrDialog`, `IgrToast`, `IgrSnackbar`, `IgrTooltip`, `IgrDropdown`
- **Charts** (`igniteui-react-charts`) — `IgrCategoryChart` (line/area/column), `IgrPieChart`, `IgrFinancialChart`, `IgrSparkline`, `IgrDataChart` for multi-series/multi-axis control
- **Gauges** (`igniteui-react-gauges`) — `IgrLinearGauge`, `IgrRadialGauge`, `IgrBulletGraph`
- **Maps** (`igniteui-react-maps`) — `IgrGeographicMap` plus `IgrGeographicSymbolSeries` / `…ProportionalSymbolSeries` / `…ShapeSeries`
- **AI chat** — `IgrChat` (markdown rendering via `createChatMarkdownRenderer` from `igniteui-react/extras`)

## `IgrTabs`: content vs navigation

These are different, and mixing them is the most common `IgrTabs` bug.

**Content panels** — content lives inside each `IgrTab`:

```tsx
<IgrTabs>
  <IgrTab label="Profile" selected><ProfilePanel /></IgrTab>
  <IgrTab label="Security"><SecurityPanel /></IgrTab>
</IgrTabs>
```

Use a `slot="label"` child instead of the `label` prop when the header needs an icon or custom markup.

**Router navigation** — tabs are label-only; the router renders content *outside* `IgrTabs`. Inline content here renders in addition to the routed view and pushes it off screen.

```tsx
import type { IgrTabComponentEventArgs } from 'igniteui-react';

<IgrTabs onChange={(e: IgrTabComponentEventArgs) => navigate(pathFor(e.detail.label))}>
  {tabs.map(t => (
    <IgrTab key={t.path} label={t.label} selected={location.pathname === t.path} />
  ))}
</IgrTabs>
<Outlet />
```

`IgrTabs`' `onChange` detail is the selected `IgrTab` element itself, so `e.detail.label`, `e.detail.selected`, and `e.detail.disabled` are available.
