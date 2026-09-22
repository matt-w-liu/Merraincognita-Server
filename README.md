# @merraincognita/server

Express API for the MERRAINCOGNITA LLC website (`https://merraincognita.com`).

## Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Vendored `./shared` package (included in this repo)

## Setup

```bash
cp .env.example .env
# Edit MONGODB_URI, JWT secrets (min 32 chars), and SMTP/contact settings

npm install
npm run dev
```

Vendored schemas live in `./shared` (same pattern as the client). After changing Zod schemas, update `shared/` at the meta root and copy into `server/shared` (and `client/shared`).

API listens on `http://localhost:5000` by default (`/api/v1`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Watch mode (`tsx`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run production build |
| `npm run test` | Vitest |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Upsert sample (demonstration) products |
| `npm run create-admin` | Create or elevate an administrator |

```bash
npm run create-admin -- --email=you@example.com
```

## Shared dependency

```json
"@merraincognita/shared": "file:./shared"
```

When `shared` is published separately, switch to a version or git URL.

## Docker

Build from this package root (Railway uses the same context):

```bash
docker build -t merraincognita-server .
```

Or from the meta root:

```bash
docker compose build server
```

## Environment

See [`.env.example`](.env.example). Required: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `PASSWORD_RESET_URL`. SMTP may be left empty in development (console/JSON transport).

## License

Proprietary — © MERRAINCOGNITA LLC. All rights reserved.
