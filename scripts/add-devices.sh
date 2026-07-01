#!/usr/bin/env bash
# Scans connected devices and adds any new ones to the Makefile automatically.
# Usage: called by `make add-devices`

set -euo pipefail

MAKEFILE="$(dirname "$0")/../Makefile"

echo ""
echo "  Scanning connected devices..."
echo ""

# Parse devicectl output: columns are name, local-host, uuid, status, model
DEVICES=$(xcrun devicectl list devices 2>/dev/null | grep -E "iPhone|iPad")

if [ -z "$DEVICES" ]; then
  echo "  No devices found. Plug in via USB."
  echo ""
  exit 0
fi

NEW_VARS=()
NEW_UDIDS=()

while IFS= read -r line; do
  # Extract UUID — devicectl hardware id (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  UUID=$(echo "$line" | grep -oE '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' | head -1)
  # Extract human name — everything before the first two-space gap
  NAME=$(echo "$line" | sed 's/  .*//' | xargs)

  [ -z "$UUID" ] && continue

  # Already in Makefile?
  if grep -q "$UUID" "$MAKEFILE"; then
    echo "  ✓ Already registered: $NAME ($UUID)"
    continue
  fi

  # Safe Make variable name: lowercase, strip non-alphanumeric, collapse underscores
  VAR_NAME=$(echo "$NAME" \
    | tr '[:upper:]' '[:lower:]' \
    | tr -cs 'a-z0-9' '_' \
    | sed 's/__*/_/g' \
    | sed 's/^_//;s/_$//')
  VAR_NAME="DEVICE_${VAR_NAME}"

  # Avoid duplicate var names by appending _2, _3 etc.
  SUFFIX=1
  CANDIDATE="$VAR_NAME"
  while grep -q "^${CANDIDATE}[[:space:]]*:=" "$MAKEFILE"; do
    SUFFIX=$((SUFFIX + 1))
    CANDIDATE="${VAR_NAME}_${SUFFIX}"
  done
  VAR_NAME="$CANDIDATE"

  NEW_VARS+=("$VAR_NAME")
  NEW_UDIDS+=("$UUID")
  echo "  + Adding: $NAME  →  $VAR_NAME := $UUID"
done <<< "$DEVICES"

if [ ${#NEW_VARS[@]} -eq 0 ]; then
  echo ""
  echo "  All connected devices are already in the Makefile."
  echo ""
  exit 0
fi

# Insert new DEVICE_ lines just before the ALL_DEVICES line
for i in "${!NEW_VARS[@]}"; do
  VAR="${NEW_VARS[$i]}"
  UUID="${NEW_UDIDS[$i]}"
  NAME=$(xcrun devicectl list devices 2>/dev/null \
    | grep "$UUID" \
    | sed 's/  .*//' | xargs)
  INSERT_LINE="${VAR} := ${UUID}   # ${NAME}"
  sed -i '' "/^ALL_DEVICES/i\\
${INSERT_LINE}
" "$MAKEFILE"
done

# Append new vars to ALL_DEVICES line
for VAR in "${NEW_VARS[@]}"; do
  sed -i '' "s|^ALL_DEVICES[[:space:]]*:=.*|& \$(${VAR})|" "$MAKEFILE"
done

echo ""
echo "  Makefile updated. Run 'make install-all' to install on all devices."
echo ""
