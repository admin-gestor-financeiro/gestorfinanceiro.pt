// Cloudflare Workers extends CacheStorage with a `default` named cache.
// The standard DOM lib (used by Next.js) doesn't include this property,
// so we augment it here to keep TypeScript happy during `next build`.
// See: https://developers.cloudflare.com/workers/runtime-apis/cache/

interface CacheStorage {
  readonly default: Cache;
}
