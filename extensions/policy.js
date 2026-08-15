const FORCE_BLOCK_PATTERNS = [
  /`/,
  /\$\(/,
  /&&|\|\||>>|<<|>|<|;|\|/,
  /\bcat\s+>/,
  /\|\s*(?:sh|bash|zsh|python3?|node|perl|ruby)\b/i,
];

const COMMAND_BLOCKLIST = new Set([
  "sudo",
  "mkfs",
  "su",
  "nohup",
  "chown",
  "kill",
  "killall",
  "ssh",
  "dd",
]);

const SAFE_BASH_PATTERNS = [
  /^pwd$/,
  /^ls(\s+(-a|-[al]+))?$/,
  /^cat(\s+(?:-[a-zA-Z]+)\s+[A-Za-z0-9_./-]+|\s+[A-Za-z0-9_./-]+)$/,
  /^echo\s+.+$/,
  /^find\s+[A-Za-z0-9_./-]+\s+(?:-maxdepth|-[mp]ath|-[nt])?.*$/,
  /^rg\s+.+$/,
  /^grep\s+.+$/,
  /^git\s+(status|log|show|branch|rev-parse|ls-files|ls-tree)(\s+.+)?$/,
  /^npm\s+(ls|help)(\s+.+)?$/,
  /^node(\s+(-v|--version))?$/,
];

// Repo-constitution ceremony: read-only lock checks + env/CI verification.
// These ship as `bash scripts/...` so they bypass the generic safe list and are
// explicitly allowlisted to stop the repo mandate from fighting the bash gate.
const REPO_SAFE_BASH_PATTERNS = [
  /^bash\s+scripts\/plan-lock\.sh\s+(verify|status|propose)\b.*$/,
  /^bash\s+scripts\/(verify-env|run-all-checks)\.sh\b.*$/,
];

// Side-effectful or arbitrary-code commands: allowed only after explicit confirmation.
const CONFIRM_BASH_PATTERNS = [
  /^node\b/,
  /^npm\s+(test|run|ci|install|i|add|exec|x)\b/,
  /^git\s+(checkout|add|restore|stash|fetch|pull|push|clone|commit|merge|rebase|tag|reset)\b/,
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
  return getForceBlockReason(command) !== null;
}

function normalizeCommandToken(raw) {
  let token = raw;
  while (token.startsWith("(") || token.startsWith("{")) {
    token = token.slice(1);
  }
  while (token.endsWith(")") || token.endsWith("}")) {
    token = token.slice(0, -1);
  }
  return token.toLowerCase();
}

function getLeadingCommand(tokens) {
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const normalized = normalizeCommandToken(token);

    if (normalized.length === 0) {
      continue;
    }

    if (normalized === "env" || normalized === "command" || normalized === "builtin") {
      continue;
    }

    return { token: normalized, index: i };
  }

  return null;
}

function hasForceFlag(token) {
  if (!token.startsWith("--")) {
    return false;
  }
  return token === "--force" || token === "--recursive";
}

function rmOptionsAreDestructive(tokens, start) {
  let recursive = false;
  let force = false;

  for (let i = start + 1; i < tokens.length; i += 1) {
    const token = tokens[i].toLowerCase();

    if (token === "--") {
      break;
    }

    if (!token.startsWith("-") || token === "-") {
      continue;
    }

    if (hasForceFlag(token)) {
      force = true;
      continue;
    }

    if (token.startsWith("--recursive")) {
      recursive = true;
      continue;
    }

    if (/^-[a-zA-Z]+$/.test(token) && token.length > 1) {
      for (const flag of token.slice(1)) {
        if (flag === "r" || flag === "R") {
          recursive = true;
        }
        if (flag === "f" || flag === "F") {
          force = true;
        }
      }
      continue;
    }
  }

  return recursive && force;
}

function hasDestructiveFind(tokens, start) {
  for (let i = start + 1; i < tokens.length; i += 1) {
    const token = tokens[i].toLowerCase();
    if (token === "--") {
      break;
    }

    if (token === "-delete" || token === "-exec" || token === "-execdir" || token === "-ok" || token === "-okdir") {
      return true;
    }

    if (token === "-type") {
      continue;
    }
  }
  return false;
}

function hasDestructiveBashInvocation(tokens, start) {
  const command = tokens[start].toLowerCase();

  if (command === "bash" || command === "sh") {
    return tokens.slice(start + 1).some((token) => token === "-c" || token === "-i");
  }

  return false;
}

function hasForceBlockReasonForCommand(tokens) {
  if (tokens.length === 0) {
    return null;
  }

  const leading = getLeadingCommand(tokens);
  if (!leading) {
    return null;
  }

  const cmd = leading.token.toLowerCase();
  const start = leading.index;

  if (COMMAND_BLOCKLIST.has(cmd)) {
    return cmd;
  }

  if (cmd === "chmod") {
    if (tokens.slice(start + 1).some((token) => /^777$/.test(token))) {
      return "chmod 777";
    }
  }

  if (cmd === "find") {
    if (hasDestructiveFind(tokens, start)) {
      return "find destructive action (delete/exec/ok)";
    }
  }

  if (cmd === "rm") {
    if (rmOptionsAreDestructive(tokens, start)) {
      return "rm recursive force";
    }
  }

  if (cmd === "xargs") {
    return "xargs";
  }

  if (cmd === "bash" || cmd === "sh") {
    // Repo constitution: agents must never run plan-lock init/approve.
    const planMatch = /^scripts\/plan-lock\.sh$/.test(tokens[start + 1] ?? "");
    const sub = tokens[start + 2] ?? "";
    if (planMatch && (sub === "init" || sub === "approve")) {
      return "plan-lock init/approve is human-only";
    }
  }

  if (hasDestructiveBashInvocation(tokens, start)) {
    return "shell execution mode";
  }

  return null;
}

function getForceBlockReason(command) {
  const matched = FORCE_BLOCK_PATTERNS.find((pattern) => pattern.test(command));
  if (matched) {
    return matched.source;
  }

  const tokenMatch = hasForceBlockReasonForCommand(tokenizeSimple(command));
  if (tokenMatch) {
    return tokenMatch;
  }

  return null;
}

function tokenizeSimple(command) {
  return command
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

function isRevisionLike(value) {
  return /^\.{1,2}$/.test(value)
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

  const forceBlockReason = getForceBlockReason(trimmed);
  if (forceBlockReason) {
    return {
      decision: "block",
      reason: `Command blocked by strict policy: ${forceBlockReason}`,
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

  if (REPO_SAFE_BASH_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { decision: "allow", reason: "Approved repo-constitution command." };
  }

  if (CONFIRM_BASH_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return {
      decision: "confirm",
      reason: "Command executes arbitrary code or has side effects; confirm to continue.",
    };
  }

  return {
    decision: "confirm",
    reason: "Command is not in the strict allowlist.",
  };
}

export { CONFIRM_BASH_PATTERNS, GIT_DIFF_ALLOWED_OPTIONS, FORCE_BLOCK_PATTERNS, REPO_SAFE_BASH_PATTERNS, SAFE_BASH_PATTERNS, isGitDiffCommandSafe, hasControlCharacters, isSafePath, isRevisionLike, tokenizeSimple };
