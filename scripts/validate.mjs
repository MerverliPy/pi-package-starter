#!/usr/bin/env node
import { accessSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, isAbsolute } from "node:path";
import { constants } from "node:fs";

const requiredFiles = [
  "extensions/index.ts",
  "skills/quick-audit/SKILL.md",
  "skills/quick-audit/references/checklist.md",
  "skills/quick-audit/references/security-notes.md",
  "prompts/review-with-lens.md",
  "themes/starter-cyan.json",
  "scripts/release.sh",
  "scripts/validate.mjs",
  "scripts/changelog.mjs",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CHANGELOG.md",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
];

const FRONTMATTER_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;

function ensureFile(file) {
  accessSync(file, constants.F_OK);
}

function unquote(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseFrontmatter(content, filePath) {
  const lines = content.split(/\r?\n/);

  if ((lines[0] ?? "").trim() !== "---") {
    throw new Error(`${filePath} is missing a YAML frontmatter block.`);
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }

  if (end === -1) {
    throw new Error(`${filePath} has an unterminated YAML frontmatter block.`);
  }

  const metadata = {};
  for (let i = 1; i < end; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) {
      throw new Error(`${filePath} contains invalid frontmatter at line ${i + 1}: ${rawLine}`);
    }

    const [, key, value] = match;
    metadata[key] = unquote(value);
  }

  return metadata;
}

function validateSkillFile(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const meta = parseFrontmatter(raw, filePath);

  if (typeof meta.name !== "string" || !meta.name.trim()) {
    throw new Error(`${filePath} is missing required frontmatter field: name`);
  }

  const name = meta.name.trim();
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`${filePath} skill name exceeds ${MAX_NAME_LENGTH} characters.`);
  }
  if (!FRONTMATTER_NAME_REGEX.test(name)) {
    throw new Error(
      `${filePath} has invalid skill name \"${name}\". Use lowercase letters, numbers, and hyphens (no leading, trailing, or consecutive hyphens).`,
    );
  }

  if (typeof meta.description !== "string" || !meta.description.trim()) {
    throw new Error(`${filePath} is missing required frontmatter field: description`);
  }

  if (meta.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(
      `${filePath} description exceeds ${MAX_DESCRIPTION_LENGTH} characters (${meta.description.length}).`,
    );
  }
}

function collectSkillFiles(manifestPath) {
  const seen = new Set();
  const files = [];

  const walk = (current) => {
    if (seen.has(current)) {
      return;
    }

    seen.add(current);
    const absolute = isAbsolute(current) ? current : join(process.cwd(), current);
    let stat;

    try {
      stat = statSync(absolute);
    } catch {
      throw new Error(`Configured skill path does not exist: ${manifestPath}`);
    }

    if (stat.isDirectory()) {
      for (const entry of readdirSync(absolute, { withFileTypes: true })) {
        const fullPath = join(absolute, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
          continue;
        }

        if (entry.isFile() && entry.name === "SKILL.md") {
          files.push(fullPath);
        }
      }
      return;
    }

    if (basename(absolute) === "SKILL.md" && stat.isFile()) {
      files.push(absolute);
    }
  };

  walk(manifestPath);
  return files;
}

try {
  for (const file of requiredFiles) {
    ensureFile(file);
  }

  const pkgRaw = readFileSync("package.json", "utf8");
  const pkg = JSON.parse(pkgRaw);
  if (!pkg.name || !pkg.version) {
    throw new Error("package.json must define name and version.");
  }

  const pi = pkg.pi;
  if (!pi || !Array.isArray(pi.extensions) || !Array.isArray(pi.skills) || !Array.isArray(pi.themes)) {
    throw new Error("package.json must define a pi manifest with extensions, skills, themes arrays.");
  }

  if (!Array.isArray(pi.prompts) || !pi.prompts.length) {
    throw new Error("package.json must define a non-empty pi.prompts array.");
  }

  const skillFiles = pi.skills.flatMap(collectSkillFiles);
  if (!skillFiles.length) {
    throw new Error("package.json.skills did not resolve to any SKILL.md files.");
  }

  for (const file of skillFiles) {
    validateSkillFile(file);
  }

  console.log("Package validation passed.");
  console.log(`Validated ${skillFiles.length} skill manifest(s).`);
} catch (error) {
  console.error(`Validation failed: ${error.message}`);
  process.exit(1);
}
