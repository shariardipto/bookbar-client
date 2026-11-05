# BookBar

A small online library with a premium Midnight Editorial design: navy, porcelain, and copper. The product name is an owner-approved customization of the original BookNook assignment.

**Current phase:** P01 public interface. The app presents a working collection preview; database, authentication, and borrowing integrations come in later phases.

**Live website:** Not deployed; production deployment is scheduled for P08.
**GitHub remote:** `origin` is configured locally. P01 changes are committed locally; no push is performed in this phase.

## Implemented features

- A three-slide Swiper homepage with manual controls, book artwork, and six preview arrivals.
- A nine-title collection with title/author search, five category filters, and sorting; filter state survives refresh through the URL.
- Midnight Editorial styling with locally served DM Serif Display/Manrope and original vector book covers.
- Responsive navigation, a focus-managed mobile menu, and a shared footer across public/account-preview/404 pages.
- Consistent book cards, accessible cover fallbacks, loading skeletons, a resettable empty state, and a retryable error boundary.
- Route-specific titles, a custom favicon, and a custom 404 with working home/catalog navigation.

The collection is explicitly labeled as sample data. Login/Register are membership-preview pages; sample detail links preserve their intended callback URL at the login entry. Real authentication/session checks begin in P03. No fake books, session, availability, provider integration, or live MongoDB query is presented as complete.

## Planned library features

- Discover books through a responsive catalog and the latest six arrivals.
- Register and sign in with email/password or Google through Better Auth.
- Add book covers and details, then manage your own entries.
- Borrow available books with duplicate-borrow prevention and accurate copy counts.
- Review active loans and return books from My Borrows.
- Keep authenticated access on private-page refresh and return to intended pages after login.

Live database-backed catalog retrieval, registration/Google sign-in, book management, uploads, and borrowing remain planned features. P01's preview UI does not satisfy their live acceptance checks.

## Local setup

Use Node.js 24 LTS (verified with 24.22.2) and npm.

```powershell
npm ci --include=dev
npm run dev
```

Open http://localhost:3000. No environment file or provider account is required for P00/P01. Later, copy `.env.example` to `.env.local` and populate values privately only as their setup gates are reached. Never expose database/auth/image secrets through `NEXT_PUBLIC_*` variables.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server on port 3000 |
| `npm run build` | Next.js production build |
| `npm start` | Serve an existing production build on port 3000 |
| `npm run lint` | ESLint, with no warnings allowed |
| `npm run typecheck` | Generate Next.js route types, then strict TypeScript checks |
| `npm test` | Run the catalog filter/sort unit tests |
| `npm run test:e2e` | Run browser/accessibility/responsive tests against a production build |

For browser verification, build first with `npm run build`, then run `npm run test:e2e` with port 3000 free. The configuration uses installed Google Chrome in headless mode and starts/stops its own Next.js process. Screenshots are saved to ignored `.cache/p01/`; the HTML report is in ignored `playwright-report/`. The tested public routes are `/`, `/books`, `/login`, `/register`, and `/a-lost-chapter` (404). `/books?category=Science` demonstrates a filtered entry; `/books/preview-time-machine` demonstrates the temporary login entry.

Original preview artwork can be regenerated with `node scripts/generate-preview-covers.mjs`. These covers are BookBar illustrations, not publisher-edition reproductions. Replace the documented fixture consumers during P06; real MongoDB sorting/limit and availability must be verified then. The footer still needs the owner's public contact details and profile links before launch.

The client will own Better Auth session handling, JWKS, and the authenticated imgbb Server Action. The separate Express server will own book/borrow rules and validate service JWTs. Those integrations are not part of P00.

## Documentation and delivery

See [blueprint](docs/BookBar_Master_Blueprint.md), [decisions](docs/DECISIONS.md), [implementation log](docs/IMPLEMENTATION_LOG.md), [handoffs](docs/MANUAL_HANDOFFS.md), [test report](docs/TEST_REPORT.md), and [dependency versions](docs/DEPENDENCIES.md). The original assignment is retained in `docs/B14-A8-Cat_Ron.md`.

Each future coherent change should receive a meaningful commit, targeting at least 15 client commits by submission. Live URLs and remote links will be added after they exist.
