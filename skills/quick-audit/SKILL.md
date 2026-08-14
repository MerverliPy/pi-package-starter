---
name: quick-audit
description: Quickly inspect files for obvious issues, risky commands, and missing tests in a small code change.
metadata:
  category: quality
target: review
allowed-tools: read edit write grep find
disable-model-invocation: false
---

# Quick Audit

Use this skill when a user wants a fast, practical audit of recent code changes.

## Setup

1. Inspect staged or changed files first.
2. Keep feedback concise.
3. Focus on:
   - correctness risks
   - obvious regressions
   - potential breakages in tests
   - risky shell commands being suggested

## Procedure

Given a target path:

1. Review the changed files with clear headings.
2. Call out high-confidence issues before stylistic suggestions.
3. Suggest exact edits and rationale.
4. If you recommend a risky command, add an explicit warning.
5. Keep the report short but complete enough to take action.

## Output Format

- `Findings`: list by priority (High / Medium / Low)
- `Recommendations`: concrete next actions
- `No-Go`: command patterns to avoid

## References

See:
- `references/checklist.md` for a severity-first audit matrix.
- `references/security-notes.md` for common risky commands and safe alternatives.

## Optional

Use `references/` files for project-specific guidance.
