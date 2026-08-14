# Contributing

Thanks for contributing! This package is intentionally small and easy to maintain.

## Prerequisites

- Node.js 20+
- npm 10+

## Local setup

```bash
git clone <repo>
cd <repo>
npm install
```

## Make changes

1. Edit files under `extensions/`, `skills/`, `prompts/`, or `themes/`.
2. Update docs/examples if behavior changes.
3. Validate:
   ```bash
   npm run release:check
   npm test
   ```

## Changelog hygiene

For each user-facing change:

```bash
node ./scripts/changelog.mjs <version> "Your change summary"
```

(You can pass multiple notes in one call by adding more quoted arguments.)

For full automated release in one step:

```bash
./scripts/release.sh <patch|minor|major|x.y.z> --note "Release notes" --auto
```

The `--auto` flag also commits and tags `v<version>`, then publishes to npm.
To push from the same command, add `--push`.

## Pull requests

- Keep changes focused and minimal.
- Include clear notes in your PR description.
- Run validation before opening PR.
