#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/release.sh [<version>|--check] [--publish] [--dry-run] [--auto] [--push] [--note "text"]

Examples:
  ./scripts/release.sh --check
  ./scripts/release.sh --dry-run
  ./scripts/release.sh patch --note "Fix prompt formatting" --publish
  ./scripts/release.sh 0.2.0 --note "Security policy upgrade" --auto
  ./scripts/release.sh 0.2.1 --note "Hotfix" --auto --push --publish
  ./scripts/release.sh 0.2.2 --note "Hotfix" --auto --dry-run

Version can be:
  patch | minor | major | x.y.z

Notes:
  --auto performs: validate -> version bump -> optional changelog update -> commit -> tag -> publish.
  --auto --dry-run simulates the full auto flow (bump + changelog + npm dry publish) but does NOT commit, tag, or publish.
  --push pushes the current branch + created tag after auto-release.
  --publish publishes to npm.
EOF
}

BUMP=""
DRY_RUN=0
AUTO=0
PUSH=0
PUBLISH=0
CHECK_ONLY=0
NOTES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      ;;
    --publish)
      PUBLISH=1
      ;;
    --check)
      CHECK_ONLY=1
      ;;
    --auto)
      AUTO=1
      ;;
    --push)
      PUSH=1
      ;;
    --note|--notes)
      shift
      if [[ $# -eq 0 ]]; then
        echo "--note requires a text argument"
        usage
        exit 1
      fi
      NOTES+=("$1")
      ;;
    --note=*|--notes=*)
      NOTES+=("${1#*=}")
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ -n "$BUMP" ]]; then
        echo "Error: multiple version arguments provided: $BUMP and $1"
        usage
        exit 1
      fi
      BUMP="$1"
      ;;
  esac
  shift
done

npm run validate

if [[ "$CHECK_ONLY" == "1" ]]; then
  npm pack --dry-run
  echo "Release check completed."
  exit 0
fi

run_changelog() {
  local version="$1"
  if [[ ${#NOTES[@]} -gt 0 ]]; then
    node ./scripts/changelog.mjs "$version" "${NOTES[@]}"
  fi
}

get_version() {
  node -p "require('./package.json').version"
}

create_commit_and_tag() {
  local new_version="$1"
  local tag="v${new_version}"

  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git rev-parse -q --verify "${tag}" >/dev/null 2>&1; then
      echo "Tag ${tag} already exists. Aborting." >&2
      exit 1
    fi

    if git status --porcelain --untracked-files=normal | grep -q .; then
      local changed=(package.json CHANGELOG.md package-lock.json)
      local to_add=()
      for f in "${changed[@]}"; do
        [[ -f "$f" ]] && to_add+=("$f")
      done

      if [[ ${#to_add[@]} -gt 0 ]]; then
        git add "${to_add[@]}"
        git commit -m "chore(release): ${tag}"
      else
        echo "No releasable files staged for commit."
      fi
    else
      echo "No tracked changes detected after bump/changelog; skipping commit."
    fi

    git tag -a "${tag}" -m "Release ${tag}"

    if [[ "$PUSH" == "1" ]]; then
      if git remote | grep -q .; then
        git push --follow-tags
      else
        echo "No remote configured; push skipped."
      fi
    fi
  else
    echo "Not a git repository; skipping commit/tag/push steps."
  fi
}

if [[ "$AUTO" == "1" ]]; then
  if [[ -z "$BUMP" ]]; then
    echo "--auto requires a version argument (for example, patch|minor|major|x.y.z)."
    usage
    exit 1
  fi

  # Auto implies a full release; --dry-run simulates it without publishing or touching git.
  if [[ "$DRY_RUN" != "1" ]]; then
    PUBLISH=1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    echo "npm is required for the release flow."
    exit 1
  fi

  if [[ ${#NOTES[@]} -eq 0 ]]; then
    echo "Warning: no --note values provided. Creating release without changelog entries."
  fi

  npm version "$BUMP" --no-git-tag-version
  NEW_VERSION=$(get_version)

  run_changelog "$NEW_VERSION"

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "Auto dry-run: simulating release for ${NEW_VERSION} (no commit/tag/publish)."
    npm publish --dry-run --access public
    echo "Auto release dry run completed for ${NEW_VERSION}."
    exit 0
  fi

  if [[ -z "${NODE_AUTH_TOKEN:-}" ]]; then
    echo "Warning: NODE_AUTH_TOKEN is not set. npm may still use other auth mechanisms."
  fi

  create_commit_and_tag "$NEW_VERSION"

  npm publish --access public
  echo "Auto release completed for ${NEW_VERSION}."
  exit 0
fi

if [[ -n "$BUMP" ]]; then
  npm version "$BUMP" --no-git-tag-version

  if [[ ${#NOTES[@]} -gt 0 ]]; then
    run_changelog "$(get_version)"
  fi
fi

if [[ "$DRY_RUN" == "1" ]]; then
  npm publish --dry-run --access public
  echo "Release dry run completed."
  exit 0
fi

if [[ "$PUBLISH" == "1" ]]; then
  if [[ -z "${NODE_AUTH_TOKEN:-}" ]]; then
    echo "Warning: NODE_AUTH_TOKEN is not set. npm may still use other auth mechanisms."
  fi
  npm publish --access public
  echo "Release published."
  exit 0
fi

echo "Release check complete."
echo "Use --publish to publish to npm or --dry-run to test the publish command."
echo "Add --check to run pack validation only."
echo "Add --auto to run bump + changelog + commit + tag + publish in one step."
echo "Use --auto --dry-run to simulate the full auto flow without publishing."
echo "Use --note \"...\" when bumping to record changelog entries."
