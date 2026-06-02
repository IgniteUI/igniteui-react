# Component Catalogue

## Overview
This reference gives high-level guidance on Ignite UI for React components, their key features, and common use cases. For a full list of components, call `list_components` from `igniteui-cli` with the specific chart, or grid component, or feature you're interested in.

---

## Step-by-Step: Choosing Components for a UI

Follow these steps when a user describes a UI requirement:

### Step 1 — Identify UI patterns

Break the described UI into atomic patterns. Examples:
- "A booking form" → date input, text inputs, button, maybe a calendar picker
- "An admin dashboard" → navbar, nav drawer, cards, data grid, charts
- "A notification center" → snackbar or toast, badge, list
- "A settings page" → tabs or accordion, switch, input, select, button

### Step 2 — Map patterns to components

Call `list_components('react')` to discover available components, optionally filtered by keyword (e.g., `filter: 'date'` for date-related components). When in doubt:

| If the user needs… | Prefer… | Over… |
|---|---|---|
| Simple static list | `IgrList` | Data Grid |
| Basic dropdown | `IgrSelect` | `IgrCombo` |
| Searchable or multi-select dropdown | `IgrCombo` | `IgrSelect` |
| Tabular data with basic display | `IgrGridLite` (grid-lite) | `IgrGrid` (commercial) |
| Tabular data, advanced features needed | `IgrGrid` | `IgrGridLite` (grid-lite) |
| Single dismissible message | `IgrToast` | `IgrSnackbar` |
| Message requiring user action | `IgrSnackbar` | `IgrToast` |
| Collapsible single section | `IgrExpansionPanel` | `IgrAccordion` |
| Multiple collapsible sections | `IgrAccordion` | `IgrExpansionPanel` |
| Stepped wizard UI | `IgrStepper` | `IgrTabs` |
| Content tabs / view switching (inline content) | `IgrTabs` (content in `IgrTab`) | `IgrStepper` |
| Tab-based navigation (with React Router) | `IgrTabs` (label-only) | `IgrTabs` (with content) |

### Step 3 — Check the package

Confirm which package provides the component:

- **MIT components** (inputs, layout, notifications, scheduling, chat) → `igniteui-react`
- **Lightweight grid** (Grid Lite) → `igniteui-react/grid-lite` *(MIT, requires both `igniteui-react` and `igniteui-grid-lite` packages)*
- **Advanced grids** (Data Grid, Tree Grid, Hierarchical Grid, Pivot Grid) → `igniteui-react-grids` *(commercial)*
- **Charts** → `igniteui-react-charts` *(commercial)*
- **Maps** → `igniteui-react-maps` *(commercial)*
- **Gauges** → `igniteui-react-gauges` *(commercial)*

### Step 4 — Look up component documentation

Call `get_doc` with `framework: 'react'` and the doc name from `list_components` results to get full usage documentation, import paths, prop tables, event signatures, and code examples. Use `search_docs` for feature-based questions (e.g., `"date picker range selection"`).

### Step 5 — Provide a starter code snippet

Once components are identified, give the user a minimal working React snippet. Example for an admin dashboard shell:

```tsx
import { IgrNavbar, IgrNavDrawer, IgrNavDrawerItem, IgrCard, IgrCardHeader, IgrCardContent } from 'igniteui-react';
import 'igniteui-webcomponents/themes/light/bootstrap.css';

function Dashboard() {
  return (
    <>
      <IgrNavbar>
        <h1>My Dashboard</h1>
      </IgrNavbar>

      <IgrNavDrawer open>
        <IgrNavDrawerItem>
          <span slot="icon">🏠</span>
          <span slot="content">Home</span>
        </IgrNavDrawerItem>
        <IgrNavDrawerItem>
          <span slot="icon">⚙️</span>
          <span slot="content">Settings</span>
        </IgrNavDrawerItem>
      </IgrNavDrawer>

      <main>
        <IgrCard>
          <IgrCardHeader>
            <h3 slot="title">Summary</h3>
          </IgrCardHeader>
          <IgrCardContent>Dashboard content here</IgrCardContent>
        </IgrCard>
      </main>
    </>
  );
}
```

---

## Common UI Scenarios → Recommended Component Sets

### Login / Authentication Form

- `IgrInput` — email and password fields
- `IgrCheckbox` — "Remember me"
- `IgrButton` — submit
- `IgrSnackbar` — error/success feedback

### User Profile / Settings Page

- `IgrAvatar` — profile picture
- `IgrTabs` — section navigation (Profile, Security, Notifications)
- `IgrInput` / `IgrTextarea` — editable fields
- `IgrSwitch` — feature toggles
- `IgrSelect` — preference dropdowns
- `IgrButton` — save/cancel actions

### Data Table / Admin List View

- `IgrInput` — search bar
- `IgrCombo` — filter dropdowns
- `IgrGridLite` (grid-lite) or `IgrGrid` — tabular data
- `IgrButton` / `IgrIconButton` — actions
- `IgrDialog` — confirm delete modal
- `IgrBadge` — status indicators

### Booking / Reservation Form

- `IgrDateRangePicker` — check-in / check-out
- `IgrInput` — guest details
- `IgrSelect` — room type
- `IgrStepper` — multi-step booking flow
- `IgrButton` — next / confirm
- `IgrToast` — booking confirmation

### Analytics / Reporting Dashboard

- `IgrNavbar` — top bar
- `IgrNavDrawer` — side navigation
- `IgrCard` — KPI summary cards
- `IgrTabs` or `IgrTileManager` — section layout
- `IgrGrid` or `IgrPivotGrid` — detailed data tables
- `IgrCategoryChart` — charts (from `igniteui-react-charts`)
- `IgrLinearProgress` / `IgrCircularProgress` — loading indicators

### Master-Detail with Tab Navigation (React Router)

- `IgrNavbar` — top bar
- `IgrTabs` — **navigation only** (label-only, no inline content); each `IgrTab` triggers a route change
- React Router `<Outlet />` — renders the routed child view below the tabs
- Active tab synced to the current route via `selected` prop

> **⚠️ Important — Tabs for navigation vs. tabs for content:**
> - **Tabs as content panels** (`IgrTabs` with content in `IgrTab`): Content is rendered inside each tab. Use when the tab content is inline and does not require routing.
> - **Tabs as navigation** (`IgrTabs` with label-only tabs): Tabs act as route links. The routing outlet (`<Outlet />`) renders the content. **Do NOT add inline content in `IgrTab` in this case** — use only the `label` prop or `slot="label"`. See [JSX-PATTERNS.md](./JSX-PATTERNS.md) for a full React Router example.

---

## Searching the Documentation

Use MCP tools for up-to-date component discovery and API lookup:

- `list_components('react')` — browse the full component catalogue, optionally narrowed with a filter keyword
- `get_doc('react', '<name>')` — full documentation, prop tables, and code examples for a component
- `search_docs('<query>', 'react')` — full-text search for features or behaviors (e.g., `"date picker range selection"`)
- `search_api('<query>', 'react')` — look up specific classes, properties, or methods
