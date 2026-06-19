#!/usr/bin/env bash
# Scaffolds a fresh Astro project and runs `tinacms init` against it with the
# locally-built CLI, driving the interactive prompts via expect (the CLI has no
# non-interactive flag mode yet). Usage:
#   scaffold-and-init.sh <project-dir> <astro-template>
set -euo pipefail

PROJECT_DIR="${1:?project dir required}"
TEMPLATE="${2:-minimal}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CLI="$REPO_ROOT/packages/@tinacms/cli/bin/tinacms"

echo "Scaffolding Astro '$TEMPLATE' template at $PROJECT_DIR"
rm -rf "$PROJECT_DIR"
pnpm create astro@latest "$PROJECT_DIR" --template "$TEMPLATE" --no-install --no-git --skip-houston
cd "$PROJECT_DIR"
# pnpm 11 fails install on unapproved build scripts; approve the ones we need.
cat > pnpm-workspace.yaml <<'YAML'
allowBuilds:
  esbuild: true
  sharp: true
  better-sqlite3: true
  core-js: true
YAML
pnpm install

echo "Running tinacms init (Astro / pnpm / TypeScript)"
expect <<EXP
set timeout 600
spawn node "$CLI" init
expect {
  -re "framework" { send "\r"; exp_continue }
  -re "package manager" { send "\r"; exp_continue }
  -re "host your project|TinaCloud|self-host" { send "\r"; exp_continue }
  -re "Typescript" { send "y\r"; exp_continue }
  -re "orestry|migrate" { send "n\r"; exp_continue }
  -re "public assets" { send "\r"; exp_continue }
  -re "has been initialized" { }
  timeout { puts "TIMEOUT waiting on an init prompt"; exit 1 }
}
expect eof
EXP

test -f "$PROJECT_DIR/src/pages/tinacms-demo.astro" || {
  echo "init did not scaffold the demo page"; exit 1;
}
echo "Initialized: $PROJECT_DIR"
