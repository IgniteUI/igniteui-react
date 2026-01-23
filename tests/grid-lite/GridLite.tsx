import { useMemo, useState } from 'react';
import {
  type ColumnConfiguration,
  type IgrCellContext,
  type IgrFilteredEvent,
  IgrGridLite,
  IgrGridLiteColumn,
  type IgrHeaderContext,
  type SortingExpression,
} from '../../src/grid-lite';
import '../../node_modules/igniteui-webcomponents/themes/light/bootstrap.css';
import { IgrButton } from '../../src/components';

interface Record {
  id: number;
  name: string;
  age: number;
  email: string;
}

export default function Grid() {
  const [sortingExpressions, setSortingExpressions] = useState<SortingExpression<Record>[]>([]);
  const [columns, setColumns] = useState<ColumnConfiguration<Record>[]>([
    { field: 'age', dataType: 'number' },
    { field: 'email', dataType: 'string' },
  ]);

  const data: Record[] = useMemo(
    () => [
      { id: 1, name: 'Alice', age: 28, email: 'alice@example.com' },
      { id: 2, name: 'Bob', age: 34, email: 'bob@example.com' },
      { id: 3, name: 'Charlie', age: 25, email: 'charlie@example.com' },
      { id: 4, name: 'David', age: 31, email: 'david@example.com' },
      { id: 5, name: 'Eve', age: 29, email: 'eve@example.com' },
      { id: 6, name: 'Frank', age: 37, email: 'frank@example.com' },
      { id: 7, name: 'Grace', age: 22, email: 'grace@example.com' },
      { id: 8, name: 'Hank', age: 30, email: 'hank@example.com' },
      { id: 9, name: 'Ivy', age: 27, email: 'ivy@example.com' },
      { id: 10, name: 'Jack', age: 33, email: 'jack@example.com' },
    ],
    [],
  );

  function logEvent(
    args: CustomEvent<SortingExpression<Record>> | CustomEvent<IgrFilteredEvent<Record>>,
  ) {
    console.log(args);
  }

  const pinTemplate = (ctx: IgrCellContext<Record>) => {
    const row = ctx.row;
    return row ? (
      <button
        type="button"
        data-id={row.data!.id}
        onClick={(_e) => {
          console.log(row.index);
        }}
      >
        🧪
      </button>
    ) : null;
  };

  const columnBodyTemplate = (ctx: IgrCellContext<Record>) => {
    return <span>PK: {ctx.value}</span>;
  };

  const nameTemplate = (ctx: IgrCellContext<Record>) => {
    return <b>{ctx.value} Doe</b>;
  };

  const headerTemplate = (ctx: IgrHeaderContext<Record>) => {
    return <kbd>{ctx.column.field} 🔢</kbd>;
  };

  return (
    <>
      <IgrGridLite
        data={data}
        sortingExpressions={sortingExpressions}
        onSorted={logEvent}
        onFiltered={logEvent}
      >
        <IgrGridLiteColumn width="80px" cellTemplate={pinTemplate}></IgrGridLiteColumn>
        <IgrGridLiteColumn
          field="id"
          dataType="number"
          cellTemplate={columnBodyTemplate}
          headerTemplate={headerTemplate}
        ></IgrGridLiteColumn>
        <IgrGridLiteColumn
          field="name"
          dataType="string"
          cellTemplate={nameTemplate}
          sortable
        ></IgrGridLiteColumn>
        {columns.map((col) => (
          <IgrGridLiteColumn
            key={col.field}
            field={col.field}
            dataType={col.dataType}
          ></IgrGridLiteColumn>
        ))}
      </IgrGridLite>
      <IgrButton onClick={() => setSortingExpressions([{ key: 'name', direction: 'descending' }])}>
        Sort name
      </IgrButton>
      <IgrButton onClick={() => setColumns([{ field: 'email', dataType: 'string' }])}>
        Without age column
      </IgrButton>
      <IgrButton
        onClick={() =>
          setColumns([
            { field: 'age', dataType: 'number' },
            { field: 'email', dataType: 'string' },
          ])
        }
      >
        With age column
      </IgrButton>
    </>
  );
}
