# Refs & Forms

## Refs & Imperative API

Use `useRef` to access the underlying web component element and call imperative methods (e.g., showing/hiding a dialog, focusing an input):

```tsx
import { useRef } from 'react';
import { IgrDialog, IgrButton, IgrInput } from 'igniteui-react';

function MyPage() {
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLElement>(null);

  const openDialog = () => {
    // Access the underlying web component and call its methods
    (dialogRef.current as any)?.show();
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <IgrButton onClick={openDialog}>
        <span>Open Dialog</span>
      </IgrButton>

      <IgrDialog ref={dialogRef} title="Confirmation">
        <p>Are you sure?</p>
        <IgrButton slot="footer" onClick={() => (dialogRef.current as any)?.hide()}>
          <span>Close</span>
        </IgrButton>
      </IgrDialog>

      <IgrButton onClick={focusInput}>
        <span>Focus Input</span>
      </IgrButton>
      <IgrInput ref={inputRef} label="Name" />
    </>
  );
}
```

> **Tip:** The ref gives you direct access to the web component's DOM element. You can call any method documented in the web component API.

## Controlled Components with `useState`

Wire up Ignite UI form components with React state for controlled behavior:

```tsx
import { useState } from 'react';
import { IgrInput, IgrCheckbox, IgrSelect, IgrSelectItem } from 'igniteui-react';

function ProfileForm() {
  const [name, setName] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [role, setRole] = useState('user');

  return (
    <form>
      <IgrInput
        label="Name"
        value={name}
        onInput={(e: CustomEvent) =>
          setName((e.target as HTMLInputElement).value)
        }
      />

      <IgrCheckbox
        checked={newsletter}
        onChange={(e: CustomEvent) =>
          setNewsletter((e.target as any).checked)
        }
      >
        Subscribe to newsletter
      </IgrCheckbox>

      <IgrSelect
        label="Role"
        value={role}
        onChange={(e: CustomEvent) =>
          setRole((e.detail as any).value)
        }
      >
        <IgrSelectItem value="user">User</IgrSelectItem>
        <IgrSelectItem value="admin">Admin</IgrSelectItem>
        <IgrSelectItem value="editor">Editor</IgrSelectItem>
      </IgrSelect>
    </form>
  );
}
```

## Uncontrolled Components

For simpler scenarios, omit state and read the value on submit:

```tsx
import { useRef } from 'react';
import { IgrInput, IgrButton } from 'igniteui-react';

function SimpleForm() {
  const nameRef = useRef<HTMLElement>(null);

  const handleSubmit = () => {
    const value = (nameRef.current as any)?.value;
    console.log('Name:', value);
  };

  return (
    <form>
      <IgrInput ref={nameRef} label="Name" />
      <IgrButton onClick={handleSubmit}>
        <span>Submit</span>
      </IgrButton>
    </form>
  );
}
```

## React Hook Form Integration

Ignite UI components are form-associated web components. You can integrate them with React Hook Form using `Controller`:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { IgrInput, IgrCheckbox, IgrButton } from 'igniteui-react';

interface FormData {
  email: string;
  acceptTerms: boolean;
}

function SignUpForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Email is required' }}
        render={({ field }) => (
          <IgrInput
            label="Email"
            type="email"
            value={field.value || ''}
            onInput={(e: CustomEvent) =>
              field.onChange((e.target as HTMLInputElement).value)
            }
            onBlur={() => field.onBlur()}
            invalid={!!errors.email}
          />
        )}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <Controller
        name="acceptTerms"
        control={control}
        rules={{ required: 'You must accept the terms' }}
        render={({ field }) => (
          <IgrCheckbox
            checked={field.value || false}
            onChange={(e: CustomEvent) =>
              field.onChange((e.target as any).checked)
            }
          >
            I accept the terms and conditions
          </IgrCheckbox>
        )}
      />

      <IgrButton type="submit">
        <span>Sign Up</span>
      </IgrButton>
    </form>
  );
}
```

## TypeScript

### Importing Component Types

Each component exports its props interface. Import and use them for type-safe code:

```tsx
import { IgrButton, IgrInput } from 'igniteui-react';
import type { ComponentProps } from 'react';

// Get the props type for a component
type ButtonProps = ComponentProps<typeof IgrButton>;
type InputProps = ComponentProps<typeof IgrInput>;

// Use in your own components
interface FormFieldProps {
  label: string;
  inputProps?: Partial<InputProps>;
}

function FormField({ label, inputProps }: FormFieldProps) {
  return (
    <div>
      <IgrInput label={label} {...inputProps} />
    </div>
  );
}
```

### Auto-complete

IDEs with TypeScript support will provide auto-complete for all `Igr*` component props. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```
