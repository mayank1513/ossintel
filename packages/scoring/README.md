# @ossintel/scoring <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/mayank1513/ossintel/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/mayank1513/ossintel/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/mayank1513/ossintel/tree/main/packages/@ossintel/scoring" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/mayank1513/ossintel/graph/badge.svg?flag=@ossintel/scoring" />
  </a> 
  <a href="https://npmjs.com/package/@ossintel/scoring" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@ossintel/scoring" />
  </a>
  <a href="https://npmjs.com/package/@ossintel/scoring" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@ossintel/scoring" />
  </a>
  <a href="https://npmjs.com/package/@ossintel/scoring" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@ossintel/scoring" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@ossintel/scoring" />
</p>

> @ossintel/scoring: Deterministic scoring engine for calculating OSS health, impact, risk, activity, and community metrics from normalized repository and ecosystem data.

# @ossintel/scoring

Deterministic OSS scoring engine with modular architecture.

## Purpose

Converts normalized repository and developer metrics into objective scores.

## Responsibilities

### Repository Scoring

- Health, Impact, Activity, Community, Risk, and Overall scores

### Identity Scoring (OSSIQ)

Four-pillar reputation engine:

- **Maintainer** — Repository health weighted by popularity (GitHub-only)
- **Contributor** — Quality-weighted external PR scoring
- **Organization** — Active org leadership evaluation
- **Influence** — Downstream reach (stars, forks + additive npm/SO bonuses)

### Capability Scoring

- **Package Publishing** (`calculatePublishingScore`) — npm downloads, active packages, verified publisher (extensible to NuGet, PyPI, crates.io, Go)
- **Knowledge Sharing** (`calculateKnowledgeScore`) — Stack Overflow reputation, answers, acceptance rate (extensible to Dev.to, Hashnode)

### Supporting Modules

- **Badges** — Achievement detection from cross-platform activity
- **Skills** — Topic expertise radar aggregating GitHub, npm, and Stack Overflow signals
- **Evidence & Factors** — Human-readable explanations for each pillar

## Philosophy

- Scores are **deterministic**: same inputs → same outputs
- Scores are **monotonic**: linking additional providers can only increase reputation
- GitHub defines the **core OSS reputation** (~80-85%)
- Additional providers contribute **additive capability bonuses**
- No AI participates in score calculation

## Module Architecture

```text
index.ts
├── repository-scoring.ts      # Repo-level: health, impact, activity, community, risk
├── identity-scoring.ts        # Orchestrator: computes overall OSSIQ score
├── maintainer-scoring.ts      # Pillar: GitHub repo health weighted average
├── contributor-scoring.ts     # Pillar: external PR quality weighting
├── organization-scoring.ts    # Pillar: org leadership evaluation
├── influence-scoring.ts       # Pillar: stars + forks + additive bonuses
├── publishing-scoring.ts      # Capability: Package Publishing (npm)
├── knowledge-scoring.ts       # Capability: Knowledge Sharing (Stack Overflow)
├── badges.ts                  # Achievement detection
├── skills.ts                  # Topic expertise aggregation
├── evidence.ts                # Evidence & factors generation
└── topic-mappings.ts          # Canonical topic → keyword mappings
```

## Non-goals

- API calls
- AI
- Charts
- UI

## Testing

Every scoring algorithm should have comprehensive unit tests.

No external dependencies should affect score calculation.

---

## ✨ Why @ossintel/scoring?

- **100% Deterministic & Transparent**: Zero network requests or probabilistic AI models; calculations are mathematical and fully reproducible.
- **Modular Pillar Architecture**: Each scoring dimension (Maintainer, Contributor, Organization, Influence) is a self-contained module, easy to extend or override.
- **Capability-Specific Scoring**: First-class `calculatePublishingScore` and `calculateKnowledgeScore` exports for direct use by consumers.
- **Monotonic Guarantees**: Linking npm or Stack Overflow can only increase scores, never reduce them.
- **Fully Tested**: Every score calculation is validated by comprehensive unit tests to prevent regression.

---

## 🌍 Open Source Ecosystem Impact Engine

The Ecosystem Impact Engine measures developer impact beyond owned repositories, focusing on contributions to external projects.

### Heuristics Classification Pipeline

```text
[User Merged PR]
       │
       ├──► Contains "typo", "readme", "docs" in Title/Labels? ─────► [Docs / Typo Fix] (Weight: 0.4x)
       ├──► Contains "test", "spec", "qa" in Title/Labels? ────────► [Test Contribution] (Weight: 1.2x)
       ├──► Contains "chore", "dependencies" in Title/Labels? ──────► [Chore / Dependency] (Weight: 0.5x)
       └──► Default Code change ────────────────────────────────────► [Core Code Contribution] (Weight: 1.0x)
```

### Weighting Matrix

Merged pull requests are weighted according to target repository popularity and quality multipliers:

| Target Repo Stargazers | Tier Category | Base Weight | Multiplier Applied |
|---|---|---|---|
| **&ge; 20,000 Stars** | **Tier 1 (Frameworks)** | 5.0 | Quality Multiplier (Docs: 0.4, Test: 1.2, Chore: 0.5, Code: 1.0) |
| **&ge; 2,000 Stars** | **Tier 2 (Medium OSS)** | 3.0 | Quality Multiplier |
| **&lt; 2,000 Stars** | **Tier 3 (Small OSS)** | 1.0 | Quality Multiplier |

The resulting Ecosystem Contribution Score (\(S_{eco}\)) is aggregated as:
\[S_{eco} = \min\left(100, \sum (BaseWeight \times QualityMultiplier)\right)\]

---

## 📦 Installation

```bash
$ pnpm add @ossintel/scoring
```

**_or_**

```bash
$ npm install @ossintel/scoring
```

**_or_**

```bash
$ yarn add @ossintel/scoring
```

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
