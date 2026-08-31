import { useMemo, useState } from 'react';
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

/** A cell template closing over React state. */
export function StatefulTemplate() {
  const [count, setCount] = useState(0);
  const records = useMemo(() => data, []);

  const cellTemplate = (ctx: IgrCellContext<Person>) => (
    <span>
      V:{ctx.value}/C:{count}
    </span>
  );

  return (
    <>
      <IgrGridLite data={records}>
        <IgrGridLiteColumn field="id" dataType="number" cellTemplate={cellTemplate} />
        <IgrGridLiteColumn field="name" dataType="string" />
      </IgrGridLite>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </>
  );
}

/** A render prop that is conditionally `undefined`, next to one that is always set. */
export function OptionalTemplate() {
  const [withHeader, setWithHeader] = useState(false);
  const records = useMemo(() => data, []);

  const cellTemplate = (ctx: IgrCellContext<Person>) => <span>V:{ctx.value}</span>;
  const headerTemplate = (ctx: IgrHeaderContext<Person>) => <kbd>H:{ctx.column.field}</kbd>;

  return (
    <>
      <IgrGridLite data={records}>
        <IgrGridLiteColumn
          field="id"
          dataType="number"
          cellTemplate={cellTemplate}
          headerTemplate={withHeader ? headerTemplate : undefined}
        />
        <IgrGridLiteColumn field="name" dataType="string" />
      </IgrGridLite>
      <button type="button" onClick={() => setWithHeader(true)}>
        Add header template
      </button>
    </>
  );
}
