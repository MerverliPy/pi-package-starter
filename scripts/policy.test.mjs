import assert from "node:assert/strict";
import { evaluateBashCommand } from "../extensions/policy.js";

const TABLE = [
  { label: "empty command", command: "", decision: "block", reason: "not allowed" },
  { label: "destructive command", command: "rm -rf dist", decision: "block" },
  { label: "destructive command alt flags", command: "rm -fr dist", decision: "block" },
  { label: "destructive command env wrapped", command: "(rm -rf dist)", decision: "block" },
  { label: "destructive command brace wrapped", command: "{ rm -rf dist; }", decision: "block" },
  { label: "unsafe elevated command", command: "sudo npm publish", decision: "block" },
  { label: "safe pwd", command: "pwd", decision: "allow" },
  { label: "safe ls", command: "ls -a", decision: "allow" },
  { label: "safe cat", command: "cat README.md", decision: "allow" },
  { label: "safe git diff", command: "git diff", decision: "allow" },
  { label: "safe git diff options", command: "git diff --stat HEAD~1 HEAD", decision: "allow" },
  { label: "unsafe git diff path", command: "git diff HEAD~1 HEAD -- ../../../../etc/passwd", decision: "confirm" },
  { label: "blocked redirection", command: "cat > secrets.txt", decision: "block" },
  { label: "blocked pipe to bash", command: "echo pwned | bash", decision: "block" },
  { label: "blocked command chaining", command: "echo ok; pwd", decision: "block" },
  { label: "confirm unknown command", command: "python -c \"print('x')\"", decision: "confirm" },
  { label: "node version allow", command: "node --version", decision: "allow" },
  { label: "node -v allow", command: "node -v", decision: "allow" },
  { label: "node -e confirm", command: "node -e \"process.exit(0)\"", decision: "confirm" },
  { label: "node script confirm", command: "node server.js", decision: "confirm" },
  { label: "npm ls allow", command: "npm ls", decision: "allow" },
  { label: "npm help allow", command: "npm help install", decision: "allow" },
  { label: "npm test confirm", command: "npm test", decision: "confirm" },
  { label: "npm run confirm", command: "npm run build", decision: "confirm" },
  { label: "npm install confirm", command: "npm install express", decision: "confirm" },
  { label: "git status allow", command: "git status --porcelain", decision: "allow" },
  { label: "git log allow", command: "git log --oneline -5", decision: "allow" },
  { label: "git grep dd allow", command: "git log --grep=dd -1", decision: "allow" },
  { label: "grep dd allow", command: "grep -rn \"dd\" .", decision: "allow" },
  { label: "git push confirm", command: "git push origin main", decision: "confirm" },
  { label: "git reset confirm", command: "git reset --hard HEAD~1", decision: "confirm" },
  { label: "git commit confirm", command: "git commit -m \"x\"", decision: "confirm" },
  { label: "xargs blocked", command: "xargs rm", decision: "block" },
  // Destructive find primaries and pipe-to-xargs must be force-blocked.
  { label: "find delete", command: "find / -delete", decision: "block" },
  { label: "find exec", command: "find . -exec rm -rf {} +", decision: "block" },
  { label: "find ok", command: "find . -ok rm {} \\;", decision: "block" },
  { label: "find execdir", command: "find /tmp -execdir rm -rf {} \\;", decision: "block" },
  { label: "find pipe xargs", command: "find . -name \"*.tmp\" | xargs rm -f", decision: "block" },
  { label: "grep pipe xargs", command: "grep -r \"x\" . | xargs rm", decision: "block" },
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
