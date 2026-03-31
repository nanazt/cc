#!/bin/sh
# Validate commit message scope from Claude Code PreToolUse hook.
# Blocks: bare number scopes (phase numbers), "state" scope.
# Input: JSON on stdin with .tool_input.command
#
# Runs on ALL Bash commands. Early-exits if no "git commit" found.

CMD=$(jq -r '.tool_input.command')

# Only check commands that contain "git commit"
case "$CMD" in
  *git\ commit*) ;;
  *) exit 0 ;;
esac

# Extract scope from conventional commit pattern: type(scope):
SCOPE=$(echo "$CMD" | grep -oE '[a-z]+\([^)]+\):' | head -1 | sed 's/^[a-z]*(\(.*\)):$/\1/')

if [ -z "$SCOPE" ]; then
  exit 0
fi

# Block phase-number patterns: bare "10", "phase-10", "phase10"
if echo "$SCOPE" | grep -qE '^(phase-?)?[0-9]+$'; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Scope contains a phase number. Use a codebase noun (e.g., schema, case, hash-tool)."}}
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
