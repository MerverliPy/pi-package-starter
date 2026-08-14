# Security Policy

## Supported versions

This package is currently maintained for the `main` branch.

## Reporting a vulnerability

If you discover a security issue, please report it responsibly:

- Open a private issue or email the maintainer.
- Include:
  - affected version(s)
  - steps to reproduce
  - potential impact
  - suggested fix if possible

Please do not share sensitive exploit details publicly.

## Hardening notes

Extensions are loaded with your user permissions in Pi — review package code before installing.

This package's sample extension enforces a strict bash command policy:

- **Hard-blocked** destructive patterns: `rm -rf`, `sudo`, `chmod 777`, `dd`, `mkfs`, `su`, `nohup`, `chown`, `kill`, `ssh`, and shell injection constructs (backticks, `$(...)`, `&&`, `||`, redirection).
- **Confirm-required** side-effectful commands: `node <script>`, `npm test/run/ci/install`, and mutating `git` commands.
- **Allowlisted** safe commands, including an explicit `git diff` allowlist.

See `extensions/policy.js` for the full evaluator.
