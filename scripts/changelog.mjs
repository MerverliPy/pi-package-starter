#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const usage = `Usage:
  node ./scripts/changelog.mjs <version> "item 1" ["item 2" ...]

Adds changelog entries for a new release section.
`;

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(usage);
  process.exit(1);
}

const version = args[0].replace(/^v/, "");
const entries = args.slice(1).map((item) => item.trim()).filter(Boolean);

if (!version) {
  console.error("Missing version.");
  console.error(usage);
  process.exit(1);
}

if (entries.length === 0) {
  console.error("Missing changelog entry text.");
  process.exit(1);
}

const path = "CHANGELOG.md";
const content = readFileSync(path, "utf8");
const lines = content.split(/\r?\n/);

const unreleasedIndex = lines.findIndex((line) => line.trim() === "## Unreleased");
if (unreleasedIndex === -1) {
  console.error("Could not find a ## Unreleased section in CHANGELOG.md");
  process.exit(1);
}

const formattedEntries = entries.map((entry) => `- ${entry}`);
const existingVersionIndex = lines.findIndex((line, index) =>
  index > unreleasedIndex && line.startsWith(`## [${version}]`)
);

if (existingVersionIndex !== -1) {
  let insertAt = existingVersionIndex + 1;
  while (insertAt < lines.length && lines[insertAt].trim() === "") insertAt++;
  lines.splice(insertAt, 0, "", ...formattedEntries, "");
} else {
  let insertAt = lines.length;
  for (let i = unreleasedIndex + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }

  const date = new Date().toISOString().split("T")[0];
  const section = [
    `## [${version}] - ${date}`,
    "",
    ...formattedEntries,
    "",
  ];
  lines.splice(insertAt, 0, ...section);
}

writeFileSync(path, `${lines.join("\n").replace(/\n*$/, "\n")}`);
