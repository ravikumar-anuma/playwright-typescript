# Playwright Automation Project

This repository contains Playwright TypeScript automation and GitHub Actions to run tests and publish HTML reports to GitHub Pages.

## What I added

- GitHub Actions workflow: `.github/workflows/playwright-tests.yml`
  - Runs on `push` to `main` and `workflow_dispatch` (manual).
  - Supports running by tag (`smoke`, `regression`) via the `testType` input (do not include `@`).
  - Supports optional `folder` or `singleTest` inputs to run a folder or single test file.
  - Runs tests in parallel across browsers (chromium, firefox, webkit) using a job matrix.
  - Retries failed tests once (`--retries=1`).
  - Videos are recorded and screenshots are taken on failure (configured in `playwright.config.ts`).
  - Uploads per-browser `playwright-report-<browser>` artifacts and publishes a selected report to GitHub Pages (`gh-pages` branch).

- `playwright.config.ts` updated to enable video, screenshots on failure, headed mode, retries, and projects for browsers.

## How to trigger the GitHub Actions workflow

### On push
Push to the `main` branch. The workflow will run automatically.

### Manually (workflow dispatch)
1. Go to the repository `Actions` tab in GitHub.
2. Select `Playwright Tests` workflow.
3. Click `Run workflow` and provide inputs:
   - `testType`: `all` (default), `smoke`, or `regression` (do not include `@`).
   - `folder`: Optional path to tests folder (e.g., `src/tests/smoke`). Leave empty to run all tests.
   - `singleTest`: Optional single test file path (overrides folder).

Example: run only smoke-tagged tests across browsers by setting `testType` to `smoke`.

## How the workflow runs tests

- The workflow runs three jobs in parallel (matrix): `chromium`, `firefox`, `webkit`.
- Each job runs Playwright with `--project=<browser>` which maps to the projects in `playwright.config.ts`.
- Tests are run with `--retries=1` and `--workers=4`.
- HTML report from each job is renamed to `playwright-report-<browser>` and uploaded as an artifact.
- A final `publish` job downloads artifacts and publishes one report to GitHub Pages (prefers `chromium` if available).

## Where to find the HTML report

After a run completes, the workflow prints the report URL. The report will be published to:

```
https://<github-owner>.github.io/<repo-name>/
```

Replace `<github-owner>` and `<repo-name>` with your repository owner and name.

Note: Ensure GitHub Pages is enabled or allow the workflow to push to the `gh-pages` branch (the action will create the branch if missing).

## Running tests locally

- All tests:

```bash
npx playwright test
```

- By tag (e.g., smoke):

```bash
npx playwright test --grep @smoke
```

- Run a folder:

```bash
npx playwright test src/tests/smoke
```

- Run a single test file:

```bash
npx playwright test src/tests/Inventory.spec.ts
```

## Additional repository setup

1. In GitHub repository settings -> Pages, make sure the Pages source is set to `gh-pages` branch (if required). The workflow pushes to `gh-pages`.
2. Ensure the `GITHUB_TOKEN` is available to Actions (default).

## Notes & limitations

- The workflow publishes one report (chooses `chromium` when available). Combining multiple HTML reports into a single unified report is non-trivial; if you want a merged report, we can add a post-processing step to merge artifacts and generate a combined report.
- The workflow sets `workers=4` for test runs; adjust based on your CI quota.

---

If you want, I can:
- Add a merged-report step to combine per-browser results into a single report.
- Tweak which browser's report gets published.
- Add emails or PR comments with the report link.
