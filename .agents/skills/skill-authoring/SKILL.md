---
license: MIT
name: skill-authoring
description: "Provides rules for writing or updating a SKILL.md in this repository: frontmatter validation for license, name and description, the WHEN TO USE and WHEN NOT TO USE description format, the 500-line body budget with progressive disclosure into reference files, and the extra constraints on public skills that ship in the igniteui-react package. WHEN TO USE: creating a new skill under .agents/skills/ or skills/, or editing an existing skill's frontmatter, scope, length, or links. WHEN NOT TO USE: building an app with Ignite UI for React (use the public igniteui-react-* skills in skills/), changing the wrapper generators, entry points, or tests (see .agents/context/project.md), or changing the contribution rules themselves (edit .github/CONTRIBUTING.md)."
user-invocable: true
---

# Ignite UI for React — Skill Authoring

Quick-reference for writing a `SKILL.md` that agents can discover and load reliably.

## Location

- Internal, contributor-facing skills: `.agents/skills/<name>/SKILL.md`
- Public skills that ship with the `igniteui-react` package: `skills/<name>/SKILL.md`
- The folder name must match the `name` field.

## Frontmatter

| Field | Rules |
|---|---|
| `license` | Required. Must specify the license under which the skill is released. Default is MIT. |
| `name` | Required. Max 64 characters. Lowercase letters, numbers, and hyphens only. No XML tags. No reserved words (`anthropic`, `claude`). Public skills use the `igniteui-react-` prefix; internal skills use a plain kebab-case name. |
| `description` | Required. Non-empty. Max 1,024 characters. No XML tags. |

Write the description in the third person: say what the skill covers, then add both markers:

- `WHEN TO USE:` the tasks or triggers that should load the skill.
- `WHEN NOT TO USE:` nearby tasks it does not cover, naming the skill to use instead.

Agents see only `name` and `description` until they load the skill, so the description decides whether it is ever used.

Optional keys: `user-invocable`, `argument-hint`, `compatibility`, `disable-model-invocation`, `metadata`.

## Token Budget

- Keep the `SKILL.md` body under 500 lines.
- If it grows past that, use progressive disclosure: keep the overview and core rules in `SKILL.md` and move detail into `references/<topic>.md` files.
- Link each reference file directly from `SKILL.md` (one level deep) and say when to read it, so agents load it only when needed.

## Public Skills

The release pipeline copies `skills/` into the published `igniteui-react` package, and users copy single skill folders into their own agent directories. So for skills under `skills/`:

- Keep relative links inside `skills/`: to the skill's own `references/` files or to a sibling skill as `../<name>/SKILL.md`. Link anything else in this repository by its absolute GitHub URL.
- Treat renaming a public skill or moving its files as a breaking change for users who installed it, and say so in `CHANGELOG.md`.
- Record every user-visible change to a public skill under `## Unreleased` in `CHANGELOG.md`.

## Checklist

1. Frontmatter passes the rules above.
2. The description includes `WHEN TO USE:` and `WHEN NOT TO USE:`.
3. The body is under 500 lines, and every reference file is linked from `SKILL.md`.
4. The skill is listed in the Skills table of its README: [.agents/skills/README.md](../README.md) for internal skills, [skills/README.md](../../../skills/README.md) and the AI-Assisted Development table of the root [README.md](../../../README.md) for public skills. Internal skills are also listed in the Workflow section of [.agents/context/project.md](../../context/project.md).
5. Public skills only: every relative link resolves inside `skills/`, and `CHANGELOG.md` has an entry.
