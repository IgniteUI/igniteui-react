# Contributor Skills

Workflows for contributors to this repository. End-user skills live in [`skills/`](../../skills/).

- The contribution workflow and commit conventions live in
  [CONTRIBUTING.md](../../.github/CONTRIBUTING.md), and the lint and format rules in
  [biome.json](../../biome.json). A skill says in what order to apply them. When a skill and
  those files disagree, they win and the skill needs a fix.
- The repository layout, commands and generated folders are summarized in
  [`.agents/context/project.md`](../context/project.md).

## Skills

| Skill                                 | Use when                    |
| ------------------------------------- | --------------------------- |
| [skill-authoring](./skill-authoring/) | Writing or updating a skill |

Reference a skill by name: "Follow the skill-authoring skill to add a date picker skill."

## Adding a skill

Skills use the
[VS Code agent skills format](https://code.visualstudio.com/docs/copilot/customization/agent-skills):

Follow the [skill-authoring](./skill-authoring/SKILL.md) skill for the frontmatter rules, the
description format and the size budget. In short:

1. Create `.agents/skills/[skill-name]/SKILL.md`. The directory name is kebab-case and
   matches `name`.
2. Add frontmatter with `license`, `name` and `description`. The description has
   `WHEN TO USE:` and `WHEN NOT TO USE:` markers. Optional keys: `user-invocable`,
   `argument-hint`, `compatibility`, `disable-model-invocation`, `metadata`.
3. Link to CONTRIBUTING.md and the project context for rules. Do not copy them.
4. Add the skill to the table above and to the Workflow section of
   [`.agents/context/project.md`](../context/project.md).
