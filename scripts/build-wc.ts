import { defineWrapperConfig } from './config';

export default defineWrapperConfig({
  path: '../src/components',
  package: 'igniteui-webcomponents',
  types: {
    ignoreExports: ['defineComponents', 'defineAllComponents', 'IgcSplitterResizeEventDetail'],
  },
  ignoreEvents: ['igc-step'],
  extraEvents: {
    'igc-radio-group': [
      { name: 'igcChange', type: { text: '' }, delegateFrom: 'IgcRadioComponent' },
    ],
    'igc-tile-manager': [
      { name: 'igcTileFullscreen', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileMaximize', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileDragStart', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileDragEnd', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileDragCancel', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileResizeStart', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileResizeEnd', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
      { name: 'igcTileResizeCancel', type: { text: '' }, delegateFrom: 'IgcTileComponent' },
    ],
    'igc-accordion': [
      { name: 'igcOpening', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
      { name: 'igcOpened', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
      { name: 'igcClosing', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
      { name: 'igcClosed', type: { text: '' }, delegateFrom: 'IgcExpansionPanelComponent' },
    ],
  },
  ignore: [
    'igc-popover',
    'igc-focus-trap',
    'igc-days-view',
    'igc-months-view',
    'igc-years-view',
    'igc-carousel-indicator-container',
    'igc-validator',
    'igc-predefined-ranges-area',
    'igc-chat-input',
    'igc-chat-message',
    'igc-visually-hidden',
    'igc-picker-canvas',
  ],
  renderProps: {
    'igc-combo': ['itemTemplate', 'groupHeaderTemplate'],
    'igc-virtual-scroll': ['itemTemplate'],
  },
  rawRenderProps: {
    'igc-chat': `{
          "options": {
            "renderers": {
              "attachment": "attachment",
              "attachmentContent": "attachmentContent",
              "attachmentHeader": "attachmentHeader",
              "fileUploadButton": "fileUploadButton",
              "input": "input",
              "inputActions": "inputActions",
              "inputActionsEnd": "inputActionsEnd",
              "inputActionsStart": "inputActionsStart",
              "inputAttachments": "inputAttachments",
              "message": "message",
              "messageActions": "messageActions",
              "messageAttachments": "messageAttachments",
              "messageContent": "messageContent",
              "messageHeader": "messageHeader",
              "typingIndicator": "typingIndicator",
              "sendButton": "sendButton",
              "suggestionPrefix": "suggestionPrefix"
            }
          }
        }`,
  },
  typedocModuleName: 'igniteui-react',
});
