import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { evaluateBashCommand } from "./policy.js";

function getPackageVersion(): string {
  try {
    const packagePath = fileURLToPath(new URL("../package.json", import.meta.url));
    const packageRaw = readFileSync(packagePath, "utf8");
    const packageJson = JSON.parse(packageRaw);
    if (typeof packageJson.version === "string" && packageJson.version.trim()) {
      return packageJson.version;
    }
  } catch {
    // Keep fallback for non-standard packaging layouts.
  }
  return "0.0.0";
}

function getPackageName(): string {
  try {
    const packagePath = fileURLToPath(new URL("../package.json", import.meta.url));
    const packageRaw = readFileSync(packagePath, "utf8");
    const packageJson = JSON.parse(packageRaw);
    if (typeof packageJson.name === "string" && packageJson.name.trim()) {
      return packageJson.name;
    }
  } catch {
    // Keep fallback for non-standard packaging layouts.
  }
  return "pi-smithy";
}

export default function (pi: ExtensionAPI) {
  const now = () => new Date().toISOString();

  pi.registerCommand("pkg-status", {
    description: "Show quick package status",
    handler: (args, ctx) => {
      const target = args || "agent";
      ctx.ui.notify(`Pi package says: workspace is ${target} ✅`, "info");
    },
  });

  pi.registerCommand("pkg-version", {
    description: "Show package version",
    handler: (_args, ctx) => {
      ctx.ui.notify(`${getPackageName()} version: ${getPackageVersion()}`, "info");
    },
  });

  pi.registerTool({
    name: "package_stamp",
    label: "Package Stamp",
    description: "Return a concise status stamp and optional message.",
    parameters: Type.Object({
      message: Type.Optional(Type.String({ description: "Message to include" })),
    }),
    async execute(_toolCallId, params) {
      const extra = params.message?.trim();
      const text = extra
        ? `[${getPackageName()}] ${now()}: ${extra}`
        : `[${getPackageName()}] ${now()}`;

      return {
        content: [{ type: "text", text }],
        details: { source: getPackageName(), message: extra ?? "", version: getPackageVersion() },
      };
    },
  });

  pi.on("tool_call", async (event, ctx) => {
    if (isToolCallEventType<"bash", { command: string }>("bash", event)) {
      const decision = evaluateBashCommand(event.input.command);

      if (decision.decision === "block") {
        return {
          block: true,
          reason: decision.reason,
        };
      }

      if (decision.decision === "confirm") {
        const allow = await ctx.ui.confirm(
          "Command blocked by policy",
          `${decision.reason}\n\nRequested: ${event.input.command}`,
        );

        if (!allow) {
          return {
            block: true,
            reason: `Blocked by ${getPackageName()} policy. ${decision.reason}`,
          };
        }
      }
    }
  });
}
