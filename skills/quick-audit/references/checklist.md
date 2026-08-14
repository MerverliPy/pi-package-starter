# Quick Audit Checklist

## 1) Correctness

- [ ] Is there a logic regression hidden by happy-path assumptions?
- [ ] Are input validations still sufficient for edge cases?
- [ ] Are defaults changing behavior silently?

## 2) Data and state

- [ ] Are writes guarded with clear ownership and ordering?
- [ ] Could concurrent or repeated execution cause duplicate effects?
- [ ] Are cleanup steps missing on error paths?

## 3) Testing

- [ ] Does this change break existing tests?
- [ ] Are there new tests for branches/edge cases touched?
- [ ] Are mocks/fakes still accurate after shape changes?

## 4) Security / Operations

- [ ] Any shell command injection or destructive command?
- [ ] Any credentials or secrets in logs / diffs?
- [ ] Are paths normalized before file operations?

## 5) Actionability

- [ ] Findings are tagged by severity.
- [ ] Recommended fix is minimal and testable.
- [ ] Include specific commands/files for each blocking item.