## [Unreleased]

### Fixed
- `IgrChat` types ([#234](https://github.com/IgniteUI/igniteui-react/issues/234)):
    - A value typed `IgrChatOptions` is assignable to `options` again.
    - `IgrChatOptions`, `ChatRenderers` and `ChatTemplateRenderer` renderers return React nodes, not `unknown`. They no longer accept renderers that return lit templates.
- Skills:
    - Documented that boolean values for `aria-*` and `data-*` attributes on `Igr*` components must be passed as the strings `'true'` / `'false'`, not as booleans. React 19 writes a boolean `true` on a custom element as an empty attribute ([#221](https://github.com/IgniteUI/igniteui-react/issues/221)).

## 19.11.0 - 2026-11-17

This release updates the packages that the React wrappers use ([#230](https://github.com/IgniteUI/igniteui-react/pull/230), [#231](https://github.com/IgniteUI/igniteui-react/pull/231)):

- igniteui-webcomponents: ~7.4.1 -> ~7.5.0
- igniteui-webcomponents-grids: ~7.3.2 -> ~7.4.0 (Ignite UI for Angular 22.3)
- igniteui-dockmanager: ~2.2.1 -> ~2.3.0
- igniteui-grid-lite: ~0.11.0 -> ~0.12.0

This list shows only the changes that have an effect on the React packages. For all changes, see the changelogs of [igniteui-webcomponents](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md), [Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/blob/master/CHANGELOG.md) (22.2.1 to 22.3.0), [igniteui-dockmanager](https://github.com/IgniteUI/igniteui-dockmanager/blob/master/CHANGELOG.md) and [igniteui-grid-lite](https://github.com/IgniteUI/igniteui-grid-lite/blob/master/CHANGELOG.md).

### Breaking changes
- Surface color: the components and the grids use `--ig-surface-base`, not `--ig-surface-500`. To change the surface at runtime, set the surface roles: `--ig-surface-base`, `--ig-surface-raised`, `--ig-surface-overlay`, `--ig-surface-sunken` and `--ig-surface-container`.
- `IgrDialog`, `IgrDatePicker`, `IgrDateRangePicker`: the dialog backdrop is the native `::backdrop` in the top layer. It covers the full page.
    - Removed CSS parts: `backdrop` and `animating` of the dialog, and `overlay` of the date pickers in dialog mode.
    - To style the backdrop, use `igc-dialog::part(base)::backdrop`. On a date picker, use `::part(dialog-base)::backdrop`.
- Localization: all packages use `igniteui-i18n-core` 2.0. If you register languages from `igniteui-i18n-resources`, update it to 2.0.

### Behavior changes

#### Components
- Form controls: Enter in a text field submits the form, as in a native field.
    - The control clicks the first submit button of the form. This button is the `submitter`, and a click handler can stop the submit.
    - A form without a submit button submits only if it has one text field.
- Localization:
    - A component without `locale` uses the first locale that it finds: its own `lang`, the `locale` or `lang` of the nearest ancestor, then the global locale.
    - As a result, `lang` on `<body>` or on a section overrides `setCurrentI18n()` for the components in it. To use a different locale, set `locale` on the component.
    - The components do not register their English strings. `getCurrentResourceStrings()` returns only the strings that you register.
- `IgrCalendar`, `IgrChat`, `IgrColorPicker`, `IgrCombo`: the events of their inner elements do not bubble out. Use the component events: `onInputChange` and `onAttachmentRemoved` of `IgrChat`, and `onSearchInput` and `onDataRequest` of `IgrCombo`.
- `IgrCarousel`: the carousel uses the height of its tallest slide, not the height of its parent. For a fixed height, set `height` or `max-height` on it.
- `IgrCombo`:
    - New `data` keeps the selection. Selected values that are not in the new `data` stay selected. To clear the selection, set `value` to `[]`, for example in cascading combos.
    - If two or more items in `data` have the same value, the selection holds the first item. `value` contains the value one time.
    - In multiple selection, the options show their state in `aria-checked`, not in `aria-selected`.
- `IgrDatePicker`, `IgrDateRangePicker`, `IgrDateTimeInput`: `onChange` occurs only for changes that the user makes. These actions do not raise it on the next blur or on Done:
    - A `value` set from code.
    - `clear()`, `stepUp()`, `stepDown()`, `setRangeText()` and `select()`. Exception: `clear()` of the date pickers raises `onChange`.
    - A form reset.
- `IgrDatePicker`, `IgrDateRangePicker`: in dialog mode, the pickers fade in and out. `onOpened` and `onClosed` occur after the animation. `open` stays `true` until the exit animation ends.
- `IgrDateRangePicker`:
    - "Last 7 Days" selects 7 days: today and the 6 days before it.
    - In dialog mode, Done raises `onChange` after `onClosing`. If you cancel `onClosing`, the dialog stays open.
- `IgrHighlight`:
    - The match colors come only from `--background`, `--foreground`, `--background-active` and `--foreground-active` of the highlight.
    - The highlight searches again when its content changes. You do not need to call `search()`.
- `IgrNavDrawer`: in Firefox and Safari, a drawer at an edge slides out, as in Chromium. `hide()` and `toggle()` resolve, and `onClosed` occurs, after the exit animation.
- `IgrSplitter`: when `orientation` changes, the splitter keeps the sizes, minimum sizes and maximum sizes that you set.
- `IgrTileManager`:
    - A tile does not span past the last column.
    - The tile manager does not inherit `--column-count` and `--grid-gap` from an ancestor. Set them on the tile manager.

#### Grids
- `filter()` without a condition throws for a column without filtering expressions. It also throws if an `onFiltering` handler sets expressions.
- `IgrTreeGrid`: `beginAddRowByIndex(index, true)` adds a child of the row at `index`. Before, it added a child of the row at `index - 1`.

### Added

#### Components
- ARIA:
    - `IgrButton`, `IgrChip`, `IgrIconButton`: `aria-expanded`, `aria-haspopup` and `aria-controls` go to the inner button.
    - `IgrButton`, `IgrIconButton`: `aria-pressed` makes them toggle buttons.
    - `IgrDateTimeInput`, `IgrFileInput`, `IgrInput`, `IgrMaskInput`, `IgrTextarea`: `role="combobox"` and its ARIA attributes go to the native field.
- Form controls: `--ig-helper-min-lines` keeps space for 1 to 3 lines of helper or validation text below the control.
- Localization:
    - `IgrColorPicker`, `IgrDialog`, `IgrSplitter`, `IgrTile`, `IgrTooltip`: `locale` and `resourceStrings`.
    - `IgrChat`, `IgrTileManager`: `locale`.
- Theming: the `igc-theme-material`, `igc-theme-bootstrap`, `igc-theme-indigo` and `igc-theme-fluent` export conditions put only one theme in the bundle. The bundle is approximately 15–17% smaller after gzip. See "Bundling a single theme" in the igniteui-webcomponents README.
- `IgrAccordion`, `IgrExpansionPanel`, `IgrTabs`, `IgrTree`: find-in-page and links to an element find content in collapsed panels, unselected tabs and collapsed tree items. The component then shows the content. The browser must support `hidden="until-found"`.
- `IgrCalendar`, `IgrDatePicker`, `IgrDateRangePicker`: the optional `label` of a `DateRangeDescriptor` adds to the accessible name of the special and disabled dates that it matches.
- `IgrChat`:
    - `focusInput()` moves the focus to the text area.
    - `onNavigate` occurs before a message link opens in the same tab. Cancel it to route on the client.
- `IgrCombo`:
    - Remote data:
        - Set `filteringOptions.mode` to `'remote'` to turn off the local filter.
        - Search on the server in `onSearchInput` (`detail.searchText`), then set `data` to the results.
        - `onDataRequest` requests more items when the user scrolls near the end of `data`.
        - `totalItemCount` shows a placeholder for each item that is not loaded.
        - `loading` shows a spinner.
    - `useComboDataSource` from `igniteui-react/extras/combo-data-source` connects the combo to a server that searches and pages ([#233](https://github.com/IgniteUI/igniteui-react/pull/233)):
        - Set the combo `ref` to the `ref` that the hook returns.
        - The hook sets `data`, `loading` and `totalItemCount`. Do not set them as props.
        - A new `load` function on each render does not abort the request in progress.
        - `refresh()` loads the first page again, for example when a parent combo changes.
        - The hook uses `bindComboDataSource()` from `igniteui-webcomponents/extras/combo-data-source`.
    - `showSelectAll` adds a "Select all" option in multiple selection. `selectAllItems()` and `deselectAllItems()` do the same from code.
    - `groupSelection` makes each group header an option. The option selects or deselects the visible items of its group.
    - `selectionCommit="confirm"` holds the changes of the user while the list is open:
        - Each toggle raises a cancelable `onPendingChange`.
        - Enter or the Apply button commits the changes with one `onChange`.
        - A custom footer can use `pendingValue`, `commitSelection()` and `cancelSelection()`.
    - `onClosing` and `onClosed` contain the `trigger` of the close, for example `enter`, `escape`, `outside-click` or `apply` (`IgrComboClosingEventArgs`).
    - The context of the `groupHeaderTemplate` render prop contains `key`: the `groupKey` value of the group.
- `IgrDatePicker`, `IgrDateTimeInput`, `IgrInput`, `IgrMaskInput`, `IgrTextarea`: read-only `selectionStart` and `selectionEnd`.
- `IgrDropdown`: `header` and `footer` slots hold content before and after the items, for example a search field or action buttons.
- `IgrFileInput`: `directory` lets the user select a folder.
- `IgrQrCode`: `copyToClipboard()` copies the code as a PNG image, or as SVG and PNG images.
- `IgrTab`: with `href`, the header is a link. `onNavigate` occurs before the browser follows the link. Cancel it to route on the client.
- `IgrTabs`: `headerPosition` puts the headers in a column at the `start` or `end` of the panels.
- `IgrTileManager`: `--grid-padding` sets the padding of the grid.
- `IgrTooltip`: `showAt()` shows the tooltip at a point or a rectangle in viewport coordinates, for example at the pointer over a canvas.

#### Grids
- `IgrGrid`, `IgrHierarchicalGrid`, `IgrPivotGrid`, `IgrRowIsland`, `IgrTreeGrid`: `validationTooltipTrigger` (`GridValidationTooltipTrigger`) sets when the validation tooltip of an invalid cell shows:
    - `active` (default): when the cell becomes active, or when the pointer is on the error icon.
    - `hover`: only when the pointer is on the error icon.
- `IgrQueryBuilder`: Escape cancels a mouse drag of a condition.

#### Dock Manager
- A handle where two splitters meet resizes the panes in both directions. Style it with the `splitter-junction` part. The `resizePanes` resource string sets its accessible name.

### Changed

#### Components
- All components:
    - The components are approximately 6% smaller after gzip.
    - igniteui-webcomponents has a new runtime dependency: `tslib`.
    - A component does not define its tag if a different copy of igniteui-webcomponents defined it first. The component writes one warning to the console.
- `IgrAvatar`, `IgrBadge`, `IgrCarouselSlide`: the components do not set `aria-roledescription`.
- `IgrChat`:
    - The message area scrolls to new messages only while it is at the bottom.
    - The Markdown renderer of `createChatMarkdownRenderer()` from `igniteui-react/extras`:
        - Loads `shiki` only when highlighting is on.
        - Opens links to a different origin in a new tab.
        - Applies `colorReplacements` to all themes.
        - Does not need `marked-shiki`. It needs `shiki` 4.5.0 or later.
- `IgrChat`, `IgrList`, `IgrTree`: messages and items far from the view do not render (`content-visibility: auto`). Long lists render faster. The `innerText` of an item that did not render is an empty string. Use `textContent`.
- `IgrChip`: the `end` slot renders after the `suffix` slot.
- `IgrSnackbar`, `IgrToast`: the display time pauses while the pointer or the focus is on the component. `show()` on an open component starts the display time again.
- `IgrTextarea`:
    - With `resize="auto"`, the control sizes to its content in browsers that support CSS `field-sizing`.
    - A `max-height` on the `input` part does not include the padding and the border.

#### Grids
- The themes of the grid, toolbar, paginator, column actions, Excel-style filtering and query builder do not use `--background`, `--foreground` or `--accent-color` from an ancestor or from `:root`.

### Deprecated
- `IgrCombo`: `item` in the context of the group header template. Use `key`.
- The numbered surface shades, for example `--ig-surface-500`. Use the surface roles.

### Fixed

#### Components
- `focus()` immediately after a component mounts moves the focus to the component after its first render. Before, the call did nothing. In `IgrCheckbox`, `IgrRadio`, `IgrSelect` and `IgrSwitch`, it threw a `TypeError`.
- Form controls:
    - A failed submit or `form.reportValidity()` moves the focus to the first invalid control.
    - The `invalid` event occurs only from `checkValidity()`, `reportValidity()` or a failed submit. It does not occur while the user edits the value.
    - `validationMessage` uses the strings and formats of the locale.
- Host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the inner element that has the role.
- Component parts do not show through a sticky page header. Their `z-index` values stay inside the component.
- `IgrChat`:
    - The chat does not leak one object URL for each attached file on each render.
    - Attachments with an image MIME type render as images.
    - The file picker attaches only the files that match `acceptedFiles`.
- `IgrCombo`, `IgrDropdown`, `IgrHighlight`, `IgrSelect`: if you set a property to its current value, the component keeps its state. A re-render with the same props does not:
    - Clear the search text of the combo.
    - Move the active item.
    - Move the active match of the highlight back to the first match.
- `IgrDialog`: a dialog that you move, or remove and append again, keeps its state.
- `IgrInput`: `pattern` must match the full value, as in a native input.
- `IgrQrCode`: codes of versions 30 to 40 are in accordance with ISO/IEC 18004. Scanners can read them.
- `IgrRangeSlider`, `IgrSlider`:
    - A value snaps to the nearest step from `min`.
    - The order in which you set `value`, `lower`, `upper`, `min`, `max` and `step` does not change the result.
    - A drag raises one `onChange`.
    - A container that clips its overflow does not cut the thumb label.
- `IgrStepper`:
    - A click in the content of a step does not activate the step.
    - The content of an inactive step is `inert`.
    - When you set `active`, the step becomes active immediately.
- `IgrTabs`:
    - `alignment` works in the Material, Fluent and Indigo themes.
    - A tab that you select with its `selected` prop scrolls into view.
    - If you add a selected tab and remove the previous selected tab in the same render, the new tab stays selected.
    - Tabs that you remove before their first frame do not throw a `ResizeObserver` error.
- `IgrTileManager`: fixes for drag, resize, maximize, full screen, nested tile managers and right-to-left layouts.
- `IgrVirtualScroll`:
    - `scrollToIndex()` puts the item at the requested edge when the item size is different from the estimate.
    - On a hidden list, `scrollToIndex()` scrolls when the list becomes visible.
    - A property change on a detached virtual scroll does not throw.

#### Grids
- Enter in the grid UI does not submit a parent `<form>`. This applies to:
    - The filtering row, the cell and row editors, and the date pickers.
    - The hiding and pinning UI of the toolbar.
    - Excel-style filtering and advanced filtering.
    - `IgrQueryBuilder`, `IgrPivotDataSelector` and the default action of the grid snackbar.
- In Chromium-based browsers, style recalculation is as fast as in earlier versions. Filtering, grouping, editing and `isLoading` do not restyle the full page.
- The scrollbars use the theme colors again.
- If you set a writable property that is not an input, the component applies it. Examples: `selected` of `IgrColumn` and `totalPages` of `IgrPaginator`. Before, the component ignored the value and logged an `NG0303` error.
- Column autosizing fits the content:
    - When quick filtering is on.
    - For the child columns of a column layout.
    - In `IgrPivotGrid`.
- When a grid that is scrolled to its end grows, for example on resize, the rows and columns stay in the correct order. The visible content does not move by one item.
- Escape while you drag a column header over the group-by area does not group by that column.
- A canceled column move does not block the next move.
- If you copy with only columns selected, the grid copies their data. Before, the clipboard stayed empty and the grid threw an error.
- `navigateTo()` with a callback does not throw with remote virtualization.
- `findNext()`, `findPrev()` and navigation to a row on a different page scroll to the row.
- Sorting or grouping with `SortingDirection.None` does not remove the expression of a different column.
- With multiple cell selection, `Shift` + arrow keys at the edge of the grid keep the selection.
- Excel-style filtering:
    - Custom conditions are preselected before you enter a value.
    - With `minHeight` or `maxHeight`, the menu spacing uses `--ig-size`.
- After an edit, the cells of an uncommitted new row use the column formatting.
- CSV export of a grid with summaries does not add a `GRID_LEVEL_COL` column.
- A filter chip that is longer than its column shows an ellipsis.
- Borders are correct on pinned filter cells, row action cells, selected cells, the group-by indentation and multi-row layout cells.
- The grid does not log `igxOverlay.detach was called with wrong id` when you destroy it with an open advanced filtering dialog or date cell editor calendar.
- `IgrColumn`: `pin(index)` and `unpin(index)` do not throw when the target pinning area is empty or all columns are pinned.
- `IgrHierarchicalGrid`:
    - The advanced filtering dialog lists the row islands and fields with child data that loads on demand.
    - The dialog uses the column `header`, `filters`, `editorOptions` and formatting.
    - The dialog updates when the columns change.
    - `IgrGridState` restores the paging of child grids that are scrolled out of view.
- `IgrHierarchicalGrid`, `IgrTreeGrid`: these grids do not support multi-row layouts. Column layouts that you declare in them are not included in the columns.
- `IgrPivotDataSelector`: the aggregation drop-down of a value opens while the drop-down of a different value is open.
- `IgrPivotGrid`:
    - Horizontal row layout: `Ctrl` + arrow keys, `Home` and `End` do not throw. Collapsed and summary row headers fill the columns that they span.
    - A `pivotConfiguration` with `rows: null` does not throw.
- `IgrQueryBuilder`:
    - Keyboard reorder of conditions: `Space` drops the condition. `Enter` or `Space` before a drop location does not delete it. The keys do not scroll the page. `Tab` keeps the focus on the drop ghost.
    - A `time` field without `editorOptions` does not throw.
- `IgrRowIsland`:
    - A nested row island registers under its parent row island. The grid can find and clean up its child grids.
    - `expandChildren` also applies to child grids that are scrolled out of view.
    - `resourceStrings` returns the strings of the root grid when the row island has none.
- `IgrTreeGrid`:
    - If you set `data` with `autoGenerate` before you attach the grid, the grid does not throw.
    - `beginAddRowByIndex(0)` adds the row as the first record.
    - With `rowSelection` set to `multipleCascade`, `onRowSelectionChanging` does not occur if the selection does not change.
    - Excel-style filtering lists the column values with a custom strategy that extends `FilteringStrategy`.

#### Dock Manager
- A splitter resize that moves nothing, for example a click, does not raise `onLayoutChange`.
- The arrow keys on a splitter raise a cancelable `onSplitterResizeStart`.

#### Grid Lite
- `sortingExpressions` that you set before the first render:
    - Use the `sortConfiguration.comparer` and `sortingCaseSensitive` of the column.
    - Do not store `direction: 'none'` as a sort.
- The grid applies `filterExpressions` that you set before the first render, after `columns`.

### Security
- `IgrTileManager`: `loadLayout()` copies only the serialized tile properties. A layout from storage or a server cannot set `innerHTML` on a tile or change its prototype.

## 19.9.1 - 2026-11-05

### Fixed
- Render props ([#193](https://github.com/IgniteUI/igniteui-react/pull/193)):
    - Templates read current React state instead of the first render's closure.
    - Setting a render prop to `undefined` restores the element's default content. Grid components render nothing instead.
    - Adding a render prop later no longer clears the others.
    - Nested config objects, such as `IgrChat` `options`, keep their identity across renders and no longer re-render the element.
    - Template updates no longer re-set every element property, e.g. `singleSelect` on each `IgrCombo` filter keystroke.
    - React events raised in a template no longer fire the wrapper's handlers twice.
    - Errors and suspensions stay in their slot, e.g. one grid cell, instead of reaching the app's error boundary.
    - Async render props keep the previous content until the new one settles, and may return `PromiseLike<ReactNode>`.
    - Templates invoked without a data context no longer throw.

## 19.10.0 - 2026-10-05 (only igniteui-react-grids)

### Changed

- Updated published runtime dependencies
  - igniteui-webcomponents-grids: ~7.2.1 -> ~7.3.2

## 19.9.0 - 2026-09-28

### Added
- New components from igniteui-webcomponents 7.3 and 7.4 ([#198](https://github.com/IgniteUI/igniteui-react/pull/198), [#202](https://github.com/IgniteUI/igniteui-react/pull/202)):
  - `IgrBreadcrumbs` and `IgrBreadcrumb`
  - `IgrColorPicker`
  - `IgrQrCode`
  - `IgrVirtualScroll`

### Changed
- Updated published runtime dependencies ([#198](https://github.com/IgniteUI/igniteui-react/pull/198), [#202](https://github.com/IgniteUI/igniteui-react/pull/202)):
  - igniteui-webcomponents: ~7.2.1 -> ~7.4.1
  - igniteui-grid-lite: ~0.9.0 -> ~0.11.0
  - igniteui-dockmanager: ~2.1.2 -> ~2.2.1
- **Behavior change:** Popups of Combo, Color picker, Date pickers, Dropdown, Select and Tooltip now hide while their anchor is scrolled out of view. Set `scrollStrategy="scroll"` to keep the previous behavior. See the [igniteui-webcomponents changelog](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md) for all upstream changes.
- Skills:
    - Condensed all React skills to the framework-specific facts an agent cannot infer, cutting total size roughly in half. Reference files were consolidated (`COMPONENTS`, `USAGE`, `DATAVIZ`, `MCP`, `TROUBLESHOOTING`) and duplicated setup/theming guidance removed ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Documented MCP tools with their real named-argument schemas, including that doc tools take `framework` while API tools take `platform`, and added `get_project_setup_guide` ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Documented dark mode as a global switch driven by `--ig-theme-variant` plus `configureTheme()`, rather than a scopable set of custom properties ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Added the Grid Lite to premium grid migration skill to the skills README ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - **Breaking:** Renamed the `grid-lite-to-igr-grid-migration` skill to `igniteui-react-migrate-grid-lite-to-premium` to follow the `igniteui-react-` prefix used by the other skills. Reinstall it under the new folder name and remove the old one ([#201](https://github.com/IgniteUI/igniteui-react/pull/201)).
    - **Breaking:** Renamed each skill's `reference/` folder to `references/`. Reinstall the affected skills (`igniteui-react-components`, `igniteui-react-customize-theme`, `igniteui-react-generate-from-image-design`) so their links resolve ([#201](https://github.com/IgniteUI/igniteui-react/pull/201)).
    - Added `license: MIT` to every skill and rewrote the descriptions with explicit `WHEN TO USE:` and `WHEN NOT TO USE:` sections so agents pick the right skill ([#201](https://github.com/IgniteUI/igniteui-react/pull/201)).

### Fixed
- Added an `exports` map to `igniteui-react-grids` so bundlers and TypeScript resolve its entry points and typings ([#180](https://github.com/IgniteUI/igniteui-react/pull/180)).
- Skills:
    - Corrected the palette override mechanism: shades derive from the `500` shade (e.g. `--ig-primary-500`). The previously documented `--ig-primary-h` / `-s` / `-l` tokens do not exist and silently did nothing ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Removed `IgrGridModule.register()` from the grid migration guidance — module registration is deprecated and handled by the React wrapper on import ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Corrected the Excel/CSV exporter import path to `igniteui-react-grids` ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Replaced the non-existent `--ig-button-foreground` token example, and directed component-level theming at `get_component_design_tokens` or the `@cssproperty` annotations ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Corrected the form submit handler type to `React.FormEvent`, and event handler types to the generated `Igr*EventArgs` aliases ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Replaced the non-existent `get_theming_guidance` tool with `read_resource` ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).
    - Fixed a broken reference link in the components skill ([#192](https://github.com/IgniteUI/igniteui-react/pull/192)).

## 19.8.1 - 2026-07-13

### Changed
- Updated published grids dependency:
  - igniteui-webcomponents-grids: ~7.2.0 -> ~7.2.1

### Fixed
- Restored package distribution structure for correct npm package type declarations.

## 19.8.0 - 2026-07-09

### Added
- New Grid Lite to Premium Data Grid migration skill with end-to-end mapping guidance for imports, templates, sorting, filtering, server-side patterns, and toolbar/export flows ([#168](https://github.com/IgniteUI/igniteui-react/pull/168)).

### Changed
- Skills:
    - Refactored and streamlined React skills guidance to rely on MCP-backed documentation and API lookups for authoritative usage patterns ([#167](https://github.com/IgniteUI/igniteui-react/pull/167)).
    - Updated image-to-React generation guidance to canonical MCP call forms, including list_components('react') and get_doc('react', '<name>') ([#167](https://github.com/IgniteUI/igniteui-react/pull/167), [#170](https://github.com/IgniteUI/igniteui-react/pull/170)).
    - Improved theme-customization skill workflow to emphasize safer sequencing for palette/theme/typography/elevations and explicit token discovery before overrides ([#167](https://github.com/IgniteUI/igniteui-react/pull/167)).
- Updated published runtime dependencies ([#178](https://github.com/IgniteUI/igniteui-react/pull/178)):
  - igniteui-grid-lite: ~0.8.0 -> ~0.9.0
  - igniteui-webcomponents-grids: ~7.1.0 -> ~7.2.0

### Fixed
- Skills:
    - Corrected NavDrawer CSS custom property naming in skill guidance and gotchas references ([#169](https://github.com/IgniteUI/igniteui-react/pull/169)).
    - Added explicit grid column-width guidance to avoid fixed-width layouts with trailing empty space unless widths are explicitly requested ([#170](https://github.com/IgniteUI/igniteui-react/pull/170)).
    - Applied follow-up review fixes across skills documentation to reduce ambiguity and incorrect API usage patterns ([#170](https://github.com/IgniteUI/igniteui-react/pull/170)).
