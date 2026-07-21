# OSSIntel Web

The primary user interface for OSSIntel.

## Responsibilities

- Search
- Dashboards
- Visualizations
- AI summaries
- Reports
- External integrations

## Features

### Developer Intelligence

Analyze GitHub users.

### Repository Intelligence

Analyze repositories.

### Package Intelligence

Analyze npm packages.

## Integrations

Rather than rebuilding existing tools, OSSIntel complements them.

Examples:

- CodeWiki
- ChatGPT
- GitHub
- npm

## Non-goals

Business logic belongs in reusable packages.

The web application should remain a thin presentation layer.

## Future

- Authentication
- Saved reports
- Organization dashboards
- Team analytics
- GitHub App

## Routes

| Route | Purpose |
|-------|---------|
| `(home)/` | Landing + search |
| `user/[username]/` | Developer intelligence |
| `repo/[owner]/[name]/` | Repository intelligence |
| `docs/[[...slug]]/` | Documentation |
| `api/` | API endpoints |

## Tech Stack

- Next.js 15
- Tailwind CSS v4
- shadcn/ui
- React Query
- Fumadocs
- IndexedDB (idb)

## Development

```bash
# Start the development server (runs on port 3001)
pnpm.cmd dev

# Typecheck the web application
pnpm.cmd types:check
```
