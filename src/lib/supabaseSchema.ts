/**
 * Parsing helpers for Supabase/PostgREST errors.
 *
 * Kept separate from the server so they can be tested without booting Express.
 */

/**
 * Extracts the column Postgres complains about from a PostgREST/PG error.
 *
 * Two shapes are seen in practice:
 *   PGRST204 — "Could not find the 'cod_status' column of 'orders' in the
 *              schema cache"
 *   42703    — "column orders.cod_status does not exist"
 *
 * Returns null for anything else, so unrelated failures are never mistaken for
 * a missing column. That matters: the order upsert retries with a narrower
 * payload on a match, and a false positive would silently drop a real column
 * from every write.
 */
export function missingColumnFromError(error: { code?: string; message?: string } | null | undefined): string | null {
  const message = error?.message || '';
  const quoted = message.match(/Could not find the '([a-z0-9_]+)' column/i);
  if (quoted) return quoted[1];
  const qualified = message.match(/column\s+[a-z0-9_]+\.([a-z0-9_]+)\s+does not exist/i);
  if (qualified) return qualified[1];
  return null;
}