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

Deterministic OSS scoring engine.

## Purpose

Converts normalized repository and developer metrics into objective scores.

## Responsibilities

Calculate:

- Overall Score
- Health Score
- Impact Score
- Activity Score
- Community Score
- Risk Score

## Philosophy

Scores should always be reproducible.

The same inputs should always produce the same outputs.

No AI should participate in score calculation.

## Inputs

Normalized domain models.

## Outputs

```ts
{
  overall, health, impact, activity, community, risk;
}
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
- **Detailed Sub-metrics**: Computes comprehensive scores for Activity, Impact, Health, Community, and Risk to give a multidimensional view.
- **Fully Tested**: Every score calculation is validated by comprehensive unit tests to prevent regression.

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
