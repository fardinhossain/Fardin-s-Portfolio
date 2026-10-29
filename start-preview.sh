#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
printf '\nPortfolio preview: http://localhost:4175\nKeep this terminal open; Ctrl+C stops the server.\n\n'
exec python3 -m http.server 4175 --bind 127.0.0.1
