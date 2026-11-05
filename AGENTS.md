# BookBar client

Reading priority: current task/conversation; workspace `../docs/ACTIVE_CONTEXT.md`; relevant source; relevant blueprint section; assignment only for clarification/final verification. Do not reread whole documents already in context. This is an independent repository; preserve owner changes and history. In a standalone checkout, use README and the archived documents for missing context.

Use Next.js App Router and strict TypeScript. Consult relevant bundled Next.js docs when changing unfamiliar framework behavior. Authentication and secure uploads belong in Next.js; keep secrets server-only. Preserve BookBar/Midnight Editorial branding. Run focused tests and affected lint/typecheck; build after major integration changes. Primary progress lives at workspace level; do not copy logs between repositories or redo P00/P01. Advance P02 onward only after required exits; pause dependent work at real manual setup gates.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
