# Changelog

## Unreleased

- Rebranded the package as **Pi Smithy** (`pi-smithy`):
  - New package identity: name, description, and keywords.
  - Theme renamed to `smithy-cyan`.
  - Extension output strings now read the package name/version from `package.json` (no hardcoded names).
- Reworked user-facing docs for clarity and visual appeal:
  - README: badge row, feature table, table of contents, command reference table, and a "Forge your own package" quickstart.
  - CONTRIBUTING: now the single source of truth for the release workflow.
  - SECURITY: clearer structure and a full policy summary.
  - CHANGELOG: removed internal review notes from the Unreleased section.
- Removed personal content from docs (local absolute paths, personal email in git history).

## [0.2.2] - 2026-08-14

- Add repository metadata so npm provenance verification passes on GitHub Actions

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
