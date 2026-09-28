import { Component, type ComponentProps, type ReactNode, useState } from 'react';
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

export function FailingTemplate() {
  const cellTemplate = async () => {
    throw new Error('boom');
  };

  return (
    <Boundary>
      <PeopleGrid cellTemplate={cellTemplate} />
    </Boundary>
  );
}
