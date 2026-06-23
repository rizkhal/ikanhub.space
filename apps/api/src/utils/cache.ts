import type { Context } from "hono";

/**
 * Set response headers to prevent any caching (for random / non-deterministic endpoints).
 *
 * Two requests to the same URL should be allowed to return different images.
 */
export function setNoCache(c: Context) {
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");
  c.header("Surrogate-Control", "no-store");
  c.header("X-IkanHub-Cache", "no-cache");
}

/**
 * Set response headers for long-lived caching (for deterministic endpoints).
 *
 * The result is immutable — the same URL always returns the same resource.
 */
export function setLongCache(c: Context) {
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  c.header("X-IkanHub-Cache", "long-cache");
}
