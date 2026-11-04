# @ossintel/input-parser <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/ossintel/ossintel/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/ossintel/ossintel/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/ossintel/ossintel/tree/main/packages/@ossintel/input-parser" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/ossintel/ossintel/graph/badge.svg?flag=@ossintel/input-parser" />
  </a> 
  <a href="https://npmjs.com/package/@ossintel/input-parser" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@ossintel/input-parser" />
  </a>
  <a href="https://npmjs.com/package/@ossintel/input-parser" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@ossintel/input-parser" />
  </a>
  <a href="https://npmjs.com/package/@ossintel/input-parser" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@ossintel/input-parser" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@ossintel/input-parser" />
</p>

> @ossintel/input-parser: Lightweight and extensible input query parser for resolving developer, repository, organization, and package paths across multiple ecosystems (GitHub, NPM, StackOverflow, VS Code).

---

## ✨ Why @ossintel/input-parser?

- **Ecosystem Agnostic**: Parses query strings, profiles, and URLs across GitHub, NPM, StackOverflow, VS Code, Medium, and LeetCode.
- **URL Auto-Healing**: Extracts platform, owner, repo, package name, or user IDs directly from browser copy-pasted URLs.
- **Prefix Shortcuts**: Handles intuitive prefix syntax (e.g. `org:react18-tools`, `npm:~isaacs`, `so:12345`).
- **Manifest Auto-Detection**: Inspects `package.json` contents to distinguish standard npm libraries from VS Code extensions (via `engines.vscode`, `publisher`, and `name`) for repository ingestion workflows.
- **Fully Typed & Lightweight**: Zero external dependencies, compiling to highly optimized, type-safe ESM/CJS bundles.

---

## 🚀 Usage

### 1. Parsing User Queries and URLs

```typescript
import { detectInput } from "@ossintel/input-parser";

// Parse a repository URL
const repo = detectInput("https://github.com/react18-tools/kosha");
// => { platform: "github", type: "repo", owner: "react18-tools", repo: "kosha", rawInput: "..." }

// Parse a GitHub Organization prefix
const org = detectInput("org:react18-tools");
// => { platform: "github", type: "org", owner: "react18-tools", rawInput: "..." }

// Parse an NPM user shortcut
const npmUser = detectInput("npm:~mayank1513");
// => { platform: "npm", type: "user", name: "mayank1513", rawInput: "..." }
```

### 2. Auto-Detecting Manifests (Repository Ingestion)

When analyzing repositories during ingestion, pass the repository's `package.json` manifest (either as a parsed object or raw JSON string) to identify package identity and VS Code extension targets:

```typescript
import { detectManifest } from "@ossintel/input-parser";

// Detect a VS Code extension manifest
const extensionResult = detectManifest({
  name: "promptshield-vscode",
  publisher: "mayank1513",
  version: "0.2.0",
  engines: { vscode: "^1.80.0" },
});
// => {
//   isPackage: true,
//   isVsCodeExtension: true,
//   isNpmPackage: true,
//   packageName: "promptshield-vscode",
//   vscodeExtensionId: "mayank1513.promptshield-vscode",
//   publisher: "mayank1513",
//   version: "0.2.0"
// }

// Detect a standard NPM package manifest
const pkgResult = detectManifest({
  name: "@ossintel/scoring",
  version: "1.0.0",
});
// => {
//   isPackage: true,
//   isVsCodeExtension: false,
//   isNpmPackage: true,
//   packageName: "@ossintel/scoring",
//   vscodeExtensionId: undefined,
//   publisher: undefined,
//   version: "1.0.0"
// }
```

> **Note**: `detectInput` also supports raw JSON strings as an opportunistic fallback, automatically routing to `platform: "vscode"` or `platform: "npm"`.

### 3. Normalizing and Evaluating `.ossintel.json` Configuration

`@ossintel/input-parser` exports configuration normalization utilities and evaluators conforming to the official schema (`https://ossintel.js.org/schemas/0.3.0/schema.json`):

```typescript
import {
  normalizeOssintelConfig,
  shouldIgnoreLanguage,
  shouldIgnorePath,
  shouldExcludeRepo,
} from "@ossintel/input-parser";

// Normalize raw parsed JSON
const config = normalizeOssintelConfig(rawJson);

// Check if a language or file path should be ignored during scoring/scanning
const ignoreLang = shouldIgnoreLanguage("Shell", config);
const ignorePath = shouldIgnorePath("legacy/old-package/package.json", config);

// Check repository exclusions
const isExcluded = shouldExcludeRepo("user/outdated-project", config);
```

---

## 📦 Installation

```bash
$ pnpm add @ossintel/input-parser
```

**_or_**

```bash
$ npm install @ossintel/input-parser
```

**_or_**

```bash
$ yarn add @ossintel/input-parser
```


## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
