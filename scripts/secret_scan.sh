#!/usr/bin/env bash
set -euo pipefail

blocked_files="$(
  find . \
    -path './node_modules' -prune -o \
    -path './dist' -prune -o \
    -path './.git' -prune -o \
    -path './scripts/secret_scan.sh' -prune -o \
    -type f \( \
      -name '.env' -o \
      -name '*.pem' -o \
      -name '*.key' -o \
      -name '*secret*' -o \
      -name '*credential*' \
    \) -print
)"

if [[ -n "$blocked_files" ]]; then
  echo "Potential secret-bearing files found:"
  echo "$blocked_files"
  exit 1
fi

if rg -n --hidden \
  -g '!node_modules/**' \
  -g '!dist/**' \
  -g '!.git/**' \
  -g '!buidl/package/**' \
  -g '!docs/demo/**' \
  -e 'sk-[A-Za-z0-9_-]{20,}' \
  -e 'AKIA[0-9A-Z]{16}' \
  -e '-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----' \
  .; then
  echo "Potential secret content found."
  exit 1
fi

echo "secret scan passed"
