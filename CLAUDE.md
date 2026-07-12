# CLAUDE.md — cv-public-vanilla

Public CV landing page: **vanilla ES modules, zero framework runtime**. Vite is build/dev tooling only — nothing framework-shaped ships to the browser, that's the point of this repo in the demo. Consumes cv-bff-node (:3000). Cross-repo context: meta repo CLAUDE.md one directory up.

## Commands

```bash
npm install
npm test                   # Vitest (jsdom)
npm run lint               # eslint
npm run dev                # :4173 (cp .env.example .env first)
npm run build              # static bundle (deploy target: S3+CloudFront)
```

CI: `.github/workflows/ci.yml` (lint → test → build → dist artifact).

## Architecture & conventions — the pattern is the law here

- **Rendering = pure functions returning HTML strings**, DOM-free, one per concern (`src/cvCard.js` is the reference). This is what makes them unit-testable without a framework. New sections: same shape, composed in `src/main.js`, which owns the single fetch + mount into `#app`.
- **Every interpolated value goes through HTML escaping** (`escapeHtml` in `cvCard.js`). Each renderer's test suite includes an XSS case (`<script>` in input → escaped in output) — `cvCard.test.js` shows the required trio: happy path, optional-field omission, escape.
- Empty data renders nothing (no empty section headings), and that is asserted in tests.
- Env: `VITE_BFF_URL`, `VITE_PERSON_ID` via `import.meta.env` (Vitest handles `import.meta` natively — no babel workaround needed here, unlike cv-admin-react).
- No dependencies without a strong reason: the `devDependencies` list is the whole toolchain, `dependencies` is empty and should stay empty.

## Git workflow

`master` is protected — feature branch (`feat/…`) → push → PR via `gh`. Definition of done: renderer tests (incl. XSS case), lint clean, build succeeds.
