# Ignite UI for React Dock Manager - from Infragistics

[![npm version](https://badge.fury.io/js/igniteui-react-dockmanager.svg)](https://badge.fury.io/js/igniteui-react-dockmanager)
[![Discord](https://img.shields.io/discord/836634487483269200?logo=discord&logoColor=ffffff)](https://discord.gg/39MjrTRqds)

[Ignite UI React Dock Manager](https://www.infragistics.com/products/ignite-ui-react) provides means to manage the layout of your application through panes, allowing your end-users to customize it further by pinning, resizing, moving and hiding panes.

![Dock Manager](https://github.com/IgniteUI/igniteui-webcomponents/assets/52001020/a9643f17-f1c2-4554-87aa-96c9daea13b0)

Provide a complete windowing experience, splitting complex layouts into smaller, easier-to-manage panes.

## Browser Support

| ![Chrome](https://user-images.githubusercontent.com/2188411/168109445-fbd7b217-35f9-44d1-8002-1eb97e39cdc6.png) | ![Firefox](https://user-images.githubusercontent.com/2188411/168109465-e46305ee-f69f-4fa5-8f4a-14876f7fd3ca.png) | ![Edge](https://user-images.githubusercontent.com/2188411/168109472-a730f8c0-3822-4ae6-9f54-785a66695245.png) | ![Opera](https://user-images.githubusercontent.com/2188411/168109520-b6865a6c-b69f-44a4-9948-748d8afd687c.png) | ![Safari](https://user-images.githubusercontent.com/2188411/168109527-6c58f2cf-7386-4b97-98b1-cfe0ab4e8626.png) |
| --------------- | ---------------- | ------------- | -------------- | --------------- |
| Latest ✔️       | Latest ✔️        | Latest ✔️     | Latest ✔️      | Latest ✔️       |

## View Samples and Documentation

[React Dock Manager Overview](https://www.infragistics.com/products/ignite-ui-react/react/components/layouts/dock-manager)

### Key Features

- Dockable panes with drag-and-drop support
- Pinning, resizing, moving, and hiding panes
- Floating panes with window-like behavior
- Tab groups for organizing related content
- Nested docking for complex layouts
- Save and restore layout state
- Fully customizable appearance and behavior

## AI-Assisted Development
 
Ignite UI for React provides a toolchain to enhance the AI coding workflow — **Agent Skills**, the **Ignite UI CLI MCP server**, the **Ignite UI Theming MCP server**, and the **MAKER MCP server** — that grounds AI coding assistants in correct component APIs, import paths, and design tokens.
 
| Component | What it provides |
|:----------|:----------------|
| **Agent Skills** | Structured specialized knowledge and workflow files: import paths, component patterns, decision flows, generate from image design |
| **CLI MCP server** (`igniteui-cli`) | Documentation queries, API reference, project scaffolding tools via MCP |
| **Theming MCP server** (`igniteui-theming`) | Design tokens, palette tools, CSS custom property generation, WCAG AA contrast validation |
| **MAKER MCP server** (`@igniteui/maker-mcp`) | Multi-agent orchestration: decomposes complex tasks into validated, executable step plans |
 
> **Note:** All AI toolchain commands require Ignite UI CLI 15.0.0 or newer.
 
### Add AI toolchain to an existing project
 
Run this command from the root of your project:
 
```bash
ig ai-config
```

> If the Ignite UI CLI is not installed globally, run `npm install -g igniteui-cli`.
 
This adds Agent Skills and instructions to agent discovery path(s) and configures MCP server entries. 
 
### Start a new project with AI toolchain
 
Run the Ignite UI CLI to scaffold a new React project with the AI toolchain configured from the start:
 
```bash
ig new
```
 
> If the Ignite UI CLI is not installed globally, run `npm install -g igniteui-cli`.
 
### Agent Skills
 
Ignite UI for React ships with **Agent Skills** — structured knowledge files that tell AI coding assistants exactly how to use Ignite UI for React. The skill files are included in the [`igniteui-react`](https://www.npmjs.com/package/igniteui-react) package and also live in the [`skills/`](https://github.com/IgniteUI/igniteui-react/tree/master/skills) directory.
 
| Skill | Description |
|:------|:------------|
| **components** | Identify the right React components (`Igr*`) for a UI pattern, then install, import, and use them — JSX patterns, events, refs, forms, Next.js setup |
| **customize-theme** | Customize styling using CSS custom properties, Sass, and the theming system in React |
| **optimize-bundle-size** | Reduce bundle size with granular imports, tree-shaking, and lazy loading |
| **generate-from-image-design** | Turn a screenshot, mockup, or wireframe into a React view using Ignite UI components, MCP-guided theming, and screenshot-first layout matching |
 
When a Skill is active in the AI client, the agent follows the Skill instead of relying on general training data — which may reference outdated API signatures or import paths.
 
For full setup instructions, see the [AI-Assisted Development documentation](https://www.infragistics.com/products/ignite-ui-react/react/components/ai-assisted-development-overview).

## License

This is a commercial product, requiring a valid paid-for license for use. License details can be found [here](https://www.infragistics.com/legal/license).

To acquire a license for usage, please register for a trial and acquire a license at [Infragistics.com](https://www.infragistics.com).

(c) Copyright 2026 Infragistics. All Rights Reserved. The Infragistics Ultimate license & copyright applies to this distribution. For information on that license, please go to our website [here](https://www.infragistics.com/legal/license).
