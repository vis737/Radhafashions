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

// `server.ts` branches on these flags, and ES module imports are hoisted, so
// they have to be set before the server module is evaluated. That is the whole
// reason the import below is dynamic rather than a top-level `import`.
//
// The ASSETS binding is handed over the same way: Workers has no filesystem,
// so `server.ts` cannot `fs.readFileSync('dist/index.html')` and has to fetch
// the SPA shell through the static-asset pipeline instead.
(globalThis as unknown as Record<string, unknown>).__RADHA_CF_WORKER__ = true;
(globalThis as unknown as Record<string, unknown>).__RADHA_CF_ASSETS__ = env.ASSETS;

const { default: app } = await import('./server');

// The port here only has to match the `app.listen()` call below it.
app.listen(3000);

export default httpServerHandler({ port: 3000 });
