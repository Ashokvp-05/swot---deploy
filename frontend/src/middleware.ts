/**
 * middleware.ts — Next.js Route Protection Middleware
 *
 * IMPORTANT: This file MUST be named `middleware.ts` and placed at
 * `src/middleware.ts` (or project root `middleware.ts`) for Next.js to pick it up.
 * The previous `proxy.ts` file was silently ignored by Next.js.
 *
 * This re-exports the auth middleware from src/proxy.ts which contains
 * the actual route protection logic.
 */
export { default, config } from "./proxy"
