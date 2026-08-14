# Security Notes for Audits

## High-risk shell patterns

Avoid suggesting commands like:

- `rm -rf /` / recursive deletes
- `sudo` in non-setup tasks
- unbounded network fetch piped into shell evaluators
- secret-bearing debug output

## Safer alternatives

- Use scoped, explicit paths.
- Prefer dry-run or `--no` flags when available.
- Confirm user intent before destructive operations.
- Keep destructive file ops behind explicit, reviewed approvals.