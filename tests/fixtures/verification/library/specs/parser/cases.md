# Parser Cases

Last consolidated: Phase 1 (2026-03-01)

## Component Rules
CR-1: Parse errors include source location (line, column) (Source: Phase 1)

## Parser.Parse
### Operation Rules
OR-1: Maximum recursion depth enforced during expression parsing (Source: Phase 1)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid source | Parse | AST returned |
| F | 1 | Syntax error in source | Parse | Error list with positions |
| E | 1 | Recursion depth exceeded | Parse | Depth limit error at offending expression |
