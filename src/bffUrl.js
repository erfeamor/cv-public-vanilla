// Base URL the page prefixes to /bff/api/v1/... when calling the BFF.
//
// - An explicit VITE_BFF_URL always wins (trailing slashes stripped, so a
//   hand-typed `https://x/` can never produce `https://x//bff/...`).
// - A production build without it uses '' — relative, same-origin calls: the
//   site and the BFF share the CloudFront domain (/bff/* routes to the BFF),
//   so there is no CORS dependency and nothing machine-local gets baked in.
// - Dev without it falls back to the local BFF on :3000.
//
// Takes the env values as a parameter (main.js passes them from
// import.meta.env) so the decision is a pure function, unit-testable without
// stubbing Vite.
//
// The localhost literal is additionally guarded by import.meta.env.DEV, which
// Vite replaces with `false` in a production build, so the string is dropped
// from dist/ entirely (CI greps for it and fails on a hit). Under Vitest DEV
// is true, so the dev-fallback test still sees it.
const LOCAL_BFF_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function resolveBffBaseUrl(env) {
  const explicit = (env.VITE_BFF_URL ?? '').trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  return env.PROD ? '' : LOCAL_BFF_URL;
}
