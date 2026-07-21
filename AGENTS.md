# OSSIntel Development Guidelines

Before making any changes, understand the project architecture and conventions.

## Documentation First

Read the relevant project documentation before implementing anything.

Priority order:

1. Relevant package `README.md`
2. Root `README.md`
3. `turbo-forge.md`
4. Any relevant documents under `docs/`, `packages/**/docs/*`
5. Relevant files under `.agent/skills/`

Only read documentation relevant to the current task.

---

## README Rules

The README files are treated as architectural contracts.

- Do **not** modify the auto-generated badges section.
- Do **not** modify the installation section.
- These sections intentionally use HTML (`<p>`, `<img>`) instead of Markdown for compatibility with the documentation pipeline.
- Preserve their structure exactly.

Only update the remaining sections when explicitly required.

---

## Turbo Forge

Follow the project conventions documented in `turbo-forge.md`.

Do not introduce new project structure, tooling, or workflows unless explicitly requested.

---

## Documentation Automation

This repository contains automated documentation generation and rendering.

Do not break or modify these flows.

Avoid changes that affect:

- fumadocs documentation rendering
- Typedoc output
- Fumadocs compatibility
- documentation automation

If documentation-related changes are required, ensure existing automation continues to function.

---

## DRY

Before introducing new code:

- Search for existing implementations.
- Reuse utilities where appropriate.
- Prefer extending existing abstractions over creating new ones.

Follow the guidance in:

`.agent/skills/dry-refactoring`

Avoid duplicate business logic, duplicate utilities, and duplicate types.

---

## Package Responsibilities

Keep package boundaries strict.

### github-normalizer

Responsible only for fetching and normalizing data.

Must not:

- calculate scores
- generate insights
- contain UI logic

---

### scoring

Responsible only for deterministic calculations.

Must not:

- call external APIs
- invoke AI
- render UI

The same inputs must always produce the same outputs.

---

### insights

Responsible for interpreting metrics and scores.

May:

- generate findings
- generate recommendations
- prepare AI prompt context

Must not:

- calculate scores
- fetch external data

---

### web

Presentation layer only.

Business logic belongs inside reusable packages whenever practical.

---

## Code Quality

- Strict TypeScript.
- Keep modules focused.
- Prefer pure arrow functions.
- Avoid unnecessary abstractions.
- Add or update tests when business logic changes.
- Run `pnpm.cmd lint:fix` to lint
- typecheck: For typechecking the web app, run `pnpm.cmd type:check` inside apps/web
- For packages typecheck run `pnpm.cmd typecheck` in root

---

## Package Manager

Always use:

```bash
pnpm.cmd
```

Never use:

- npm
- npx
- yarn
- pnpm (without `.cmd`)

Examples:

```bash
pnpm.cmd install
pnpm.cmd test
pnpm.cmd lint
pnpm.cmd build
pnpm.cmd exec ...
```

---

## Goal

Build reusable, deterministic, well-tested libraries that power the OSSIntel platform while preserving the existing project architecture and automation, and the OSSIntel platform itself under apps/web.
