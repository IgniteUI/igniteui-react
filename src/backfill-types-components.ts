import type {
  AbsolutePosition,
  CalendarHeaderOrientation,
  CalendarSelection,
  ContentOrientation,
  HorizontalTransitionAnimation,
  IconMeta,
  IgrActiveStepChangedEventArgs,
  IgrActiveStepChangingEventArgs,
  IgrButton,
  IgrChatMessage,
  IgrChatMessageAttachment,
  IgrChatMessageReaction,
  IgrCheckbox,
  IgrDropdownItem,
  IgrExpansionPanel,
  IgrIconButton,
  IgrInput,
  IgrSelectItem,
  IgrSwitch,
  IgrTab,
  IgrTile,
  IgrTreeItem,
  PickerMode,
  PopoverPlacement,
  PopoverScrollStrategy,
  SliderTickLabelRotation,
  SliderTickOrientation,
  ToggleLabelPosition,
} from './components/index.js';

//#region manual event args not picked up as args

// TODO: Update CEM and collect args from Event.type (currently not generated)
export type IgrDropdownItemComponentEventArgs = CustomEvent<IgrDropdownItem>;
export type IgrExpansionPanelComponentEventArgs = CustomEvent<IgrExpansionPanel>;
export type IgrSelectItemComponentEventArgs = CustomEvent<IgrSelectItem>;
export type IgrTabComponentEventArgs = CustomEvent<IgrTab>;
export type IgrTileComponentEventArgs = CustomEvent<IgrTile>;
export type IgrTreeItemComponentEventArgs = CustomEvent<IgrTreeItem>;
export type IgrChatMessageEventArgs = CustomEvent<IgrChatMessage>;
export type IgrChatMessageReactionEventArgs = CustomEvent<IgrChatMessageReaction>;
export type IgrChatMessageAttachmentEventArgs = CustomEvent<IgrChatMessageAttachment>;
export type IgrChatAddedMessageAttachmentEventArgs = CustomEvent<IgrChatMessageAttachment[]>;
//#endregion

//#region shared static event args for primitives
export type IgrComponentBoolValueChangedEventArgs = CustomEvent<boolean>;
export type IgrComponentDataValueChangedEventArgs = CustomEvent<any>;
export type IgrComponentDateValueChangedEventArgs = CustomEvent<Date>;
export type IgrComponentValueChangedEventArgs = CustomEvent<string>;
export type IgrNumberEventArgs = CustomEvent<number>;
export type IgrVoidEventArgs = CustomEvent<void>;
//#endregion

//#region backfills
export type IgrCalendarFormatOptions = Pick<Intl.DateTimeFormatOptions, 'month' | 'weekday'>;
export type NumberFormatOptions = Intl.NumberFormatOptions;

/** @deprecated use PopoverPlacement */
export type DropdownPlacement = PopoverPlacement;
/** @deprecated use IconMeta */
export type IgrIconMeta = IconMeta;

/** @deprecated use AbsolutePosition */
export type BaseAlertLikePosition = AbsolutePosition;
/** @deprecated use CalendarSelection */
export type CalendarBaseSelection = CalendarSelection;
/** @deprecated use ContentOrientation */
export type CalendarOrientation = ContentOrientation;
/** @deprecated use ContentOrientation */
export type CardActionsOrientation = ContentOrientation;
/** @deprecated use HorizontalTransitionAnimation */
export type CarouselAnimationType = HorizontalTransitionAnimation;
/** @deprecated use ToggleLabelPosition */
export type CheckboxBaseLabelPosition = ToggleLabelPosition;
/** @deprecated use CalendarHeaderOrientation */
export type DatePickerHeaderOrientation = CalendarHeaderOrientation;
/** @deprecated use PickerMode */
export type DatePickerMode = PickerMode;
/** @deprecated use ContentOrientation */
export type DatePickerOrientation = ContentOrientation;
/** @deprecated use PopoverScrollStrategy */
export type DropdownScrollStrategy = PopoverScrollStrategy;
/** @deprecated use ContentOrientation */
export type RadioGroupAlignment = ContentOrientation;
/** @deprecated use ToggleLabelPosition */
export type RadioLabelPosition = ToggleLabelPosition;
/** @deprecated use PopoverScrollStrategy */
export type SelectScrollStrategy = PopoverScrollStrategy;
/** @deprecated use SliderTickOrientation */
export type SliderBaseTickOrientation = SliderTickOrientation;
/** @deprecated use HorizontalTransitionAnimation */
export type StepperHorizontalAnimation = HorizontalTransitionAnimation;
/** @deprecated use SliderTickLabelRotation */
export type TickLabelRotation = SliderTickLabelRotation;

/** @deprecated use IgrActiveStepChangedEventArgs */
export type IgrActiveStepChangedArgsEventArgs = IgrActiveStepChangedEventArgs;
/** @deprecated use IgrActiveStepChangingEventArgs */
export type IgrActiveStepChangingArgsEventArgs = IgrActiveStepChangingEventArgs;

/** @deprecated use the appropriate IgrButton or IgrIconButton type */
export type IgrButtonBase = IgrButton | IgrIconButton;
/** @deprecated use the appropriate IgrCheckbox or IgrSwitch type */
export type IgrCheckboxBase = IgrCheckbox | IgrSwitch;
/** @deprecated use IgrInput */
export type IgrInputBase = IgrInput;
//#endregion
