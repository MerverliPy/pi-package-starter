const FORCE_BLOCK_PATTERNS = [
  /(^|[\s;|&])(rm\s+-rf\b)/i,
  /\bsudo\b/i,
  /\bchmod\s+777\b/i,
  /\bdd\b/i,
  /\bmkfs\b/i,
  /\bsu\b/i,
  /\bnohup\b/i,
  /\bchown\b/i,
  /\bkill\b/i,
  /\bkillall\b/i,
  /\|\s*sh\b/i,
  /\bssh\b/i,
  /`/,
  /\$\(/,
  /&&|\|\||>|<|>>|<<|\bcat\s+>/,
];

const SAFE_BASH_PATTERNS = [
  /^pwd$/,
  /^ls(\s+(-a|-[al]+))?$/,
  /^cat\s+(?:[A-Za-z0-9_./-]+)$/,
  /^echo\s+.+$/,
  /^find\s+[A-Za-z0-9_./-]+\s+(?:-maxdepth|-[mp]ath|-[nt])?.*$/,
  /^rg\s+.+$/,
  /^grep\s+.+$/,
  /^git\s+(status|log|show|branch|checkout|add|restore|stash|fetch|pull|push|clone|commit|merge|rebase|tag|rev-parse|ls-files|ls-tree|reset)(\s+.+)?$/,
  /^npm\s+(test|run|ci|ls|help)(\s+.+)?$/,
  /^node\s+.+$/,
];

const GIT_DIFF_ALLOWED_OPTIONS = new Set([
  "--cached",
  "--stat",
  "--name-only",
  "--name-status",
  "--word-diff",
  "--unified",
  "--unified=0",
  "--unified=1",
  "--no-index",
]);

function hasControlCharacters(command) {
  return FORCE_BLOCK_PATTERNS.some((pattern) => pattern.test(command));
}

function tokenizeSimple(command) {
  return command
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function isRevisionLike(value) {
  return /^\.\.?$/.test(value)
    ? false
    : /^(?:[A-Za-z0-9._@./-]+|HEAD|HEAD~\d+)$/.test(value) || value === "--";
}

function isSafePath(value) {
  if (value.includes("..")) {
    return false;
  }

  return value
    .split("/")
    .filter((segment) => segment.length > 0)
    .every((segment) => /^[A-Za-z0-9._@-]+$/.test(segment));
}

function isGitDiffCommandSafe(command) {
  const trimmed = command.trim();
  if (!/^git\s+diff\b/.test(trimmed)) {
    return false;
  }

  const args = tokenizeSimple(trimmed.replace(/^git\s+diff\s*/, ""));
  if (args.length === 0) return true;

  let hasSeparator = false;
  for (const token of args) {
    if (token === "--") {
      hasSeparator = true;
      continue;
    }

    if (!hasSeparator) {
      if (token.startsWith("-")) {
        const base = token.includes("=") ? token.split("=")[0] : token;
        if (!GIT_DIFF_ALLOWED_OPTIONS.has(base)) {
          return false;
        }
        continue;
      }

      if (!isRevisionLike(token)) {
        return false;
      }
      continue;
    }

    if (!isSafePath(token)) {
      return false;
    }
  }

  return true;
}

export function evaluateBashCommand(command) {
  const trimmed = command.trim();

  if (!trimmed) {
    return {
      decision: "block",
      reason: "Empty command is not allowed. Provide a valid command.",
    };
  }

  if (hasControlCharacters(trimmed)) {
    const matched = FORCE_BLOCK_PATTERNS.find((pattern) => pattern.test(trimmed));
    return {
      decision: "block",
      reason: `Command blocked by strict policy: ${matched?.source ?? "disallowed shell pattern"}`,
    };
  }

  if (/^git\s+diff\b/.test(trimmed)) {
    if (isGitDiffCommandSafe(trimmed)) {
      return { decision: "allow", reason: "Safe git diff command detected." };
    }
    return {
      decision: "confirm",
      reason: "This git diff command is non-standard. Confirm to continue.",
    };
  }

  if (SAFE_BASH_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { decision: "allow" };
  }

  return {
    decision: "confirm",
    reason: "Command is not in the strict allowlist.",
  };
}

export { GIT_DIFF_ALLOWED_OPTIONS, FORCE_BLOCK_PATTERNS, SAFE_BASH_PATTERNS, isGitDiffCommandSafe, hasControlCharacters, isSafePath, isRevisionLike, tokenizeSimple };
