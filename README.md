# OSSIntel

> Open Source Intelligence Platform

OSSIntel transforms GitHub profiles, repositories, and npm packages into actionable insights.

Unlike GitHub, which primarily shows activity, OSSIntel helps answer questions such as:

- Is this project healthy?
- Can I trust this package?
- How impactful is this maintainer?
- What are the biggest risks?
- Where should contributors start?

## Goals

- Provide deterministic OSS analytics
- Surface meaningful insights using AI
- Help maintainers, contributors, recruiters, and developers make better decisions
- Build a reusable OSS intelligence engine

## Architecture

```
                GitHub APIs
                     │
               npm Registry
                     │
             Future Integrations
                     │
      ┌──────────────────────────┐
      │ github-normalizer        │
      └──────────────────────────┘
                     │
      ┌──────────────────────────┐
      │ scoring                  │
      └──────────────────────────┘
                     │
      ┌──────────────────────────┐
      │ insights                 │
      └──────────────────────────┘
                     │
             Next.js Dashboard
```

## Packages

### @ossintel/github-normalizer

Fetches and normalizes GitHub data into a stable domain model.

### @ossintel/scoring

Deterministically calculates OSS metrics and scores.

### @ossintel/insights

Transforms metrics into findings, recommendations, and AI-ready summaries.

## Principles

- Deterministic first
- AI augments, never replaces
- Typed everywhere
- Small reusable packages
- Testable business logic
- UI remains thin

## AI-assisted Development

This project itself demonstrates AI-assisted software engineering.

The development workflow includes:

1. Brainstorming
2. PRD creation
3. Architecture design
4. Domain modeling
5. Task decomposition
6. AI-assisted implementation
7. Human review and refinement

## Roadmap

- Developer Intelligence
- Repository Intelligence
- Package Intelligence
- Organization Intelligence
- GitHub App
- CLI
- VS Code Extension
