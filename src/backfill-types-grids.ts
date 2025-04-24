import type {
  IgrColumn,
  IgrDimensionsChange,
  IgrFilteringExpressionsTree,
  IgrForOfState,
  IgrGridClipboardEvent,
  IgrGridSelectionRange,
  IgrPivotDimension,
  IgrPivotValue,
  IgrSortingExpression,
  IgrValuesChange,
} from './grids/index.js';

//#region manual event args not picked up as args

// TODO: Update CEM and collect args from Event.type (currently not generated)
export type IgrColumnComponentEventArgs = CustomEvent<IgrColumn>;
export type IgrDimensionsChangeEventArgs = CustomEvent<IgrDimensionsChange>;
export type IgrFilteringExpressionsTreeEventArgs = CustomEvent<IgrFilteringExpressionsTree>;
export type IgrForOfStateEventArgs = CustomEvent<IgrForOfState>;
export type IgrGridClipboardEventArgs = CustomEvent<IgrGridClipboardEvent>;
/** @deprecated use IgrGridClipboardEventArgs */
export type IgrGridClipboardEventEventArgs = IgrGridClipboardEventArgs;
export type IgrGridSelectionRangeEventArgs = CustomEvent<IgrGridSelectionRange>;
export type IgrPivotDimensionEventArgs = CustomEvent<IgrPivotDimension>;
/** @deprecated use IgrPivotValue */
export type IgrPivotValueDetail = IgrPivotValue;
export type IgrPivotValueEventArgs = CustomEvent<IgrPivotValue>;
export type IgrSortingExpressionEventArgs = CustomEvent<IgrSortingExpression[]>;
export type IgrValuesChangeEventArgs = CustomEvent<IgrValuesChange>;
//#endregion

// shared static event args:
export type IgrComponentArrayDataValueChangedEventArgs = CustomEvent<any[]>;
