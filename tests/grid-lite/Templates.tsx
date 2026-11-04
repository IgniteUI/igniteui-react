import { Component, type ComponentProps, type ReactNode, Suspense, use, useState } from 'react';
import {
  type IgrCellContext,
  IgrGridLite,
  IgrGridLiteColumn,
  type IgrHeaderContext,
} from '../../src/grid-lite';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';

interface Person {
  id: number;
  name: string;
}

const data: Person[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

type Templates = Pick<ComponentProps<typeof IgrGridLiteColumn>, 'cellTemplate' | 'headerTemplate'>;

function PeopleGrid(templates: Templates) {
  return (
    <IgrGridLite data={data}>
      <IgrGridLiteColumn field="id" dataType="number" {...templates} />
      <IgrGridLiteColumn field="name" dataType="string" />
    </IgrGridLite>
  );
}

export function StatefulTemplate() {
  const [count, setCount] = useState(0);

  const cellTemplate = (ctx: IgrCellContext<Person>) => (
    <span>
      V:{ctx.value}/C:{count}
    </span>
  );

  return (
    <>
      <PeopleGrid cellTemplate={cellTemplate} />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </>
  );
}

export function OptionalTemplate() {
  const [withHeader, setWithHeader] = useState(false);

  const cellTemplate = (ctx: IgrCellContext<Person>) => <span>V:{ctx.value}</span>;
  const headerTemplate = (ctx: IgrHeaderContext<Person>) => <kbd>H:{ctx.column.field}</kbd>;

  return (
    <>
      <PeopleGrid
        cellTemplate={cellTemplate}
        headerTemplate={withHeader ? headerTemplate : undefined}
      />
      <button type="button" onClick={() => setWithHeader(true)}>
        Add header template
      </button>
    </>
  );
}

type TemplateState = 'set' | 'cleared';

export function ClearedTemplate() {
  const [template, setTemplate] = useState<TemplateState>('set');

  const cellTemplate = (ctx: IgrCellContext<Person>) => <span>V:{ctx.value}</span>;

  return (
    <>
      <PeopleGrid cellTemplate={template === 'set' ? cellTemplate : undefined} />
      <button type="button" onClick={() => setTemplate('cleared')}>
        Clear template
      </button>
    </>
  );
}

export function AsyncTemplate({ wait }: { wait: () => Promise<void> }) {
  const [count, setCount] = useState(0);

  const cellTemplate = async (ctx: IgrCellContext<Person>) => {
    await wait();

    return (
      <span>
        A:{ctx.value}/C:{count}
      </span>
    );
  };

  return (
    <>
      <PeopleGrid cellTemplate={cellTemplate} />
      <output>Count:{count}</output>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </>
  );
}

type BoundaryState = { error?: Error };

class Boundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? <p>Caught:{this.state.error.message}</p> : this.props.children;
  }
}

/** Fails on the first row only. */
function Cell({ value }: Pick<IgrCellContext<Person>, 'value'>) {
  if (value === 1) {
    throw new Error('boom');
  }

  return <span>V:{value}</span>;
}

const failingTemplates = {
  sync: (ctx: IgrCellContext<Person>) => Cell(ctx),
  async: async (ctx: IgrCellContext<Person>) => Cell(ctx),
  // Throws while React renders the returned tree.
  nested: (ctx: IgrCellContext<Person>) => <Cell value={ctx.value} />,
};

export function FailingTemplate({ failure }: { failure: keyof typeof failingTemplates }) {
  return (
    <Boundary>
      <PeopleGrid cellTemplate={failingTemplates[failure]} />
    </Boundary>
  );
}

/** `use()` needs `load` to cache its promises. */
export function SuspendingTemplate({ load }: { load: (id: number) => Promise<string> }) {
  const cellTemplate = (ctx: IgrCellContext<Person>) => <span>{use(load(Number(ctx.value)))}</span>;

  return (
    <Suspense fallback={<p>Loading grid</p>}>
      <PeopleGrid cellTemplate={cellTemplate} />
    </Suspense>
  );
}

/** First row resolves to a function: not a valid child, never called. */
export function FunctionResultTemplate() {
  const cellTemplate = async ({ value }: IgrCellContext<Person>) =>
    value === 1 ? ((() => <span>F</span>) as never) : <span>V:{value}</span>;

  return <PeopleGrid cellTemplate={cellTemplate} />;
}
