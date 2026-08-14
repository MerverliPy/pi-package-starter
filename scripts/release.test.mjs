import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

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

function git(args) {
  return execSync(`git ${args}`, { encoding: "utf8" }).trim();
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
  {
    name: "auto requires version",
    command: "./scripts/release.sh --auto",
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

// --auto --dry-run must simulate the flow without publishing, without creating
// git tags, and without leaving file mutations behind.
const mutableFiles = ["package.json", "package-lock.json", "CHANGELOG.md"];
const snapshots = new Map();
for (const file of mutableFiles) {
  if (existsSync(file)) {
    snapshots.set(file, readFileSync(file, "utf8"));
  }
}
const tagsBefore = git("tag --list");

let autoDryRun;
try {
  autoDryRun = run("./scripts/release.sh --auto --dry-run patch");
} finally {
  for (const [file, content] of snapshots) {
    writeFileSync(file, content);
  }
}

assert.equal(
  autoDryRun.code,
  0,
  `auto dry-run: expected exit 0, got ${autoDryRun.code}: ${autoDryRun.output}`,
);
assert.ok(
  autoDryRun.output.includes("Auto release dry run completed"),
  "auto dry-run should report completion",
);
assert.ok(
  !autoDryRun.output.includes("Auto release completed for"),
  "auto dry-run must not run the real publish path",
);
assert.equal(git("tag --list"), tagsBefore, "auto dry-run must not create git tags");
assert.equal(
  readFileSync("package.json", "utf8"),
  snapshots.get("package.json"),
  "auto dry-run must restore package.json",
);

console.log("release script tests passed");
