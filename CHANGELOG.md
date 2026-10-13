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
