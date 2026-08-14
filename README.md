<div align="center">

# ⚒️ Pi Smithy

**Forge, shape, and ship Pi packages.**

A workshop for building [Pi coding-agent](https://github.com/earendil-works/pi) packages — one scaffold that ships an extension, a skill, a prompt template, a theme, and release automation.

[![npm version](https://img.shields.io/npm/v/pi-smithy?color=2d9ea5&label=npm)](https://www.npmjs.com/package/pi-smithy)
[![License](https://img.shields.io/npm/l/pi-smithy?color=3fa65f)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/MerverliPy/pi-smithy/ci.yml?branch=main&label=CI)](https://github.com/MerverliPy/pi-smithy/actions)

</div>

---

## What's in the box

| Piece | Path | What it gives you |
|-------|------|-------------------|
| 🧩 **Extension** | `extensions/` | Custom commands, a registered tool, and a strict bash safety gate |
| 🎯 **Skill** | `skills/quick-audit/` | A reusable `quick-audit` review workflow with reference docs |
| 📝 **Prompt template** | `prompts/` | A focused review template you can invoke with variables |
| 🎨 **Theme** | `themes/` | A sample `smithy-cyan` color theme for the Pi TUI |
| 🚀 **Release tooling** | `scripts/` | Validate, changelog, dry-run, and one-command auto-release |
| 🤖 **CI/CD** | `.github/workflows/` | Validation on push/PR; npm publish on `v*` tags |

---

## Contents

- [Install](#install)
- [Use in Pi](#use-in-pi)
- [Forge your own package](#forge-your-own-package)
- [Repository layout](#repository-layout)
- [Development](#development)
- [License](#license)

---

## Install

### From npm

```bash
npm install pi-smithy
```

### From a local path

```bash
pi install <path-to-package>
```

For local extension runtime testing:

```bash
pi -e "$(pwd)/extensions/index.ts"
```

### From git

```bash
pi install git:github.com/<you>/<repo>
```

---

## Use in Pi

| Trigger | What it does |
|---------|--------------|
| `/pkg-status` | Quick package status notification |
| `/pkg-version` | Prints the package version, read live from `package.json` |
| `package_stamp` (tool) | Returns a status stamp with timestamp, message, and package version |
| `/skill:quick-audit` | Runs the audit workflow for a code change |
| `/review-with-lens` | Review prompt template (uses `{{scope}}`) |
| `smithy-cyan` | Sample theme, selectable from `/settings` |

---

## Forge your own package

1. **Clone or copy** this repository.
2. **Rename** `package.json` `name` to your package (e.g. `my-pi-tools`).
3. **Trim the box**: delete the pieces you don't need (extension, skill, prompt, or theme), then remove them from the `pi` manifest and `files` list.
4. **Rebrand the strings**: user-facing output in `extensions/index.ts` is derived from `package.json`, so renaming the package updates everything automatically.
5. **Validate**: `npm run release:check` and `npm test`.

---

## Repository layout

```
pi-smithy/
├── extensions/          # runtime extension code (commands, tool, safety gate)
│   ├── index.ts
│   └── policy.js        # shared bash policy evaluator
├── skills/
│   └── quick-audit/     # skill definition + reference docs
├── prompts/             # prompt templates
├── themes/              # theme JSON files
├── scripts/             # validation, changelog, and release automation
├── .github/workflows/   # CI + release pipelines
├── README.md
├── CONTRIBUTING.md      # contributing + full release workflow
├── SECURITY.md          # security policy
├── CHANGELOG.md
└── LICENSE
```

---

## Development

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and the full release workflow. Security issues: see [SECURITY.md](SECURITY.md).

---

## License

[MIT](LICENSE)
