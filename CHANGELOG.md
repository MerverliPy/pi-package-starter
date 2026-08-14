# Changelog

## Unreleased

- Review fixes (v2.1.1):
  - `--auto --dry-run` no longer publishes; it simulates bump + changelog + dry publish without commit/tag/publish.
  - Tightened bash policy: `node` / `npm test|run|ci|install` / mutating `git` commands now require confirmation.
  - Added edge-mode tests for `--auto --dry-run`, `--auto` without version, and node/npm/git policy decisions.

- Executed v2.1 polish pass:
  - Added policy evaluator extraction with shared `extensions/policy.js` module.
  - Added test coverage for command policy decisions and release script behavior.
  - Added skill frontmatter linting in package validation.
  - Made package version in `/pkg-version` and tool output dynamic from `package.json`.

- Initial scaffold with Pi extension, skill, prompt template, and theme.

## [0.2.1] - 2026-08-14

- Auto dry-run no longer publishes; simulates bump+changelog+dry publish
- Tightened bash policy: node, npm test/run/ci/install, and mutating git commands require confirmation
- Added edge-mode tests for release and policy paths

## [0.2.0] - 2026-08-14

- Added richer skill references and stricter bash command guardrails
- Added release:auto one-command publish+commit+tag workflow
- Added richer contribution/release automation

## [0.1.0] - 2026-08-14

- Initial scaffold with extension, skill, prompt template, and theme.
