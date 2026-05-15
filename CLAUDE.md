# Claude Code Guidance

## Monorepo Structure

This is an **npm workspaces** monorepo. All extension packages live under `packages/`:

```
packages/
├── tree-size-core/      # Shared types, utilities, webview helpers (no package-lock)
├── json-tree-size/      # JSON Tree Size VS Code extension
└── xml-tree-size/       # XML Tree Size VS Code extension
```

### Installing dependencies

- **Always install from the repo root**: `npm install <pkg> -w packages/<target-package>`
- **Never** `cd` into a package and run `npm install` — this desyncs the root lock file and breaks CI (`npm ci` fails).
- After any dependency change, verify the root `package-lock.json` was updated and commit it.
- Shared code in `tree-size-core` is imported via relative paths (e.g., `../../tree-size-core/src/types`), not published to npm.

### Frozen identifiers

- The JSON extension marketplace name is `json-treesize` (no dash). **Do not rename** the `name` field in `packages/json-tree-size/package.json`.
- JSON commands use `jsonTreeSize.*` prefix; XML commands use `xmlTreeSize.*` prefix.

## Deployment

**Deployment is fully automated via GitHub Actions.**

When asked to "deploy" or "release":
1. Run the appropriate npm release script **from the repo root**:
   - JSON: `npm run release:json:patch`, `release:json:minor`, or `release:json:major`
   - XML: `npm run release:xml:patch`, `release:xml:minor`, or `release:xml:major`
2. That's it — `scripts/release.js` handles the full flow:
   - Validates a clean working tree
   - Bumps the version (runs tests + compile via `preversion` hook)
   - Syncs the root `package-lock.json`
   - Commits, tags (`json-v*` / `xml-v*`), and pushes
3. GitHub Actions picks up the tag and publishes to the VS Code Marketplace automatically

**Never** run `vsce:publish` or attempt a manual marketplace publish.

**Never** run `npm version` directly inside a package directory — the monorepo root lock file won't be staged, the commit will be incomplete, and the push will silently do nothing. Always use the root `npm run release:*` scripts.

## Git Commit Hygiene

- **Never amend pushed commits** — always create new commits. `git commit --amend` rewrites history and causes divergent branches that require force-pushes.
- **Never use `git push --force`** or `--force-with-lease` — if local and remote diverge, fix by resetting to origin and creating a new commit.
- When committing multiple related changes, split them into sequential commits that show evolutionary progress.

## Build

```bash
npm run compile   # one-time build
npm run watch     # watch mode during development
```

`@vscode/l10n` must be bundled (not external) in `esbuild.js` — VS Code does not provide it as a built-in runtime module.

## Testing

```bash
npm test
```

## SonarCloud Workflow

When investigating SonarCloud failures, do not start from editor diagnostics alone.

1. Check the latest GitHub Actions Sonar run first:
   - `gh run list --workflow sonarcloud.yml --limit 5 --json databaseId,displayTitle,headSha,status,conclusion,createdAt,updatedAt`
   - `gh run view <run-id> --json status,conclusion,url,jobs`
2. Query the live SonarCloud result directly:
   - Quality gate: `curl --silent --show-error 'https://sonarcloud.io/api/qualitygates/project_status?projectKey=aruanoguate_file-tree-size'`
   - Open issues: `curl --silent --show-error 'https://sonarcloud.io/api/issues/search?componentKeys=aruanoguate_file-tree-size&resolved=false&ps=100'`
   - Use the live issue list to identify the exact file, rule, and metric before editing anything.
3. Run the local preflight before pushing fixes:
   - `npm run test:all`
   - `npm run compile`
   - For TypeScript-specific findings, run focused checks such as `npx tsc -p packages/<package>/tsconfig.json --noEmit`.
4. If the finding touches shared browser/webview code imported across packages, make sure the owning `tsconfig.json` files include the correct DOM libs and a `rootDir` that actually covers shared sources.
5. If `SONAR_TOKEN` is available locally, reproduce the CI scan as closely as possible:
   - `npm ci`
   - `npm --prefix packages/tree-size-core run test -- --coverage --ci`
   - `npm --prefix packages/json-tree-size run test -- --coverage --ci`
   - `npm --prefix packages/xml-tree-size run test -- --coverage --ci`
   - `npm --prefix packages/tree-size-preview run test -- --coverage --ci`
   - Rewrite LCOV paths exactly as in `.github/workflows/sonarcloud.yml`
   - `sonar-scanner`
6. After pushing a fix, re-check both the GitHub Actions run and the public SonarCloud APIs. Public issue data can lag until the new analysis completes.
