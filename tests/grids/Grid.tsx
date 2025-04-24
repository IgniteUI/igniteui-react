import React, { useMemo, useState } from 'react';
import {
  IgrActionStrip,
  type IgrCellTemplateContext,
  IgrColumn,
  IgrGrid,
  IgrGridEditingActions,
  IgrGridPinningActions,
  IgrGridToolbar,
  IgrGridToolbarActions,
  IgrGridToolbarAdvancedFiltering,
  IgrGridToolbarHiding,
  IgrGridToolbarPinning,
  IgrGridToolbarTitle,
  type IgrPageEventArgs,
  IgrPaginator,
  type IgrPinColumnEventArgs,
} from '../../src/grids';
import '../../node_modules/igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
import { IgrButton } from '../../src/components';

interface Record {
  id: number;
  name: string;
  age: number;
  email: string;
}

export default function Grid() {
  const [allowPinning, setAllowPinning] = useState<boolean>(true);
  const [allowFilter, setAllowFilter] = useState<boolean>(false);

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

  function logEvent(args: IgrPageEventArgs | IgrPinColumnEventArgs) {
    console.log(args);
  }

  const columnBodyTemplate = (ctx: IgrCellTemplateContext) => {
    return <span>PK: {ctx.cell.value}</span>;
  };

  const columnBodyTemplateOld = (ctx: { dataContext: IgrCellTemplateContext }) => {
    return <b>{ctx.dataContext.implicit} Doe</b>;
  };

  return (
    <>
      <IgrGrid
        data={data}
        primaryKey="id"
        className="ig-typography"
        onColumnPinned={logEvent}
        rowEditable={true}
      >
        <IgrGridToolbar>
          <IgrGridToolbarTitle>Custom Toolbar</IgrGridToolbarTitle>
          <IgrGridToolbarActions>
            <IgrGridToolbarHiding></IgrGridToolbarHiding>
            {allowPinning && <IgrGridToolbarPinning />}
            {allowFilter && <IgrGridToolbarAdvancedFiltering />}
          </IgrGridToolbarActions>
        </IgrGridToolbar>
        <IgrColumn field="id" dataType="number" bodyTemplate={columnBodyTemplate}></IgrColumn>
        <IgrColumn field="name" dataType="string" bodyTemplate={columnBodyTemplateOld}></IgrColumn>
        <IgrColumn field="age" dataType="number"></IgrColumn>
        <IgrColumn field="email" dataType="string"></IgrColumn>
        <IgrPaginator perPage={5} onPagingDone={logEvent}></IgrPaginator>
        <IgrActionStrip>
          <IgrGridEditingActions></IgrGridEditingActions>
          <IgrGridPinningActions></IgrGridPinningActions>
        </IgrActionStrip>
      </IgrGrid>
      <IgrButton onClick={() => setAllowFilter(!allowFilter)}>
        Toggle toolbar advanced filter
      </IgrButton>
      <IgrButton onClick={() => setAllowPinning(!allowPinning)}>Toggle toolbar pinning</IgrButton>
    </>
  );
}
