# LLM Agent Skills for Ignite UI for React

This directory contains skills for GitHub Copilot and other LLM agents to help developers use **Ignite UI for React** effectively in their applications.

## What are Skills?

Skills are structured instructions that help AI agents understand and execute common tasks consistently. Each skill is a self-contained guide that provides step-by-step instructions, code examples, and best practices — all specific to React and the `igniteui-react` family of packages.

## Available Skills

| Skill | Description | Use When |
| --- | --- | --- |
| [igniteui-react-components](./igniteui-react-components/SKILL.md) | Identify the right React components (`Igr*`) for a UI pattern, then install, import, and use them — JSX patterns, events, refs, forms | Choosing components or setting up and using them in React |
| [igniteui-react-customize-theme](./igniteui-react-customize-theme/SKILL.md) | Customize styling using CSS custom properties, Sass, and the theming system in a React context | Applying custom brand colors/styles |
| [igniteui-react-optimize-bundle-size](./igniteui-react-optimize-bundle-size/SKILL.md) | Reduce bundle size with granular imports, tree-shaking, and lazy loading | Optimizing production performance |

## How to Use

When working with an AI agent like GitHub Copilot, reference skills by name or ask questions naturally:

### Natural Questions

- "How do I add a data grid to my React app?"
- "What Ignite UI component should I use for a date picker?"
- "Help me customize the button colors to match my brand"
- "My bundle size is too large, how can I reduce it?"
- "How do I handle events on IgrCombo?"

### Direct Skill Reference

- "Follow the igniteui-react-components skill for setting up my project"
- "Use the igniteui-react-customize-theme skill to help me style components"
- "Apply the igniteui-react-optimize-bundle-size skill to reduce my bundle"

## Skill Structure

Each skill contains:

- **Example Usage**: Common questions or scenarios
- **When to Use**: Situations where the skill applies
- **Related Skills**: Other relevant skills to explore
- **Step-by-Step Instructions**: Detailed guidance with code examples
- **Common Issues & Solutions**: Troubleshooting guidance
- **Best Practices**: Recommended approaches
- **Additional Resources**: Further reading and documentation

## Editor / Agent Setup

Most modern AI assistants (GitHub Copilot, Cursor, Windsurf, etc.) should auto-discover these skills from your `node_modules/igniteui-react/skills/` directory after you install the package. No additional configuration is typically needed.

If your AI assistant doesn't auto-discover the skills, or you want to provide additional context, you can reference them manually:

### GitHub Copilot (Optional)

If you want to provide explicit instructions to GitHub Copilot, you can add a `.github/copilot-instructions.md` file to **your project root**:

```markdown
## Ignite UI for React

This project uses Ignite UI for React. When answering questions about UI components,
refer to the skills in node_modules/igniteui-react/skills/:

- **Components (choosing & using)**: node_modules/igniteui-react/skills/igniteui-react-components/SKILL.md
- **Theming & styling**: node_modules/igniteui-react/skills/igniteui-react-customize-theme/SKILL.md
- **Bundle optimization**: node_modules/igniteui-react/skills/igniteui-react-optimize-bundle-size/SKILL.md

All components use the `Igr` prefix (e.g. `IgrButton`, `IgrGrid`).
```

### Cursor / Windsurf (Optional)

If you want to provide explicit instructions, create or edit `.cursorrules` in **your project root**:

```
This project uses Ignite UI for React.
When working with UI components, consult the skills in node_modules/igniteui-react/skills/:

- node_modules/igniteui-react/skills/igniteui-react-components/SKILL.md — pick components and use them in React
- node_modules/igniteui-react/skills/igniteui-react-customize-theme/SKILL.md — theming and styling
- node_modules/igniteui-react/skills/igniteui-react-optimize-bundle-size/SKILL.md — bundle optimization

Components use the Igr prefix (IgrButton, IgrGrid, IgrCombo, etc.).
```

### Claude Desktop / Claude Code (Optional)

Add to your `CLAUDE.md` project instructions if needed:

```markdown
## Ignite UI for React

This project uses Ignite UI for React. Refer to these skills for guidance:

- node_modules/igniteui-react/skills/igniteui-react-components/SKILL.md
- node_modules/igniteui-react/skills/igniteui-react-customize-theme/SKILL.md
- node_modules/igniteui-react/skills/igniteui-react-optimize-bundle-size/SKILL.md

All React wrapper components use the `Igr` prefix (e.g. `IgrButton`, `IgrGrid`).
```

### Manual Attachment (All Editors)

You can also attach individual skill files to your AI chat context manually:

1. Open the AI chat panel (Copilot Chat, Cursor Chat, etc.)
2. Use the "Attach file" or "Add context" action
3. Navigate to `node_modules/igniteui-react/skills/` and select the relevant `SKILL.md` file

## Contributing

If you identify gaps in the skills or have suggestions for improvements:

1. [Open an issue](https://github.com/IgniteUI/igniteui-react/issues) describing the improvement
2. Submit a pull request with the proposed changes
3. Follow the skill format and structure of existing skills

## Additional Resources

- [Ignite UI for React Documentation](https://www.infragistics.com/products/ignite-ui-react/react/components/general-getting-started)
- [React Examples Repository](https://github.com/IgniteUI/igniteui-react-examples)
- [npm: igniteui-react](https://www.npmjs.com/package/igniteui-react)
- [GitHub Repository](https://github.com/IgniteUI/igniteui-react)

## License

These skills are provided under the same license as the Ignite UI for React library. See [LICENSE](../LICENSE) for details.
