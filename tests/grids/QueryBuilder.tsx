import { useMemo, useState } from 'react';
import {
  type IgrEntityType,
  type IgrExpressionTreeEventArgs,
  IgrGrid,
  IgrQueryBuilder,
  IgrQueryBuilderHeader,
  type IgrQueryBuilderSearchValueContext,
} from '../../src/grids';
import '../../node_modules/igniteui-webcomponents-grids/grids/themes/light/bootstrap.css';
import { IgrButton, IgrInput } from '../../src/components';

interface Record {
  id: number;
  name: string;
  age: number;
  email: string;
}

export default function QueryBuilder() {
  const customersEntity: IgrEntityType = {
    name: 'Customers',
    fields: [
      { field: 'id', dataType: 'number' },
      { field: 'name', dataType: 'string' },
      { field: 'age', dataType: 'number' },
      { field: 'email', dataType: 'string' },
    ],
  };
  const ordersEntity: IgrEntityType = {
    name: 'Orders',
    fields: [
      { field: 'orderId', dataType: 'number' },
      { field: 'customerId', dataType: 'number' },
      { field: 'employeeId', dataType: 'number' },
      { field: 'shipperId', dataType: 'number' },
      { field: 'orderDate', dataType: 'date' },
      { field: 'requiredDate', dataType: 'date' },
      { field: 'shipVia', dataType: 'string' },
      { field: 'freight', dataType: 'number' },
      { field: 'shipName', dataType: 'string' },
      { field: 'completed', dataType: 'boolean' },
    ],
  };
  const [entities, setEntities] = useState<IgrEntityType[]>([customersEntity]);

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

  function logEvent(args: IgrExpressionTreeEventArgs) {
    console.log(args);
  }

  const searchValueTemplate = (ctx: IgrQueryBuilderSearchValueContext) => {
    return (
      <IgrInput
        data-testid="search-template"
        value={ctx.implicit.value}
        onChange={(e) => {
          ctx.implicit.value = e.detail;
        }}
      ></IgrInput>
    );
  };

  return (
    <div className="ig-typography">
      <IgrQueryBuilder
        entities={entities}
        onExpressionTreeChange={logEvent}
        searchValueTemplate={searchValueTemplate}
      >
        <IgrQueryBuilderHeader title="Header title">
          <span>header content</span>
          <IgrButton>header content button</IgrButton>
        </IgrQueryBuilderHeader>
      </IgrQueryBuilder>

      <IgrGrid autoGenerate={true} data={data} style={{ minHeight: '300px' }}></IgrGrid>
      <IgrButton onClick={() => setEntities([customersEntity, ordersEntity])}>
        With orders entity
      </IgrButton>
      <IgrButton onClick={() => setEntities([customersEntity])}>Without orders entity</IgrButton>
    </div>
  );
}
