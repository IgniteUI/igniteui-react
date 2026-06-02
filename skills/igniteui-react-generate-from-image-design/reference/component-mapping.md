# Ignite UI React Component Mapping Reference

## Table of Contents
- [Dashboard & Layout Components](#dashboard--layout-components)
- [Chart Components](#chart-components)
- [Data Display Components](#data-display-components)
- [Form & Input Components](#form--input-components)
- [Calendar & Scheduling Components](#calendar--scheduling-components)
- [Map Components](#map-components)
- [Gauge Components](#gauge-components)
- [Package Requirements](#package-requirements)
- [Import Patterns](#import-patterns)

> **For component API details** (props, events, slots, examples), call `get_doc` with `'react'` and the doc name from `list_components` results. Use `search_api` for specific property lookup.

## Dashboard & Layout Components

| UI Pattern | Ignite UI Component |
|---|---|
| Top navigation bar | `IgrNavbar` |
| Side navigation | `IgrNavDrawer` |
| Content cards/panels | `IgrCard` |
| Tabbed content | `IgrTabs` + `IgrTab` |
| Accordion sections | `IgrAccordion` |
| Split layouts | `IgrSplitter` |
| Tile dashboard | `IgrTileManager` |

Decision rule:

- Use `IgrNavbar` for a top horizontal bar when its slot structure and behavior match the screenshot. Use custom children and CSS flex overrides to achieve multi-zone layouts inside it. Use a plain `<header>` when that is a closer structural fit.
- Use `IgrNavDrawer` for a sidebar or side-navigation panel when drawer structure and behavior match the screenshot. Configure open and mini behavior according to whether the design shows fixed, collapsible, or icon-only navigation. Use a plain `<aside>` when a static custom sidebar matches the screenshot better.
- Use `IgrTabs` for a horizontal tab strip when the screenshot clearly shows tabbed state switching. Use label-only tabs for routed navigation and inline tab content for local view switching.

## Chart Components

| UI Pattern | Ignite UI Component |
|---|---|
| Area chart | `IgrCategoryChart` |
| Line chart | `IgrCategoryChart` |
| Column chart | `IgrCategoryChart` |
| Sparkline (mini chart) | `IgrSparkline` or `IgrDataChart` |
| Pie/donut chart | `IgrPieChart` |
| Financial chart | `IgrFinancialChart` |
| Complex multi-series | `IgrDataChart` |

Decision rule:

- Financial or OHLC screenshot: prefer `IgrFinancialChart`
- Simple or moderate trend panel: prefer `IgrCategoryChart`; move to `IgrDataChart` when you need lower-level per-series control
- Highly custom sparkline or microchart: use the sparkline component from `igniteui-react-charts` or a custom fallback if the built-in anatomy is not a close visual match

## Data Display Components

| UI Pattern | Ignite UI Component |
|---|---|
| Item list | `IgrList` |
| User avatar | `IgrAvatar` |
| Status badge | `IgrBadge` |
| Icons | `IgrIcon` |
| Progress bar | `IgrLinearProgress` |
| Circular progress | `IgrCircularProgress` |
| Flat data grid | `IgrGridLite` or `IgrGrid` |
| Hierarchical/tree data grid | `IgrTreeGrid` |
| Filter/tag chips | `IgrChip` |

Decision rule:

- Use `IgrList` for repeated-row content lists when its row structure and interaction model match the screenshot. The component adds accessible keyboard navigation, item structure, and theming when those benefits fit the design. Use native `<ul>/<li>` or custom containers when they are a closer visual fit.
- Choose `IgrGridLite` or `IgrGrid` only when the image is truly tabular (flat rows and columns, spreadsheet-style).
- Choose `IgrTreeGrid` when rows have parent-child or hierarchical structure.
- Use `IgrChip` when chip anatomy matches the screenshot's status badges, tags, or label pills. Use custom badge or pill markup when a simpler or more exact visual match is needed.

## Form & Input Components

| UI Pattern | Ignite UI Component |
|---|---|
| Text input | `IgrInput` |
| Dropdown select | `IgrSelect` |
| Searchable multi-select | `IgrCombo` |
| Date picker | `IgrDatePicker` |
| Date/time input | `IgrDateTimeInput` |
| Toggle switch | `IgrSwitch` |
| Checkbox | `IgrCheckbox` |
| Radio button group | `IgrRadioGroup` + `IgrRadio` |
| Slider | `IgrSlider` |
| Multi-step wizard | `IgrStepper` |
| Chip filter bar | `IgrChip` collection in a flex wrapper |

## Calendar & Scheduling Components

| UI Pattern | Ignite UI Component |
|---|---|
| Calendar view | `IgrCalendar` |
| Date range picker | `IgrDateRangePicker` |
| Month/year picker | `IgrCalendar` |

## Map Components

| UI Pattern | Ignite UI Component |
|---|---|
| World map | `IgrGeographicMap` |
| Map markers | `IgrGeographicSymbolSeries` |
| Bubble overlay | `IgrGeographicProportionalSymbolSeries` |
| Shape regions | `IgrGeographicShapeSeries` |

## Gauge Components

| UI Pattern | Ignite UI Component |
|---|---|
| Linear gauge | `IgrLinearGauge` |
| Radial gauge | `IgrRadialGauge` |
| Bullet graph | `IgrBulletGraph` |

## Package Requirements

The main `igniteui-react` package contains core UI components (list, avatar, navbar, nav drawer, card, badge, progress, icon, etc.).

Additional component families may require **additional packages** beyond the main React package:

| Capability | Additional packages |
|---|---|
| Grid Lite | `igniteui-react` and `igniteui-grid-lite` |
| Advanced grids | `igniteui-react-grids` or `@infragistics/igniteui-react-grids` |
| Charts / sparklines | `igniteui-react-charts` or `@infragistics/igniteui-react-charts` |
| Maps | `igniteui-react-maps` or `@infragistics/igniteui-react-maps` |
| Gauges / bullet graphs | `igniteui-react-gauges` or `@infragistics/igniteui-react-gauges` |

Install only the packages required by the components you actually selected. Resolve the exact package version against the installed Ignite UI major and the actual published package versions before installing. Charts, maps, and gauges also require module registration in React files.

## Import Patterns

Treat this file as a component selection reference, not as authoritative import guidance for a specific repo. Confirm exact imports from the current workspace, the existing React skills, and `get_doc` results. For styling selectors, target the rendered `igc-*` tag names instead of the React `Igr*` component names.
