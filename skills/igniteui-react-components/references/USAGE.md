# Writing `Igr*` JSX

## Props and slots

Props behave like any React component — pass expressions, not strings, for numbers and booleans (`<IgrSlider value={50} />`, not `value="50"`).

Children go to the default slot; named slots use the `slot` attribute on the child:

```tsx
<IgrCard>
  <IgrCardHeader>
    <IgrIcon slot="thumbnail" name="home" collection="material" />
    <h3 slot="title">Title</h3>
    <p slot="subtitle">Subtitle</p>
  </IgrCardHeader>
  <IgrCardContent>Body</IgrCardContent>
  <IgrCardActions>
    <IgrButton slot="start">Cancel</IgrButton>
    <IgrButton slot="end">Confirm</IgrButton>
  </IgrCardActions>
</IgrCard>
```

Slot names are per-component (`start`, `end`, `prefix`, `suffix`, `helper-text`, `title`, `subtitle`, `thumbnail`, `label`, `icon`, `content`, …). Confirm them with `get_doc` or the `@slot` annotations in the component's `.d.ts` — guessing a slot name silently renders the child into the default slot.

## Events

The web component's `igcFoo` becomes the `onFoo` prop. Handlers receive the `CustomEvent`, so payloads live on `e.detail`.

Each event has a generated type pair: `Igr<X>EventArgs` is `CustomEvent<Igr<X>EventArgsDetail>`. Use the `…EventArgs` alias:

```tsx
import {
  IgrCheckbox, type IgrCheckboxChangeEventArgs,
  IgrInput,    type IgrComponentValueChangedEventArgs,
} from 'igniteui-react';

<IgrCheckbox onChange={(e: IgrCheckboxChangeEventArgs) => setChecked(e.detail.checked)}>
  Subscribe
</IgrCheckbox>

<IgrInput label="Search" onInput={(e: IgrComponentValueChangedEventArgs) => setQuery(e.detail)} />
```

Frequently used events — `onInput` (per keystroke) and `onChange` (committed) on `IgrInput`; `onChange` on `IgrCheckbox`, `IgrSwitch`, `IgrSelect`, `IgrCombo`, `IgrRadioGroup`, `IgrTabs`, `IgrCalendar`, `IgrDatePicker`; `onInput`/`onChange` on `IgrSlider`; `onClosing`/`onClosed` on `IgrDialog`. Detail shapes differ per component — `get_api_reference({ platform: 'react', component: 'IgrCombo', section: 'events' })`.

## Refs

The exported name is both the component and its element type, so `useRef<IgrDialog>` gives you the custom element and its imperative API:

```tsx
const dialog = useRef<IgrDialog>(null);
await dialog.current?.show();   // show/hide/toggle return Promise<boolean>

<IgrDialog ref={dialog} title="Confirm">
  <p>Are you sure?</p>
  <IgrButton slot="footer" onClick={() => dialog.current?.hide()}>Close</IgrButton>
</IgrDialog>
```

## Forms

Inputs, select, checkbox, switch, and radio are form-associated custom elements, so uncontrolled forms work natively — give each a `name` and read `FormData`. Native validation (`required`, `pattern`, …) participates too.

```tsx
const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  data.get('name');
};

<form onSubmit={onSubmit}>
  <IgrInput name="name" label="Name" required />
  <IgrSelect name="role" label="Role" required>
    <IgrSelectItem value="admin">Admin</IgrSelectItem>
  </IgrSelect>
  <IgrButton type="submit">Submit</IgrButton>
</form>
```

Controlled: pass `value`/`checked` and update from `e.detail`. With React Hook Form, wrap in `Controller` and map `field.onChange(e.detail)` — components are not native `<input>`s, so `register()` alone will not track them.

## TypeScript

`ComponentProps<typeof IgrInput>` extracts the prop type when you wrap a component. For editor completion, keep `"jsx": "react-jsx"` and `"moduleResolution": "bundler"` in `tsconfig.json`.
