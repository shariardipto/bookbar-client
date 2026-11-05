# BookBar

A small online library with a premium Midnight Editorial design: navy, porcelain, and copper. The product name is an owner-approved customization of the original BookNook assignment.

**Current phase:** P00 foundation. The Next.js application serves an opening-soon page; the full library is not implemented yet.

**Live website:** Not deployed; production deployment is scheduled for P08.
**GitHub remote:** Not configured; this is currently a local repository.

## Planned library features

- Discover books through a responsive catalog and the latest six arrivals.
- Register and sign in with email/password or Google through Better Auth.
- Add book covers and details, then manage your own entries.
- Borrow available books with duplicate-borrow prevention and accurate copy counts.
- Review active loans and return books from My Borrows.
- Keep authenticated access on private-page refresh and return to intended pages after login.

These are planned assignment features, not claims of completed integrations. P00 includes a branded baseline, strict TypeScript, Tailwind CSS build plumbing, lint/typecheck/build/test scripts, reproducible dependencies, and phase documentation. P01 introduces the full public UI, shadcn components, and final fonts.

## Local setup

Use Node.js 24 LTS (verified with 24.22.2) and npm.

```powershell
npm ci --include=dev
npm run dev
```

Open http://localhost:3000. No environment file or provider account is required for P00. Later, copy `.env.example` to `.env.local` and populate values privately only as their setup gates are reached. Never expose database/auth/image secrets through `NEXT_PUBLIC_*` variables.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server on port 3000 |
| `npm run build` | Next.js production build |
| `npm start` | Serve an existing production build on port 3000 |
| `npm run lint` | ESLint, with no warnings allowed |
| `npm run typecheck` | Generate Next.js route types, then strict TypeScript checks |
| `npm test` | Run Vitest; reports zero tests until client feature tests exist |

The client will own Better Auth session handling, JWKS, and the authenticated imgbb Server Action. The separate Express server will own book/borrow rules and validate service JWTs. Those integrations are not part of P00.

## Documentation and delivery

See [blueprint](docs/BookBar_Master_Blueprint.md), [decisions](docs/DECISIONS.md), [implementation log](docs/IMPLEMENTATION_LOG.md), [handoffs](docs/MANUAL_HANDOFFS.md), [test report](docs/TEST_REPORT.md), and [dependency versions](docs/DEPENDENCIES.md). The original assignment is retained in `docs/B14-A8-Cat_Ron.md`.

Each future coherent change should receive a meaningful commit, targeting at least 15 client commits by submission. Live URLs and remote links will be added after they exist.
