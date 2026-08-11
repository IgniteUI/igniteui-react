# Agent Skills for Ignite UI for React

Task-focused instructions that help AI coding agents use **Ignite UI for React** correctly — component selection, setup, theming, performance, and migration. Each skill is self-contained and framework-specific.

## Available skills

| Skill | Use when |
| --- | --- |
| [igniteui-react-components](./igniteui-react-components/SKILL.md) | Choosing an `Igr*` component, setting up `igniteui-react`, writing JSX, wiring events/refs/forms, or debugging components that render unstyled or invisible |
| [igniteui-react-customize-theme](./igniteui-react-customize-theme/SKILL.md) | Applying brand colors, switching light/dark, overriding component appearance |
| [igniteui-react-optimize-bundle-size](./igniteui-react-optimize-bundle-size/SKILL.md) | The bundle is too large, or grids/charts are in the initial chunk |
| [igniteui-react-generate-from-image-design](./igniteui-react-generate-from-image-design/SKILL.md) | Building a view from a screenshot, mockup, or wireframe |
| [grid-lite-to-igr-grid-migration](./grid-lite-to-igr-grid-migration/SKILL.md) | Grid Lite lacks a needed feature — editing, selection, paging, grouping, export |

Agents pick a skill from the request, so ordinary questions are enough: *"add a data grid to my React app"*, *"build this dashboard screenshot"*, *"match our brand colors"*, *"my bundle is too large"*. Naming a skill directly also works: *"use the igniteui-react-customize-theme skill"*.

## MCP servers

Two optional MCP servers make the agent's answers authoritative rather than recalled:

- **`igniteui-cli`** — component docs and API reference (`list_components`, `get_doc`, `get_api_reference`, `search_docs`, `search_api`)
- **`igniteui-theming`** — palette, typography, elevation, and per-component theme generation

Every skill works without them, falling back to the type declarations in `node_modules`. Setup instructions are in [igniteui-react-components/reference/MCP.md](./igniteui-react-components/reference/MCP.md) and the theming skill.

## Installation

Copy the skill folders into the directory your agent reads:

| Agent | Directory |
| --- | --- |
| Claude Code | `.claude/skills/` |
| GitHub Copilot | `.agents/skills/` |
| Cursor, Windsurf, others | see the agent's documentation |

Keep each skill's `SKILL.md` alongside its `reference/` folder — the reference files are loaded on demand and the relative links between skills assume the layout is preserved.

```
.claude/skills/
  igniteui-react-components/{SKILL.md,reference/}
  igniteui-react-customize-theme/{SKILL.md,reference/}
  igniteui-react-optimize-bundle-size/SKILL.md
  igniteui-react-generate-from-image-design/{SKILL.md,reference/}
  grid-lite-to-igr-grid-migration/SKILL.md
```
