import assert from "node:assert/strict";
import { execSync } from "node:child_process";

function run(command) {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    return { code: 0, output };
  } catch (error) {
    return {
      code: error.status ?? 1,
      output: `${error.stdout?.toString() ?? ""}${error.stderr?.toString() ?? ""}`,
    };
  }
}

const cases = [
  {
    name: "check passes",
    command: "./scripts/release.sh --check",
    code: 0,
    includes: "Release check completed.",
  },
  {
    name: "dry run passes",
    command: "./scripts/release.sh --dry-run",
    code: 0,
    includes: "Release dry run completed.",
  },
  {
    name: "note requires text",
    command: "./scripts/release.sh --note",
    code: 1,
  },
  {
    name: "multiple version arguments",
    command: "./scripts/release.sh patch minor",
    code: 1,
  },
];

for (const testCase of cases) {
  const result = run(testCase.command);
  assert.equal(
    result.code,
    testCase.code,
    `${testCase.name}: expected exit code ${testCase.code}, got ${result.code}`,
  );

  if (testCase.includes) {
    assert.ok(
      result.output.includes(testCase.includes),
      `${testCase.name}: output should include ${JSON.stringify(testCase.includes)}`,
    );
  }
}

console.log("release script tests passed");
