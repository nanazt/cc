#!/bin/sh
# Test suite for conventions/commit/hooks/validate.sh
# Run from project root: ./conventions/commit/hooks/test.sh
#
# Fixtures use __CWD__ as placeholder, replaced at runtime with the
# actual project root so convention file discovery works correctly.

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../../.." && pwd)
HOOK="$SCRIPT_DIR/validate.sh"
FIXTURES="$SCRIPT_DIR/fixtures"

PASS=0
FAIL=0
TOTAL=0

# Replace __CWD__ in fixture with actual project root
fixture() {
  sed "s|__CWD__|$PROJECT_ROOT|g" "$FIXTURES/$1"
}

# Assert hook produces no output (silent passthrough)
assert_silent() {
  TOTAL=$((TOTAL + 1))
  OUTPUT=$(fixture "$1" | "$HOOK")
  if [ -z "$OUTPUT" ]; then
    PASS=$((PASS + 1))
    printf "  PASS  %s\n" "$2"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  %s — expected silent, got output\n" "$2"
  fi
}

# Assert hook allows (permissionDecision == "allow")
assert_allow() {
  TOTAL=$((TOTAL + 1))
  if fixture "$1" | "$HOOK" | jq -e '.hookSpecificOutput.permissionDecision == "allow"' > /dev/null 2>&1; then
    PASS=$((PASS + 1))
    printf "  PASS  %s\n" "$2"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  %s — expected allow\n" "$2"
  fi
}

# Assert hook denies (permissionDecision == "deny")
assert_deny() {
  TOTAL=$((TOTAL + 1))
  if fixture "$1" | "$HOOK" | jq -e '.hookSpecificOutput.permissionDecision == "deny"' > /dev/null 2>&1; then
    PASS=$((PASS + 1))
    printf "  PASS  %s\n" "$2"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  %s — expected deny\n" "$2"
  fi
}

# Assert allow output contains additionalContext
assert_has_context() {
  TOTAL=$((TOTAL + 1))
  if fixture "$1" | "$HOOK" | jq -e '.hookSpecificOutput.additionalContext | length > 0' > /dev/null 2>&1; then
    PASS=$((PASS + 1))
    printf "  PASS  %s\n" "$2"
  else
    FAIL=$((FAIL + 1))
    printf "  FAIL  %s — expected additionalContext\n" "$2"
  fi
}

printf "Convention hook test suite\n"
printf "Hook: %s\n" "$HOOK"
printf "Fixtures: %s\n\n" "$FIXTURES"

# --- Passthrough tests ---
printf "Passthrough (non-commit commands)\n"
assert_silent "passthrough-ls.json"         "non-commit command is silent"
assert_silent "gsd-tools-non-commit.json"   "gsd-tools non-commit is silent"
assert_silent "no-convention-file.json"     "no convention file is silent"

# --- Allow tests ---
printf "\nAllow (valid commits with convention injection)\n"
assert_allow      "valid-commit.json"       "valid commit allows"
assert_has_context "valid-commit.json"      "valid commit injects convention"
assert_allow      "gsd-tools-commit.json"   "gsd-tools commit allows"
assert_has_context "gsd-tools-commit.json"  "gsd-tools commit injects convention"

# --- Deny tests: scope ---
printf "\nDeny (scope violations)\n"
assert_deny "deny-phase-scope.json"         "phase-number scope denied"
assert_deny "deny-state-scope.json"         "state scope denied"
assert_deny "deny-bare-number.json"         "bare number scope denied"

# --- Deny tests: format ---
printf "\nDeny (format violations)\n"
assert_deny "deny-bad-type.json"            "invalid type denied"
assert_deny "deny-bad-format.json"          "non-CC format denied"

# --- Deny tests: GSD references ---
printf "\nDeny (GSD reference violations)\n"
assert_deny "deny-plan-ref.json"            "plan reference denied"
assert_deny "deny-decision-id.json"         "decision ID denied"
assert_deny "deny-requirement-id.json"      "requirement ID denied"
assert_deny "deny-progress-fraction.json"   "progress fraction denied"

# --- Summary ---
printf "\n%d/%d passed" "$PASS" "$TOTAL"
if [ "$FAIL" -gt 0 ]; then
  printf " (%d failed)\n" "$FAIL"
  exit 1
else
  printf "\n"
  exit 0
fi
