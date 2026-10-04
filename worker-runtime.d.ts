/**
 * Ambient declarations for the two Cloudflare runtime modules that `worker.ts`
 * imports. `wrangler types` generates bindings and an `Env` interface, but not
 * the `cloudflare:*` module specifiers, so they are declared here by hand. This
 * keeps `npm run lint` (tsc --noEmit) working on a fresh clone without
 * requiring a Cloudflare account or a Wrangler login first.
 */

declare module 'cloudflare:workers' {
  /**
   * Every binding configured for the Worker: vars, secrets and resource
   * bindings. `worker.ts` only reaches for `ASSETS`.
   */
  export const env: Record<string, unknown>;
}

/**
 * The per-request execution context Workers hands to a module worker.
 *
 * `waitUntil()` is what keeps asynchronous work alive after the response has
 * been returned — without it the isolate is frozen and the work is cancelled.
 * Declared here rather than pulled from `wrangler types` so that
 * `tsc --noEmit` keeps working on a fresh clone with no Cloudflare account.
 */
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

declare module 'cloudflare:node' {
  /**
   * Bridges a Node `http` server into the Workers fetch handler. Express calls
   * `app.listen(port)`; this handler routes incoming requests to it.
   */
  export function httpServerHandler(options: {
    port: number;
  }): (request: Request, env?: unknown, ctx?: unknown) => Promise<Response>;
}
