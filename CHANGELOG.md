## Unreleased

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
