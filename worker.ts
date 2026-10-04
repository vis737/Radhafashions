/**
 * Cloudflare Worker entry point.
 *
 * Radha Fashions runs the same Express application on Node (Railway, Render,
 * `npm start`) and on Cloudflare Workers. On Workers the Node `http` server
 * that Express expects is emulated: `app.listen(3000)` binds the app to a local
 * port and `httpServerHandler` forwards each incoming fetch event to it.
 *
 * Wrangler only reaches this file if the Worker has a script, which is also why
 * the Cloudflare dashboard refuses to accept variables and secrets for a
 * static-assets-only Worker.
 */
import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Carries the per-request execution context into the Express handlers.
 *
 * A Worker is frozen the moment the response is returned, so anything that is
 * not handed to `ctx.waitUntil()` is cancelled mid-flight. That is why order
 * emails used to vanish, and why the checkout route ended up `await`ing Resend
 * and Twilio on the critical path — which cost the customer ~10 seconds per
 * order. Neither behaviour is acceptable, so the context is published here and
 * `server.ts` can defer that work properly.
 *
 * AsyncLocalStorage rather than a plain global: one isolate serves overlapping
 * requests, and a shared mutable variable would hand request A the context of
 * whichever request happened to run last.
 */
const executionContextStore = new AsyncLocalStorage<ExecutionContext>();

(globalThis as unknown as Record<string, unknown>).__RADHA_CF_WORKER__ = true;
(globalThis as unknown as Record<string, unknown>).__RADHA_CF_ASSETS__ = env.ASSETS;
// Must be published before `server` is imported, because that module captures
// the reference at evaluation time.
(globalThis as unknown as Record<string, unknown>).__RADHA_CF_CTX_STORE__ = executionContextStore;

const { default: app } = await import('./server');

// The port here only has to match the `app.listen()` call below it.
app.listen(3000);

// `httpServerHandler` returns a module-worker object rather than a bare
// function, so the fetch entry point is pulled off it and bound. Both shapes
// are accepted because the runtime has returned either across versions.
const handler = httpServerHandler({ port: 3000 }) as unknown as
  | ((request: Request, env?: unknown, ctx?: unknown) => Promise<Response>)
  | { fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> };

const handleFetch: (request: Request, bindings: unknown, ctx: ExecutionContext) => Promise<Response> =
  typeof handler === 'function'
    ? handler
    : (request, bindings, ctx) => handler.fetch(request, bindings, ctx);

export default {
  fetch(request: Request, bindings: unknown, ctx: ExecutionContext): Response | Promise<Response> {
    return executionContextStore.run(ctx, () => handleFetch(request, bindings, ctx));
  },
};