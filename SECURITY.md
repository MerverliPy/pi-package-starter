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

## Scope & limitations

The bash command policy gates the built-in `bash` tool only. It does **not** govern:

- The `ctx_execute` (context-mode) MCP sandbox, which runs shell/JS/Python etc. directly.
- The `write` / `edit` / `read` file tools, which can create or read arbitrary files.
- Other agent tools (`package_stamp`, subagent tooling, etc.).

This is a **guardrail and tripwire**, not an OS security boundary. A determined or
adversarial model can route around it by composing shell syntax, invoking interpreters
via `-c`, or using the un-gated tools listed above. For a hard boundary against
untrusted code, run pi inside a container / VM / remote sandbox (see Pi's
containerization docs).

This package's sample extension enforces a strict bash command policy:

- **Hard-blocked** destructive patterns: `rm -rf`, `sudo`, `chmod 777`, `dd`, `mkfs`, `su`, `nohup`, `chown`, `kill`, `ssh`, and shell injection constructs (backticks, `$(...)`, `&&`, `||`, redirection).
- **Confirm-required** side-effectful commands: `node <script>`, `npm test/run/ci/install`, and mutating `git` commands.
- **Allowlisted** safe commands, including an explicit `git diff` allowlist, plus repo-constitution
  ceremony commands (`bash scripts/plan-lock.sh verify|status|propose`, `verify-env.sh`, `run-all-checks.sh`).
  `plan-lock.sh init` and `approve` are force-blocked (human-only).

See `extensions/policy.js` for the full evaluator.
