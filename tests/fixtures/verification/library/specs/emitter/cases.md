# Emitter Cases

Last consolidated: Phase 1 (2026-03-01)

## Component Rules
CR-1: Generated output is valid UTF-8 (Source: Phase 1)

## Emitter.Emit
### Operation Rules
OR-1: Unsupported AST nodes produce descriptive error, not silent skip (Source: Phase 1)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid AST | Emit | Generated output string |
| F | 1 | AST contains unsupported node | Emit | Unsupported node error with node type |
