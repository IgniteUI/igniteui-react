# JSX Usage Patterns

## Props vs HTML Attributes

Ignite UI React components accept props just like any React component. Use JSX expression syntax for dynamic values:

```tsx
// ✅ Correct — JSX expression
<IgrInput label="Email" placeholder="you@example.com" type="email" />
<IgrSlider value={50} min={0} max={100} />
<IgrButton disabled={isLoading}>Submit</IgrButton>

// ❌ Wrong — string for numeric/boolean values
<IgrSlider value="50" />
```

## Boolean Props

Pass `true` / `false` explicitly, or use the shorthand (presence = `true`):

```tsx
// These are equivalent:
<IgrInput disabled />
<IgrInput disabled={true} />

// Explicitly false:
<IgrInput disabled={false} />
```

## Children vs Slots

Ignite UI components use the web component **slot** mechanism under the hood. In JSX, pass children to the default slot and use the `slot` attribute to target named slots:

```tsx
<IgrButton>
  {/* Default slot — button label */}
  <span>Click Me</span>
</IgrButton>

<IgrCard>
  <IgrCardHeader>
    <h3 slot="title">Card Title</h3>
    <p slot="subtitle">Card subtitle</p>
  </IgrCardHeader>
  <IgrCardContent>
    <p>Default slot content inside the card body.</p>
  </IgrCardContent>
  <IgrCardActions>
    <IgrButton slot="start">Cancel</IgrButton>
    <IgrButton slot="end">Confirm</IgrButton>
  </IgrCardActions>
</IgrCard>

<IgrNavDrawerItem>
  <span slot="icon">📊</span>
  <span slot="content">Dashboard</span>
</IgrNavDrawerItem>
```

> **Tip:** Check the component documentation for available slot names. Common slots include `start`, `end`, `prefix`, `suffix`, `header`, `content`, `icon`, `title`, `subtitle`.

## Render Props (Grids & Complex Components)

Some components like the Data Grid support **render props** for custom cell rendering:

```tsx
import { IgrDataGrid, IgrColumn } from 'igniteui-react-grids';

function UserGrid({ users }: { users: User[] }) {
  return (
    <IgrDataGrid dataSource={users} autoGenerate={false}>
      <IgrColumn field="name" header="Name" />
      <IgrColumn field="email" header="Email" />
      <IgrColumn
        field="status"
        header="Status"
        bodyTemplate={(ctx) => (
          <IgrBadge>{ctx.cell.value}</IgrBadge>
        )}
      />
    </IgrDataGrid>
  );
}
```

## IgrTabs — Content Panels vs Navigation

`IgrTabs` supports two distinct usage patterns. Choosing the wrong one is a common mistake.

### Pattern 1: Tabs with Content Panels (inline content)

Use `IgrTab` + `IgrTabPanel` when the tabbed content is rendered inline — no routing involved:

```tsx
import { IgrTabs, IgrTab, IgrTabPanel } from 'igniteui-react';

function SettingsPage() {
  return (
    <IgrTabs>
      <IgrTab selected>Profile</IgrTab>
      <IgrTab>Security</IgrTab>
      <IgrTab>Notifications</IgrTab>

      <IgrTabPanel>
        <p>Profile settings content here</p>
      </IgrTabPanel>
      <IgrTabPanel>
        <p>Security settings content here</p>
      </IgrTabPanel>
      <IgrTabPanel>
        <p>Notification preferences content here</p>
      </IgrTabPanel>
    </IgrTabs>
  );
}
```

### Pattern 2: Tabs as Navigation (with React Router — NO `IgrTabPanel`)

> **⚠️ CRITICAL:** When using `IgrTabs` for navigation with React Router (or any router), **do NOT include `IgrTabPanel`**. Adding tab panels creates empty content areas that fill the view and push the routed content out of sight. Only render `IgrTab` elements and let the router's `<Outlet />` handle the content below the tabs.

```tsx
import { IgrTabs, IgrTab } from 'igniteui-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/orders', label: 'Orders' },
  { path: '/customers', label: 'Customers' },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (e: CustomEvent) => {
    const selectedIndex = (e.target as any).selectedIndex;
    if (selectedIndex !== undefined && tabs[selectedIndex]) {
      navigate(tabs[selectedIndex].path);
    }
  };

  return (
    <div>
      {/* Tabs for navigation — NO IgrTabPanel */}
      <IgrTabs onChange={handleTabChange}>
        {tabs.map((tab) => (
          <IgrTab
            key={tab.path}
            selected={location.pathname === tab.path}
          >
            {tab.label}
          </IgrTab>
        ))}
      </IgrTabs>

      {/* Router outlet renders the routed view */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

**Key rules for tabs-as-navigation:**
- ✅ Use only `IgrTab` inside `IgrTabs` — no `IgrTabPanel`
- ✅ Sync the active tab to the current route using the `selected` prop
- ✅ Handle `onChange` to call `navigate()` for route changes
- ✅ Use `<Outlet />` (or the equivalent in your router) for content rendering
- ❌ Do NOT add `IgrTabPanel` — it creates an empty panel body that fills the viewport
