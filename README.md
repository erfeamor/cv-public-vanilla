# cv-public-vanilla

Public résumé landing page: lightweight, framework-free, consumes [cv-bff-node](../cv-bff-node).

Part of the [cv-project](../README.md) multi-repo. Pipeline: GitHub Actions.

## Stack

- HTML5 + CSS3 + vanilla JS (ES modules)
- Vite (dev/build only, no framework runtime shipped)
- Vitest (TDD)

## Local development

```bash
cp .env.example .env      # point at your cv-bff-node instance
npm install
npm run dev                 # start on :4173
npm test                    # run the test suite
```

## Structure

- `src/cvCard.js` — pure, DOM-free rendering function (easy to unit test)
- `src/main.js` — fetches from the BFF and mounts the card into `#app`
