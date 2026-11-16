## 19.11.0 - 2026-11-17

This release moves to igniteui-webcomponents 7.5.0, igniteui-webcomponents-grids 7.4.0 (built from Ignite UI for Angular 22.3), igniteui-dockmanager 2.3.0, igniteui-grid-lite 0.12.0 and igniteui-i18n 2.0. The entries below cover the changes that reach the React packages. For every upstream change, see the [igniteui-webcomponents](https://github.com/IgniteUI/igniteui-webcomponents/blob/master/CHANGELOG.md), [Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular/blob/master/CHANGELOG.md) (22.2.1 to 22.3.0, grids), [igniteui-dockmanager](https://github.com/IgniteUI/igniteui-dockmanager/blob/master/CHANGELOG.md) and [igniteui-grid-lite](https://github.com/IgniteUI/igniteui-grid-lite/blob/master/CHANGELOG.md) changelogs.

### Added
- Components:
    - `IgrCombo`:
        - Remote data: set `filteringOptions.mode` to `'remote'` to turn off the local filter, search on the server from `onSearchInput` (`detail.searchText`) and set `data` to the results. `onDataRequest` asks for more items when the user scrolls near the end of `data`. `totalItemCount` shows a placeholder for each item that is not loaded, and `loading` shows a spinner. `bindComboDataSource()` from `igniteui-webcomponents/extras/combo-data-source` connects a combo to a server that searches and pages.
        - `showSelectAll` adds a "Select all" option in multiple selection. `selectAllItems()` and `deselectAllItems()` do the same from code.
        - `groupSelection` makes each group header an option that selects or deselects the shown items of its group.
        - `selectionCommit="confirm"` holds the user's changes while the list is open. Each toggle raises a cancelable `onPendingChange`, and Enter or the Apply button commits them with one `onChange`. A custom footer can use `pendingValue`, `commitSelection()` and `cancelSelection()`.
        - `onClosing` and `onClosed` report the `trigger` of the close, such as `enter`, `escape`, `outside-click` or `apply` (`IgrComboClosingEventArgs`).
        - The `groupHeaderTemplate` render prop receives `key`, the `groupKey` value of the group.
    - `IgrTabs`: `headerPosition` places the headers in a column at the `start` or `end` of the panels.
    - `IgrTab`: with `href`, the header renders as a link. `onNavigate` is raised before the link is followed; cancel it to route on the client.
    - `IgrChat`: `focusInput()` moves the focus to the text area. `onNavigate` is raised before a message link opens in the same tab; cancel it to route on the client.
    - `IgrTooltip`: `showAt()` shows the tooltip at a point or a rectangle in viewport coordinates, for example at the pointer over a canvas.
    - `IgrQrCode`: `copyToClipboard()` copies the code as a PNG image, or as SVG and PNG images.
    - `IgrFileInput`: `directory` lets the user select a folder.
    - `IgrDropdown`: `header` and `footer` slots for content before and after the items, such as a search field or action buttons.
    - `IgrAccordion`, `IgrExpansionPanel`, `IgrTabs`, `IgrTree`: the browser's find-in-page and links to an element now find content in collapsed panels, unselected tabs and collapsed tree items, and reveal it. The browser must support `hidden="until-found"`.
    - `IgrCalendar`, `IgrDatePicker`, `IgrDateRangePicker`: an optional `label` on a `DateRangeDescriptor` is added to the accessible name of the matching special and disabled dates.
    - `IgrDatePicker`, `IgrDateTimeInput`, `IgrInput`, `IgrMaskInput`, `IgrTextarea`: read-only `selectionStart` and `selectionEnd`.
    - Localization: `IgrColorPicker`, `IgrDialog`, `IgrSplitter`, `IgrTile` and `IgrTooltip` have `locale` and `resourceStrings`. `IgrChat` and `IgrTileManager` have `locale`.
    - ARIA: `aria-expanded`, `aria-haspopup` and `aria-controls` on `IgrButton`, `IgrChip` and `IgrIconButton` go to the inner button, and `aria-pressed` makes `IgrButton` and `IgrIconButton` toggle buttons. `IgrInput`, `IgrTextarea`, `IgrMaskInput`, `IgrDateTimeInput` and `IgrFileInput` pass `role="combobox"` and its ARIA attributes to the native field.
    - Form controls: `--ig-helper-min-lines` keeps space for 1 to 3 lines of helper or validation text below a control.
    - `IgrTileManager`: `--grid-padding` sets the padding of the grid.
    - Theming: the `igc-theme-material`, `igc-theme-bootstrap`, `igc-theme-indigo` and `igc-theme-fluent` export conditions keep only one theme in the bundle, which is approximately 15–17% smaller after gzip. See "Bundling a single theme" in the igniteui-webcomponents README.
- Grids:
    - `IgrGrid`, `IgrTreeGrid`, `IgrHierarchicalGrid`, `IgrPivotGrid`, `IgrRowIsland`: `validationTooltipTrigger` controls when the validation tooltip of an invalid cell shows: `active` (default) when the cell becomes active or on error icon hover, or `hover` only on error icon hover. New type: `GridValidationTooltipTrigger`.
    - `IgrQueryBuilder`: Escape cancels a mouse drag of a condition.
- `IgrDockManager`: a handle where two splitters meet resizes the panes in both directions. Style it with the `splitter-junction` part. Its accessible name is the `resizePanes` resource string.

### Changed
- Updated published runtime dependencies ([#230](https://github.com/IgniteUI/igniteui-react/pull/230), [#231](https://github.com/IgniteUI/igniteui-react/pull/231)):
  - igniteui-webcomponents: ~7.4.1 -> ~7.5.0
  - igniteui-webcomponents-grids: ~7.3.2 -> ~7.4.0-beta.2
  - igniteui-dockmanager: ~2.2.1 -> ~2.3.0
  - igniteui-grid-lite: ~0.11.0 -> ~0.12.0
- All packages now use `igniteui-i18n-core` 2.0. If you register languages from `igniteui-i18n-resources`, update it to 2.0 too.
- **Breaking:** The components and the grids take their surface color from `--ig-surface-base`, not from `--ig-surface-500`. The themes also define `--ig-surface-raised`, `--ig-surface-overlay`, `--ig-surface-sunken` and `--ig-surface-container`. To change the surface at runtime, set these roles. `--ig-surface-500` no longer affects the components.
- **Breaking:** `IgrDialog`, `IgrDatePicker`, `IgrDateRangePicker`: the dialog backdrop is the native `::backdrop` in the top layer, so it covers the full page. The `backdrop` and `animating` parts of the dialog and the `overlay` part of the date pickers in dialog mode are removed. Style `igc-dialog::part(base)::backdrop`, or `::part(dialog-base)::backdrop` on a date picker.
- **Behavior change:** `IgrDatePicker`, `IgrDateRangePicker`, `IgrDateTimeInput`: `onChange` is raised only for changes of the user. A `value` set from code, as well as `clear()`, `stepUp()`, `stepDown()`, `setRangeText()`, `select()` and a form reset, no longer raises it on the next blur or on Done. The `clear()` of the date pickers still raises it.
- **Behavior change:** `IgrCombo`:
    - A new `data` keeps the selection. Selected values that the new `data` does not hold stay selected. To clear the selection with the data, for example in cascading combos, set `value` to `[]`.
    - When `data` holds two or more items with the same value, the selection holds the first item, and `value` lists the value once.
    - In multiple selection, the options report their state in `aria-checked`, not in `aria-selected`.
- **Behavior change:** `IgrCalendar`, `IgrChat`, `IgrColorPicker`, `IgrCombo`: the events of their inner elements no longer bubble out. Use the events of the component: `onInputChange` and `onAttachmentRemoved` of `IgrChat`, and `onSearchInput` and `onDataRequest` of `IgrCombo`.
- **Behavior change:** Form controls: Enter in a text field submits the form as a native field does. It clicks the first submit button of the form, so that button is the `submitter` and a click handler can stop the submission. A form without a submit button submits only when it has one text field.
- **Behavior change:** Localization: a component without `locale` inherits it from its own `lang`, then from the `locale` or `lang` of the nearest ancestor, then from the global locale. So `lang` on `<body>` or on a section now overrides `setCurrentI18n()` for the components in it; set `locale` on a component to keep a different locale. The components no longer register their English strings, so `getCurrentResourceStrings()` returns only the strings that you register.
- **Behavior change:** `IgrCarousel` takes the height of its tallest slide, not the height of its parent. Set `height` or `max-height` on it for a fixed height.
- **Behavior change:** `IgrDateRangePicker`: "Last 7 Days" selects 7 days, today and the 6 days before it. In dialog mode, Done raises `onChange` after `onClosing`, and a canceled `onClosing` keeps the dialog open.
- **Behavior change:** `IgrDatePicker`, `IgrDateRangePicker`: in dialog mode, the pickers fade in and out. `onOpened` and `onClosed` are raised after the animation, and `open` stays `true` until the exit ends.
- **Behavior change:** `IgrNavDrawer`: in Firefox and Safari, a drawer at an edge slides out as in Chromium. `hide()` and `toggle()` resolve, and `onClosed` is raised, after the exit.
- **Behavior change:** `IgrHighlight`: the match colors come only from its `--background`, `--foreground`, `--background-active` and `--foreground-active`. It searches again when its content changes, so you no longer call `search()`.
- **Behavior change:** `IgrSplitter`: a change of `orientation` keeps the sizes and the minimum and maximum sizes that you set.
- **Behavior change:** `IgrTileManager`: a tile no longer spans past the last column. The tile manager no longer inherits `--column-count` and `--grid-gap` from an ancestor; set them on the tile manager.
- **Behavior change:** `IgrTreeGrid`: `beginAddRowByIndex(index, true)` adds a child of the row at `index`, as documented. Before, it added a child of the row at `index - 1`.
- **Behavior change:** Grids: `filter()` without a condition, for a column without filtering expressions, now throws, even when an `onFiltering` handler sets expressions.
- Grids: the grid, toolbar, paginator, column actions, Excel-style filtering and query builder themes no longer pick up `--background`, `--foreground` or `--accent-color` from an ancestor or from `:root`.
- `IgrChat`: the message area follows new messages only while it is at the bottom. The Markdown renderer of `createChatMarkdownRenderer()` from `igniteui-react/extras` loads `shiki` only when highlighting is on, opens links to another origin in a new tab, and applies `colorReplacements` to every theme. `marked-shiki` is no longer needed, and `shiki` must be 4.5.0 or later.
- Tree items, list items and chat messages far from the view skip their rendering (`content-visibility: auto`), so long lists render faster. The `innerText` of a skipped item is an empty string; use `textContent`.
- `IgrSnackbar`, `IgrToast`: the display time pauses while the pointer or the focus is on the component. `show()` on an open component starts the display time again.
- `IgrTextarea`: with `resize="auto"`, browsers that support CSS `field-sizing` size the control to its content. A `max-height` on the `input` part no longer includes the padding and the border.
- `IgrAvatar`, `IgrBadge`, `IgrCarouselSlide` no longer set `aria-roledescription`.
- `IgrChip`: the `end` slot renders after the `suffix` slot.
- A component no longer defines its tag when another copy of igniteui-webcomponents has already defined it. It writes one warning to the console.
- All the components together are approximately 6% smaller after gzip. igniteui-webcomponents has a new runtime dependency, `tslib`.

### Deprecated
- `IgrCombo`: the `item` of the group header template context. Use `key`.
- The numbered surface shades, such as `--ig-surface-500`. Use the surface roles.

### Fixed
- Components:
    - `IgrCombo`, `IgrDropdown`, `IgrHighlight`, `IgrSelect`: setting a property to its current value no longer resets their state. A re-render that passes the same props no longer clears the search text of the combo, moves the active item, or moves the active match of the highlight back to the first match.
    - `focus()` right after a component mounts moves the focus to it after its first render. Before, the call did nothing, and in `IgrCheckbox`, `IgrRadio`, `IgrSelect` and `IgrSwitch` it threw a `TypeError`.
    - Form controls: a failed submit or `form.reportValidity()` moves the focus to the first invalid control. The `invalid` event comes only from `checkValidity()`, `reportValidity()` or a failed submit, not while the user edits. `validationMessage` uses the strings and formats of the locale.
    - `IgrInput`: `pattern` must match the full value, as in a native input.
    - `IgrSlider`, `IgrRangeSlider`: a value snaps to the nearest step from `min`, and the order of `value`, `lower`, `upper`, `min`, `max` and `step` no longer changes the result. A drag raises one `onChange`, and the thumb label is no longer cut by a container that clips its overflow.
    - `IgrTabs`: `alignment` works in the Material, Fluent and Indigo themes. A tab selected through its `selected` prop scrolls into view. A tab added as selected keeps the selection when the previous selected tab is removed in the same render. Tabs removed before their first frame no longer throw a `ResizeObserver` error.
    - `IgrDialog`: a dialog that is moved, or removed and appended again, keeps its state.
    - `IgrStepper`: a click in the content of a step no longer activates the step. The content of an inactive step is `inert`. Setting `active` activates the step at once.
    - `IgrTileManager`: fixes to drag, resize, maximize, full screen, nested tile managers and right-to-left layouts.
    - `IgrVirtualScroll`: `scrollToIndex()` puts the item at the requested edge when its size differs from the estimate, and on a hidden list it scrolls when the list shows. A property change on a detached virtual scroll no longer throws.
    - `IgrChat`: the chat no longer leaks one object URL per attached file on each render. Attachments with an image MIME type render as images, and the file picker attaches only the files that `acceptedFiles` allows.
    - `IgrQrCode`: codes of versions 30 to 40 follow ISO/IEC 18004, so scanners read them.
    - The `z-index` values of the component parts stay inside each component, so they no longer show through a sticky page header.
    - Host `aria-label`, `aria-labelledby` and `aria-describedby` name and describe the inner element that has the role.
- Grids:
    - Enter in the grid UI, such as the filtering row, the cell and row editors, the toolbar hiding and pinning, Excel-style filtering, advanced filtering and the date pickers, no longer submits a surrounding `<form>`. The same applies to `IgrQueryBuilder`, `IgrPivotDataSelector` and the default action of the grid snackbar.
    - Restored the style recalculation performance of earlier versions in Chromium-based browsers. Filtering, grouping, editing and `isLoading` no longer restyle the whole page. The scrollbars use the theme colors again.
    - Setting a writable property that is not an input, such as `selected` of `IgrColumn` or `totalPages` of `IgrPaginator`, now applies it. Before, the value was ignored and an `NG0303` error was logged.
    - `IgrTreeGrid`: setting `data` with `autoGenerate` before the grid is attached no longer throws. `beginAddRowByIndex(0)` adds the row as the first record. With `rowSelection` set to `multipleCascade`, `onRowSelectionChanging` is no longer raised when the selection does not change. Excel-style filtering lists the column values with a custom strategy that extends `FilteringStrategy`.
    - `IgrRowIsland`: a nested row island is registered under its parent row island, so its child grids are found and cleaned up. `expandChildren` also applies to child grids scrolled out of view. `resourceStrings` returns the strings of the root grid when the row island has none.
    - `IgrHierarchicalGrid`: the advanced filtering dialog lists the row islands and fields whose child data loads on demand, takes the column `header`, `filters`, `editorOptions` and formatting, and updates when columns change. `IgrGridState` restores the paging of child grids scrolled out of view.
    - `IgrTreeGrid`, `IgrHierarchicalGrid`: column layouts declared in these grids, which do not support multi-row layouts, are excluded from the columns.
    - Column autosizing fits the content with quick filtering enabled, for the child columns of a column layout, and in `IgrPivotGrid`.
    - Growing a grid that is scrolled to its end, for example by resizing it, no longer renders the rows or columns out of order or shifts the visible content by one item.
    - Escape while dragging a column header over the group-by area no longer groups by that column. A canceled column move no longer blocks the next one.
    - Copying with only columns selected copies their data. Before, the clipboard stayed empty and an error was thrown.
    - `pin(index)` and `unpin(index)` of `IgrColumn` no longer throw when the target pinning area is empty or all columns are pinned.
    - `navigateTo()` with a callback no longer throws with remote virtualization. `findNext()`, `findPrev()` and navigating to a row on another page scroll to the row.
    - Sorting or grouping with `SortingDirection.None` no longer removes the expression of another column.
    - With multiple cell selection, `Shift` + arrow keys at the edge of the grid no longer lose the selection.
    - Excel-style filtering preselects custom conditions before a value is entered, and its menu spacing follows `--ig-size` with `minHeight` or `maxHeight`.
    - Cells of an uncommitted new row apply the column formatting after editing.
    - `IgrPivotGrid`: in the horizontal row layout, `Ctrl` + arrow keys, `Home` and `End` no longer throw, and collapsed and summary row headers fill the columns they span. A `pivotConfiguration` with `rows: null` no longer throws. `IgrPivotDataSelector`: the aggregation drop-down opens for another value while one is open.
    - `IgrQueryBuilder`: when reordering with the keyboard, `Space` drops the condition, `Enter` or `Space` before a drop location no longer deletes it, the keys no longer scroll the page, and `Tab` keeps the focus on the drop ghost. A `time` field without `editorOptions` no longer throws.
    - CSV export of a grid with summaries no longer adds a `GRID_LEVEL_COL` column.
    - Filter chips longer than their column are truncated with an ellipsis. Border fixes for pinned filter cells, row action cells, selected cells, the group-by indentation and multi-row layout cells.
    - Destroying a grid while its advanced filtering dialog, or the calendar of a date cell editor, is open no longer logs `igxOverlay.detach was called with wrong id`.
- `IgrDockManager`: a splitter resize that moves nothing, such as a click, no longer raises `onLayoutChange`. The arrow keys on a splitter raise a cancelable `onSplitterResizeStart`.
- `IgrGridLite`: `sortingExpressions` set before the first render use the `sortConfiguration.comparer` and `sortingCaseSensitive` of the column, and no longer store `direction: 'none'` as a sort. `filterExpressions` set before the first render, after `columns`, are applied.

### Security
- `IgrTileManager`: `loadLayout()` copies only the serialized tile properties, so a layout from storage or a server can no longer set `innerHTML` on a tile or change its prototype.

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
