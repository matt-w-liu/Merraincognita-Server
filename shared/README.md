# @merraincognita/shared

Shared Zod schemas, enums, and API response types for MERRAINCOGNITA LLC (`client` and `server`).

## Setup

```bash
npm install
npm run build
```

Consumers expect `dist/` to exist. `npm install` runs `prepare` → `build` automatically.
For the sibling meta-root package used by the server, you can still run `npm run build` explicitly.

## Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Emit `dist/` (JS + `.d.ts`) |
| `npm run typecheck` | TypeScript check without emit |
| `npm run dev` | `tsc --watch` |

## Consuming from sibling packages

While `client`, `server`, and `shared` live as sibling folders:

```json
"@merraincognita/shared": "file:../shared"
```

The **client** and **server** repositories each vendor a copy at `client/shared` and
`server/shared` respectively, for standalone deploys (Cloudflare Pages, Railway).
Keep all three trees aligned when schemas change.

When this package has its own remote, publish it (npm or GitHub Packages), set `"private": false`, and replace the `file:` dependency with a semver range or git URL.

## License

Proprietary — © MERRAINCOGNITA LLC. All rights reserved.
