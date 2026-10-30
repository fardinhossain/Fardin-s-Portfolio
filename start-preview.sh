#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1 || ! node -e 'if(Number(process.versions.node.split(".")[0])<22)process.exit(1)'; then
  printf 'Node.js 22 or later is required. PREVIEW.html offers static inspection instead.\n' >&2
  exit 1
fi
export PORT="${PORT:-4175}"
printf '\nPortfolio and chat backend: http://localhost:%s\nChat is unconfigured until AI_API_KEY and AI_MODEL are set in .env.\nCtrl+C stops the server.\n\n' "$PORT"
exec node server/dev-server.mjs
