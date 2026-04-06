#!/bin/sh
# Convention injection + mechanical validation for commit messages.
# Registered as PreToolUse hook on Bash matcher.
# Reads convention file at runtime and injects via additionalContext.
# Mechanically validates commit format, scope, and GSD references.
# Subsumes .claude/hooks/validate-commit-scope.sh.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Only process commit commands
case "$CMD" in
  *git\ commit*|*gsd-tools*\ commit*) ;;
  *) exit 0 ;;
esac

# --- Convention file discovery (publisher then consumer) ---
CONV_FILE=""
if [ -f "$CWD/conventions/commit/CONVENTION.md" ]; then
  CONV_FILE="$CWD/conventions/commit/CONVENTION.md"
elif [ -f "$CWD/.claude/rules/cckit-commit.md" ]; then
  CONV_FILE="$CWD/.claude/rules/cckit-commit.md"
fi

# No convention file: silent passthrough
if [ -z "$CONV_FILE" ]; then
  exit 0
fi

# --- Extract commit message (if present in command) ---
MSG=""
# Try -m "..." (double quotes)
MSG=$(echo "$CMD" | sed -n 's/.*-m[[:space:]]*"\([^"]*\)".*/\1/p')
# Try -m '...' (single quotes) if no match
if [ -z "$MSG" ]; then
  MSG=$(echo "$CMD" | sed -n "s/.*-m[[:space:]]*'\\([^']*\\)'.*/\\1/p")
fi

# --- Mechanical validation (when message extractable) ---
if [ -n "$MSG" ]; then
  SUBJECT=$(echo "$MSG" | head -1)

  # Check Conventional Commits format: type(scope): desc OR type: desc
  if ! echo "$SUBJECT" | grep -qE '^[a-z]+(\([^)]+\))?!?:[[:space:]].'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Subject does not match Conventional Commits format: type(scope): description"}}\n'
    exit 0
  fi

  # Check allowed types
  TYPE=$(echo "$SUBJECT" | sed 's/^\([a-z]*\).*/\1/')
  case "$TYPE" in
    feat|fix|docs|refactor|test|chore|perf|ci|build|style) ;;
    *)
      printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Type '\''%s'\'' not allowed. Use: feat, fix, docs, refactor, test, chore, perf, ci, build, style"}}\n' "$TYPE"
      exit 0
      ;;
  esac

  # Check scope patterns (if scope present)
  SCOPE=$(echo "$SUBJECT" | sed -n 's/^[a-z]*(\([^)]*\)).*/\1/p')
  if [ -n "$SCOPE" ]; then
    # Block bare numbers, phase-N, phaseN
    if echo "$SCOPE" | grep -qE '^(phase-?)?[0-9]+$'; then
      printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Scope '\''%s'\'' contains a phase number. Use a codebase noun (e.g., parser, auth, case)."}}\n' "$SCOPE"
      exit 0
    fi
    # Block "state" scope
    if [ "$SCOPE" = "state" ]; then
      printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Scope '\''state'\'' not allowed. Bundle STATE.md changes into the related commit."}}\n'
      exit 0
    fi
  fi

  # Check subject line length
  SUBJ_LEN=$(printf '%s' "$SUBJECT" | wc -c | tr -d ' ')
  if [ "$SUBJ_LEN" -gt 100 ]; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Subject line is %d characters (max 100)."}}\n' "$SUBJ_LEN"
    exit 0
  fi

  # Check GSD reference prohibition (full message)
  if echo "$MSG" | grep -qiE '(^|[^a-zA-Z])phase[- ]?[0-9]+'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message contains a phase reference. Describe the change, not the planning activity."}}\n'
    exit 0
  fi
  if echo "$MSG" | grep -qE '[0-9]+-[0-9]+-PLAN|plan [0-9]+(/[0-9]+)?'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message contains a plan ID. Describe the change, not the planning activity."}}\n'
    exit 0
  fi
  if echo "$MSG" | grep -qE '[A-Z]{2,}-[0-9]+'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message contains a requirement/ticket ID. Describe the change, not the tracking reference."}}\n'
    exit 0
  fi
  if echo "$MSG" | grep -qE 'D-[0-9]+'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message contains a decision ID. Describe the change, not the planning reference."}}\n'
    exit 0
  fi
  if echo "$MSG" | grep -qiE '(plan|progress)[[:space:]]+[0-9]+/[0-9]+'; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message contains a progress fraction. Describe the change, not the planning progress."}}\n'
    exit 0
  fi
fi

# --- Convention injection (allow with additionalContext) ---
# Use jq -Rs to read file as raw string — guarantees proper JSON escaping
# of newlines, quotes, and backslashes in convention content.
jq -Rs '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","additionalContext":("COMMIT CONVENTION (follow these rules when writing commit messages):\n" + .)}}' < "$CONV_FILE"
