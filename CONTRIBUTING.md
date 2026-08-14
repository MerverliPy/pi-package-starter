# Contributing

Thanks for contributing! Pi Smithy is intentionally small and easy to maintain.

## Prerequisites

- Node.js 22+
- npm 10+

## Local setup

```bash
git clone <repo>
cd <repo>
npm install
```

## Make changes

1. Edit files under `extensions/`, `skills/`, `prompts/`, or `themes/`.
2. Update docs and examples if behavior changes.
3. Validate:

   ```bash
   npm run release:check
   npm test
   ```

## Changelog hygiene

For each user-facing change, add a changelog note (you can pass multiple notes in one call):

```bash
node ./scripts/changelog.mjs <version> "Your change summary"
```

## Release workflow

The release tooling is the source of truth for shipping — the README intentionally defers here.

### Validate and pack

```bash
# validate package + pack shape
./scripts/release.sh --check

# run automated tests
npm test

# dry-run publish (no commit, no tag, no publish)
./scripts/release.sh --dry-run
```

### Manual release

```bash
# bump version, add changelog notes, and publish (publish is the manual step)
./scripts/release.sh patch --note "Added changelog entry" --publish
```

### Fully automated release

```bash
# bump + changelog + commit + tag + publish in one step
./scripts/release.sh 0.2.0 --note "Release notes" --auto

# simulate the full auto flow without committing, tagging, or publishing
./scripts/release.sh 0.2.1 --note "Release notes" --auto --dry-run

# same as above but also push branch + tag
./scripts/release.sh 0.2.0 --note "Release notes" --auto --push
```

### GitHub tag-driven release

1. Bump the version and create a git tag:

   ```bash
   npm version patch
   git push --follow-tags
   ```

2. Push the tag to GitHub (`vX.Y.Z`).
3. The GitHub `release` workflow publishes automatically.

> Make sure `NPM_TOKEN` is configured in repository secrets.

## Pull requests

- Keep changes focused and minimal.
- Include clear notes in your PR description.
- Run validation before opening a PR.
