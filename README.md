# BookBar

A small online library with a premium Midnight Editorial design: navy, porcelain, and copper. The product name is an owner-approved customization of the original BookNook assignment.

**Current phase:** P02 database acceptance is DONE. P04 adds the JWT API helper and verified Express routes. Real email registration/login/session/token/logout passed during API acceptance; P03's Google callback and private browser refresh still need verification. Public browsing continues to use labeled preview data until P06.

**Live website:** Not deployed; production deployment is scheduled for P08.
**GitHub remote:** `origin` is configured locally. Changes are committed locally; no push is performed in this phase.

## Implemented features

- A three-slide Swiper homepage with manual controls, book artwork, and six preview arrivals.
- A nine-title collection with title/author search, five category filters, and sorting; filter state survives refresh through the URL.
- Midnight Editorial styling with locally served DM Serif Display/Manrope and original vector book covers.
- Responsive navigation, a focus-managed mobile menu, and a shared footer across public/member/404 pages.
- Consistent book cards, accessible cover fallbacks, loading skeletons, a resettable empty state, and a retryable error boundary.
- Route-specific titles, a custom favicon, and a custom 404 with working home/catalog navigation.

- Better Auth 1.7.18 with the Mongo adapter, cookie-backed sessions, Google integration, and JWT/JWKS for the separate API.
- Email registration with name, email, photo URL, and matching browser/server password rules: at least six characters, uppercase and lowercase. Registration continues to Login without automatically signing in.
- Email login with safe local return paths, password visibility controls, inline errors and toast feedback. Google on Register goes Home; Google on Login preserves the intended page.
- Server-checked private routes, session-aware navigation, account dropdown/logout, and a profile drawn from the authenticated session. Book management and borrowing pages are guarded placeholders until P06.

The collection is explicitly labeled as sample data. Real email registration/login, cookie sessions, JWT issuance and logout passed API acceptance. Private browser refresh and Google's callback still need live verification; earlier browser transport stubs only test UI behavior. Email verification and password reset are intentionally disabled.

## Planned library features

- Discover books through a responsive catalog and the latest six arrivals.
- Register and sign in with email/password or Google through Better Auth.
- Add book covers and details, then manage your own entries.
- Borrow available books with duplicate-borrow prevention and accurate copy counts.
- Review active loans and return books from My Borrows.
- Keep authenticated access on private-page refresh and return to intended pages after login.

Live database-backed catalog retrieval, book management, uploads, and borrowing remain planned features. Preview fixtures do not satisfy their database acceptance checks.

## Local setup

Use Node.js 24 LTS (verified with 24.22.2) and npm.

```powershell
npm ci --include=dev
npm run dev
```

Open http://localhost:3000 consistently for authentication. Copy `.env.example` to `.env.local` only if it does not exist, then populate values privately. Authentication requires `MONGODB_URI`, `MONGODB_DB_NAME`, a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters, and `BETTER_AUTH_URL=http://localhost:3000`. Google requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; blank/placeholder settings leave its button unavailable. Restart Next after environment changes. Never expose secrets through `NEXT_PUBLIC_*` variables or commit `.env.local`.

Create a Google OAuth **Web application** client with origin `http://localhost:3000` and redirect URI `http://localhost:3000/api/auth/callback/google`. Configure consent and test users as appropriate to your Google project. Follow the [official provider guide](https://better-auth.com/docs/authentication/google). Production origins/callbacks are configured in P08.

## Commands

Run `npm run db:check` to verify the pooled server-only MongoDB connection without printing the URI. Better Auth's adapter owns its auth collections and uses the same native Mongo client with transactions. The Next-owned `/api/auth/*` routes are separate from the eight assigned Express endpoints; no Express auth/profile routes are added.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server on port 3000 |
| `npm run build` | Next.js production build |
| `npm start` | Serve an existing production build on port 3000 |
| `npm run lint` | ESLint, with no warnings allowed |
| `npm run typecheck` | Generate Next.js route types, then strict TypeScript checks |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run browser/accessibility/responsive tests against a production build |

For browser verification, build first, leave port 3000 free, and use installed Google Chrome. The configuration starts/stops its own Next process. Focused P03 commands:

```powershell
npm test -- src/lib/auth-validation.test.ts src/lib/auth-server.test.ts src/lib/member-session.test.ts src/lib/database.test.ts "src/app/api/auth/[...all]/route.test.ts"
npm run test:e2e -- tests/e2e/authentication.spec.ts
```

Screenshots are saved to ignored `.cache/p01/` and `.cache/p03/`; the latest HTML report is in `playwright-report/`. Auth browser tests clearly label stubbed responses; the signed-out private-route checks use the real server guard. They cannot prove persistence, Google consent/callback completion, or JWT issuance from a real session.

Original preview artwork can be regenerated with `node scripts/generate-preview-covers.mjs`. These covers are BookBar illustrations, not publisher-edition reproductions. Replace the documented fixture consumers during P06; real MongoDB sorting/limit and availability must be verified then. The footer still needs the owner's public contact details and profile links before launch.

The client owns Better Auth sessions and JWKS; the authenticated imgbb Server Action comes in P06. Express validates service JWTs from `authClient.token()`; a Better Auth session cookie is not the API bearer token. JWT issuer/audience match the configured auth origin, with a 15-minute lifetime.

`src/lib/api-client.ts` supplies `apiRequest<T>(path, options)`. Protected access is the default; public catalog requests pass `{ authenticated: false }`. It obtains a service JWT per protected request, sends only a bearer header to the configured API origin, omits cookies, and keeps tokens out of persistent storage. A 401 triggers a session recheck and a typed `ApiRequestError`; mutations are not automatically replayed. It unwraps `{ success: true, data }` and preserves structured API errors. Test it with `npm test -- src/lib/api-client.test.ts` (11 checks). P06 will connect this helper to the library screens.

## Documentation and delivery

See [blueprint](docs/BookBar_Master_Blueprint.md), [decisions](docs/DECISIONS.md), [implementation log](docs/IMPLEMENTATION_LOG.md), [handoffs](docs/MANUAL_HANDOFFS.md), [test report](docs/TEST_REPORT.md), and [dependency versions](docs/DEPENDENCIES.md). The original assignment is retained in `docs/B14-A8-Cat_Ron.md`.

Each future coherent change should receive a meaningful commit, targeting at least 15 client commits by submission. Live URLs and remote links will be added after they exist.
