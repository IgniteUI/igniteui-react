import type {
  IgrDockingIndicatorPosition,
  IgrDockManagerPaneType,
  IgrPaneActionBehavior,
  IgrPaneDragActionType,
  IgrResizerLocation,
  IgrSplitPaneOrientation,
  IgrUnpinnedLocation,
} from './dock-manager/index.js';

//#region backfills
export type DockManagerPaneType = IgrDockManagerPaneType;
export type SplitPaneOrientation = IgrSplitPaneOrientation;
export type UnpinnedLocation = IgrUnpinnedLocation;
export type PaneActionBehavior = IgrPaneActionBehavior;
export type DockingIndicatorPosition = IgrDockingIndicatorPosition;
export type PaneDragActionType = IgrPaneDragActionType;
export type ResizerLocation = IgrResizerLocation;
//#endregion
