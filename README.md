# BookBar

A small online library with a premium Midnight Editorial design: navy, porcelain, and copper. The product name is an owner-approved customization of the original BookNook assignment.

**Current phase:** P07 automated QA passes; actual Google consent/callback remains a manual verification gate. The complete library UI uses real MongoDB-backed APIs and authenticated imgbb uploads. Email registration/login, private-page refresh, redirect-back and the add/edit/borrow/return/delete workflow pass real browser acceptance.

**Live website:** Not deployed; production deployment is scheduled for P08.
**GitHub remote:** `origin` is configured locally. Changes are committed locally; no push is performed in this phase.

## Implemented features

- A three-slide Swiper homepage with manual controls, book artwork, and the latest six arrivals sorted and limited by MongoDB.
- A live collection with title/author search, five category filters, and sorting; filter state survives refresh through the URL. Desktop browsing uses three columns.
- Midnight Editorial styling with locally served DM Serif Display/Manrope and original vector book covers.
- Responsive navigation, a focus-managed mobile menu, and a shared footer across public/member/404 pages.
- Consistent book cards, accessible cover fallbacks, loading skeletons, a resettable empty state, and a retryable error boundary.
- Route-specific titles, a custom favicon, and a custom 404 with working home/catalog navigation.

- Better Auth 1.7.18 with the Mongo adapter, cookie-backed sessions, Google integration, and JWT/JWKS for the separate API.
- Email registration with name, email, photo URL, and matching browser/server password rules: at least six characters, uppercase and lowercase. Registration continues to Login without automatically signing in.
- Email login with safe local return paths, password visibility controls, inline errors and toast feedback. Google on Register goes Home; Google on Login preserves the intended page.
- Server-checked private routes, session-aware navigation, account dropdown/logout, and a profile drawn from the authenticated session.
- Add Book with validated details and authenticated cover uploads; My Books with prefilled editing and confirmed deletion. Ownership comes from the verified API token.
- Private book details with availability and a borrow modal; My Borrows shows real snapshots/due dates and confirmed returns. Inventory updates use the transactional API.
- TanStack Query caches update after writes, private keys include the member ID, and logout clears cached records. Mutations are never automatically retried.

Runtime screens use real API records. Test fixtures only support deterministic public UI/filter checks; they are not live integration evidence. Real email sessions/JWTs and private browser refresh pass. Google's callback remains unverified. Email verification and password reset are intentionally disabled.

Google callback verification and production deployment remain outstanding. P07 found and fixed missing cancellation feedback when Google/Better Auth returns repeated `error` query parameters; login now recognizes the Google marker in that array.

## Local setup

Use Node.js 24 LTS (verified with 24.22.2) and npm.

```powershell
npm ci --include=dev
npm run dev
```

Open http://localhost:3000 consistently for authentication. Copy `.env.example` to `.env.local` only if it does not exist, then populate values privately. Authentication requires `MONGODB_URI`, `MONGODB_DB_NAME`, a high-entropy `BETTER_AUTH_SECRET` of at least 32 characters, and `BETTER_AUTH_URL=http://localhost:3000`. Google requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; blank/placeholder settings leave its button unavailable. Restart Next after environment changes. Never expose secrets through `NEXT_PUBLIC_*` variables or commit `.env.local`.

Run the sibling Express server on port 5000 and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`. Save `IMGBB_API_KEY` only in the private client server environment. Cover uploads require a current server-verified session and accept PNG/JPEG/WebP/GIF up to 5 MB with format-signature validation. The Next action has a 6 MB request limit for multipart overhead. Only the public hosted URL returns to the browser; provider credentials and deletion links stay private. No Express upload endpoint is added.

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
| `npm run test:live` | Opt-in real-provider/Atlas QA; both apps must be built and ports 3000/5000 free |

For browser verification, build first, leave port 3000 free, and use installed Google Chrome. The configuration starts/stops its own Next process. Focused P03 commands:

```powershell
npm test -- src/lib/auth-validation.test.ts src/lib/auth-server.test.ts src/lib/member-session.test.ts src/lib/database.test.ts "src/app/api/auth/[...all]/route.test.ts"
npm run test:e2e -- tests/e2e/authentication.spec.ts
```

Screenshots are saved to ignored `.cache/p01/`, `.cache/p03/` and `.cache/p06/`; public UI reports are in `playwright-report/`. Standard public/auth tests label transport fixtures and use real signed-out server guards. `test:live` separately exercises real email auth, cookie refresh, JWT/JWKS, imgbb upload, book editing/deletion, borrowing/return, inventory/cache updates, seven-day dates, latest-six ordering, desktop grid and selected responsive/axe checks. It creates uniquely marked synthetic records and cleans only those records in `finally`. Traces, videos and automatic failure screenshots are disabled for its credential flows. It does not test Google consent/callback. One tiny synthetic image is sent to the real provider; deleting a book does not delete its hosted image.

P07 extends live QA with refresh/title/empty-state checks for Profile, My Books and My Borrows, missing-book feedback, malformed-cover rejection/recovery, and real logout. The Google-start test checks the configured local callback/scopes, then simulates `access_denied` to consume its one-time state and verify safe retry feedback. This does not establish a successful Google login. Automated evidence: 73 client unit tests, 91 server unit tests, 18 browser scenarios, 11 real API acceptance groups, 9 Atlas concurrency/rollback groups, and the expanded live browser checks pass; both repositories pass lint/typecheck/build.

To finish the manual Google gate with both apps running, open http://localhost:3000/login?callbackUrl=%2Fprofile, choose **Continue with Google**, and complete account selection/consent in your own browser. Confirm the return to Profile and that a hard refresh keeps the session. Share only PASS/FAIL or a short provider error code, never passwords, codes, cookies, tokens, or the full authorization/callback URL.

Original promotional artwork can be regenerated with `node scripts/generate-preview-covers.mjs`. These covers are BookBar illustrations, not publisher-edition reproductions. Runtime collection records come from MongoDB; sample records remain test-only. The footer still needs the owner's public contact details and profile links before launch.

The client owns Better Auth sessions, JWKS and the authenticated imgbb Server Action. Express validates service JWTs from `authClient.token()`; a Better Auth session cookie is not the API bearer token. JWT issuer/audience match the configured auth origin, with a 15-minute lifetime.

`src/lib/api-client.ts` supplies `apiRequest<T>(path, options)`. Protected access is the default; public catalog requests pass `{ authenticated: false }`. It obtains a service JWT per protected request, sends only a bearer header to the configured API origin, omits cookies, and keeps tokens out of persistent storage. A 401 triggers a session recheck and a typed `ApiRequestError`; mutations are not automatically replayed. It unwraps `{ success: true, data }` and preserves structured API errors. Test it with `npm test -- src/lib/api-client.test.ts` (11 checks). Library query options and response types live in `src/lib/library-queries.ts` and `src/lib/library-types.ts`.

## Documentation and delivery

See [blueprint](docs/BookBar_Master_Blueprint.md), [decisions](docs/DECISIONS.md), [implementation log](docs/IMPLEMENTATION_LOG.md), [handoffs](docs/MANUAL_HANDOFFS.md), [test report](docs/TEST_REPORT.md), and [dependency versions](docs/DEPENDENCIES.md). The original assignment is retained in `docs/B14-A8-Cat_Ron.md`.

Each future coherent change should receive a meaningful commit, targeting at least 15 client commits by submission. Live URLs and remote links will be added after they exist.
