# Config Cases

Last consolidated: Phase 2 (2026-02-10)

## Component Rules
CR-1: Config file format is TOML (Source: Phase 2)

## Config.Load
### Operation Rules
OR-1: Missing config file triggers default creation (Source: Phase 2)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Config file exists | Load | Configuration returned |
| S | 2 | Config file missing | Load | Default config created and returned |
| F | 1 | Config file malformed | Load | Parse error reported with line number |

## Config.Save
### Operation Rules
OR-1: Save is atomic -- written to temp file then renamed (Source: Phase 2)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid configuration | Save | Config file written to CONFIG_PATH |
| F | 1 | No write permission at CONFIG_PATH | Save | Permission error reported |
