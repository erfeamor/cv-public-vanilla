# cv-public-vanilla

Public résumé landing page: lightweight, framework-free, consumes [cv-bff-node](../cv-bff-node).

Part of the [cv-project](../README.md) multi-repo. Pipeline: GitHub Actions.

## Stack

- HTML5 + CSS3 + vanilla JS (ES modules)
- Vite (dev/build only, no framework runtime shipped)
- Vitest (TDD)

## Local development

```bash
cp .env.example .env      # optional: dev defaults to the BFF on localhost:3000
npm install
npm run dev                 # start on :4173
npm test                    # run the test suite
```

## Structure

- `src/cvCard.js` — pure, DOM-free rendering function (easy to unit test)
- `src/main.js` — fetches from the BFF and mounts the card into `#app`
- `src/bffUrl.js` — picks the BFF base URL (see below)

## BFF URL

- **Production build, `VITE_BFF_URL` unset:** calls `/bff/api/v1/people/<id>/cv` **relative**, on the page's own origin. CloudFront routes `/bff/*` to the BFF, so there's no CORS and nothing machine-local baked in.
- **Dev (`npm run dev`), unset:** `http://localhost:3000`.
- **`VITE_BFF_URL` set:** used as-is in both modes, trailing slashes stripped.

CI fails the build if `dist/` contains `localhost:3000`.

## Deploy

GitHub Actions (`.github/workflows/ci.yml`, `deploy` job) on **push to `master` only**; PRs never deploy. It downloads the tested `dist` artifact, re-checks for `localhost:3000`, assumes the AWS role named by the repo variable **`AWS_DEPLOY_ROLE_ARN`** via GitHub OIDC (no stored AWS keys), and then:

1. `aws s3 sync dist/ s3://cv-project-frontend-dev/ --exclude "admin/*" --exclude "index.html" --cache-control "public, max-age=31536000, immutable"`
2. `aws s3 sync dist/ s3://cv-project-frontend-dev/ --delete --exclude "admin/*" --cache-control "no-cache"`
3. `aws cloudfront create-invalidation --distribution-id E2AV0INGJW1UO2 --paths "/index.html" "/"`

The site goes to the bucket **root**. `admin/` belongs to cv-admin-react, and every sync excludes it so `--delete` can't remove the admin. The role also denies `admin/*` as a second guard.
