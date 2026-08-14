import assert from "node:assert/strict";
import { evaluateBashCommand } from "../extensions/policy.js";

const TABLE = [
  { label: "empty command", command: "", decision: "block", reason: "not allowed" },
  { label: "destructive command", command: "rm -rf dist", decision: "block" },
  { label: "unsafe elevated command", command: "sudo npm publish", decision: "block" },
  { label: "safe pwd", command: "pwd", decision: "allow" },
  { label: "safe ls", command: "ls -a", decision: "allow" },
  { label: "safe cat", command: "cat README.md", decision: "allow" },
  { label: "safe git diff", command: "git diff", decision: "allow" },
  { label: "safe git diff options", command: "git diff --stat HEAD~1 HEAD", decision: "allow" },
  { label: "unsafe git diff path", command: "git diff HEAD~1 HEAD -- ../../../../etc/passwd", decision: "confirm" },
  { label: "blocked redirection", command: "cat > secrets.txt", decision: "block" },
  { label: "confirm unknown command", command: "python -c \"print('x')\"", decision: "confirm" },
];

for (const test of TABLE) {
  const result = evaluateBashCommand(test.command);
  assert.equal(
    result.decision,
    test.decision,
    `${test.label}: expected ${test.decision}, got ${result.decision}`,
  );

  if (test.reason) {
    assert.match(result.reason, new RegExp(test.reason), `${test.label}: missing expected reason`);
  }
}

console.log("policy evaluator tests passed");
