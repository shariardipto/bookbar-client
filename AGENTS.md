# BookBar client

Read `docs/AGENTS.md`, `docs/B14-A8-Cat_Ron.md`, `docs/BookBar_Master_Blueprint.md`, `docs/DECISIONS.md`, `docs/IMPLEMENTATION_LOG.md`, and `docs/MANUAL_HANDOFFS.md` first. This is an independent Git repository. Respect the owner's currently authorized phase.

Use Next.js App Router and strict TypeScript. Read relevant version-specific documentation in `node_modules/next/dist/docs/` before changing framework code; current APIs may differ from older tutorials. Authentication belongs in Next.js; secret values must stay server-side. The owner-approved product name is BookBar, with the Midnight Editorial visual direction. Run relevant checks and report actual results. Keep `docs` current; synchronize workspace planning updates when working inside the larger local workspace.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
