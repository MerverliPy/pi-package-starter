# Changelog

## [0.3.2] - 2026-08-15

- **Fix: shipped tarball.** Version 0.3.1 published with the pre-patch `policy.js` because the release flow did not stage `extensions/`/`scripts/`/docs. This release ships the hardened bash gate and expanded tests that were previously missing.
- Hardened bash gate: pipe-to-interpreter blocking, `;`/`|` chaining, `rm` flag variants (`-fr`, subshell/brace wraps), `find -delete/-exec/-execdir/-ok/-okdir`, and `xargs`.
- Anchored the destructive-command blocklist to the leading command token (removes `dd`/`kill`/`su`/`ssh` false positives from searches).
- Allowlisted repo-constitution ceremony commands (`bash scripts/plan-lock.sh verify|status|propose`, `verify-env.sh`, `run-all-checks.sh`); `plan-lock.sh init`/`approve` remain human-only.
- Documented policy scope/limitations in SECURITY.md (bash-tool-only guardrail).

## [0.3.1] - 2026-08-15

- Bash gate: pipe/chaining/rm/find/xargs bypasses + repo-constitution cmd allowlist + scope docs

## Unreleased

- Added `benchmark/` — workflow stress benchmark (policy gate, manifest, skills, config, CLI, tooling, concurrency) with performance statistics, bug logging, root-cause debugging, and a generated fix plan.
- Fixed bash policy gate: force-block destructive `find` primaries (`-delete`, `-exec`, `-execdir`, `-ok`, `-okdir`) and `xargs` pipe vectors.
- Fixed release tooling: `--dry-run` / `--auto --dry-run` now use `npm pack --dry-run` (registry-independent) so dry-runs work for already-published versions.
- Ship `scripts/` in the npm tarball (added to the `files` allowlist).

## [0.3.1] - 2026-08-15

- Bash gate: pipe/chaining/rm/find/xargs
 bypasses + repo-constitution cmd allowlist + scope docs

## [0.3.0] - 2026-08-14

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
- Renamed the GitHub repository to `MerverliPy/pi-smithy` and updated all URLs.
- First npm release as `pi-smithy`; the previous `my-pi-package` releases are deprecated.

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
