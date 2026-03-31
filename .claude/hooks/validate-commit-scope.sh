#!/bin/sh
# Validate commit message scope from Claude Code PreToolUse hook.
# Blocks: bare number scopes (phase numbers), "state" scope.
# Input: JSON on stdin with .tool_input.command

CMD=$(jq -r '.tool_input.command')

# Extract scope from conventional commit pattern: type(scope):
SCOPE=$(echo "$CMD" | grep -oE '[a-z]+\([^)]+\):' | head -1 | sed 's/^[a-z]*(\(.*\)):$/\1/')

if [ -z "$SCOPE" ]; then
  exit 0
fi

# Block bare numbers (phase numbers like "10", "09")
if echo "$SCOPE" | grep -qE '^[0-9]+$'; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Scope is a bare number (phase number). Use a codebase noun (e.g., schema, case, hash-tool)."}}
JSON
  exit 0
fi

# Block "state" scope
if [ "$SCOPE" = "state" ]; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Scope 'state' not allowed. Bundle STATE.md changes into the related commit."}}
JSON
  exit 0
fi
