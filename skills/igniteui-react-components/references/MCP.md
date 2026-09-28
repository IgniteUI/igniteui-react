# Ignite UI CLI MCP Server

Provides authoritative component docs and API reference. Prefer it over recall for prop, slot, event, and enum names.

## Tools

All tools take a named-argument object. **The platform argument is named differently across tools** — doc tools use `framework`, API tools use `platform`. Both accept `angular | react | webcomponents | blazor`; always pass `react`.

| Tool | Arguments |
|---|---|
| `list_components` | `framework`, `filter?` (substring over name/keywords/summary) |
| `get_doc` | `framework`, `name` (kebab-case doc name from `list_components`/`search_docs`, no `.md`) |
| `search_docs` | `query` (full-text; `grid*` prefix matching supported), `framework` |
| `search_api` | `query`, `platform?` (omit to search all platforms) |
| `get_api_reference` | `platform`, `component`, `section?` (`properties \| methods \| events \| all`), `member?` |
| `get_project_setup_guide` | `framework?` |

```
list_components({ framework: 'react', filter: 'date' })
get_doc({ framework: 'react', name: 'grid-editing' })
get_api_reference({ platform: 'react', component: 'IgrCombo', section: 'events' })
search_api({ query: 'row selection', platform: 'react' })
```

Pass the doc `name` field from `list_components` to `get_doc`, not the human-readable title. Use `section` on `get_api_reference` to keep responses small. Narrow filters beat broad ones — `filter: 'list view'` rather than `'list'`.

## Setup

If `list_components` is unavailable, add the server config, then tell the user to reload the editor so the tools activate. Do not block on it — this skill works without MCP; fall back to the installed `.d.ts` files under `node_modules/igniteui-webcomponents/components/` and `node_modules/igniteui-webcomponents-grids/grids/lib/`, which carry `@slot`, `@csspart`, `@fires`, and `@cssproperty` annotations.

VS Code — `.vscode/mcp.json`:

```json
{
  "servers": {
    "igniteui-cli": { "command": "npx", "args": ["-y", "igniteui-cli", "mcp"] }
  }
}
```

Cursor (`.cursor/mcp.json`) and Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json` on Windows, `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS) use the same entry under an `mcpServers` key instead of `servers`. JetBrains: **Settings → Tools → AI Assistant → MCP Servers**, command `npx`, arguments `-y igniteui-cli mcp`.

`npx -y` resolves whether or not `igniteui-cli` is already installed locally.
