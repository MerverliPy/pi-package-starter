# My Pi Starter Package

A GitHub-ready starter for building and sharing a **Pi package** containing:

- one extension (`extensions/`)
- one skill (`skills/quick-audit`)
- one prompt template (`prompts/review-with-lens.md`)
- one theme (`themes/starter-cyan.json`)

This version includes:
- `scripts/release.sh` for local release prep/publish
- strict extension security policy with safe command allowlist + interactive confirmation
- richer skill references for audit guidance
- CI workflow for validation on pull requests
- release workflow for publishing on `v*` git tags

## Install from local path

```bash
pi install /home/calvin/pi-package-starter
```

For local extension runtime testing:

```bash
pi -e /home/calvin/pi-package-starter/extensions/index.ts
```

## Install from git

Once pushed to GitHub:

```bash
pi install git:github.com/<you>/<repo>
```

## Use in Pi

- Command: `/pkg-status`
- Command: `/pkg-version` (reads `package.json` version dynamically)
- Tool: `package_stamp`
- Skill: `/skill:quick-audit`
- Prompt template: `/review-with-lens`
- Theme: `starter-cyan` (from `/settings`)

## Release scripts

```bash
# validate package + pack shape
./scripts/release.sh --check

# run automated tests
npm test

# run a dry-run publish
./scripts/release.sh --dry-run

# bump version, add changelog notes, and publish (manual step)
./scripts/release.sh patch --note "Added changelog entry" --publish

# fully automated release flow: bump + changelog + commit + tag + publish
./scripts/release.sh 0.2.0 --note "Release notes" --auto

# simulate the full auto flow without committing, tagging, or publishing
./scripts/release.sh 0.2.1 --note "Release notes" --auto --dry-run

# same as above but also push branch + tag
./scripts/release.sh 0.2.0 --note "Release notes" --auto --push
```

You can also add changelog entries directly:

```bash
npm run changelog:add -- 0.2.0 "Added safer bash gate" "Improved extension docs"
```

### GitHub tag-driven release flow

1. Bump version and create a git tag:
   ```bash
   npm version patch
   git push --follow-tags
   ```
2. Push the tag to GitHub (`vX.Y.Z`).
3. GitHub `release` workflow publishes automatically.

Make sure `NPM_TOKEN` is configured in repository secrets.

## GitHub repository layout

- `extensions/`: runtime extension code
- `skills/quick-audit/`: skill definitions
- `skills/quick-audit/references/`: skill reference docs
- `prompts/`: prompt templates
- `themes/`: theme JSON files
- `scripts/`: validation/release scripts
- `.github/workflows/ci.yml`: runs on push/PR
- `.github/workflows/release.yml`: publishes package on version tags
- `CHANGELOG.md`: release notes history
- `CONTRIBUTING.md`: contributor guidelines
- `SECURITY.md`: security policy
- `LICENSE`: package license

## Files

- `extensions/index.ts` – custom command + custom tool + safety gate
- `extensions/policy.js` – shared bash policy evaluator used by extension + tests (including confirm/block/allow decisions)
- `skills/quick-audit/SKILL.md` – reusable workflow skill
- `prompts/review-with-lens.md` – prompt template
- `themes/starter-cyan.json` – sample custom theme

## Notes

- `package.json` uses a `pi` manifest and `files` list for package publishing.
- Core Pi packages are listed as `peerDependencies`.
- Update the package name and version before publishing to npm.

