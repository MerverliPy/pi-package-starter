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

## Hardening notes for this starter

- Extensions are loaded with your user permissions in Pi.
- Review package code before installing.
- The sample extension uses a strict bash command allowlist with:
  - hard-blocked destructive patterns (e.g. `rm -rf`, `sudo`, `chmod 777`)
  - confirm-required commands outside the allowlist
  - explicit `git diff` allowlist when used.
