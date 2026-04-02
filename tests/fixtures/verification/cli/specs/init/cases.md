# Init Cases

Last consolidated: Phase 2 (2026-02-10)

## Component Rules
CR-1: Created projects include standard .gitignore (Source: Phase 2)

## Init.Create
### Operation Rules
OR-1: Existing directory prevents creation without --force flag (Source: Phase 2)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid template and new directory | Create project | Directory created with template files |
| F | 1 | Directory already exists | Create project | [directory exists error] (DirectoryExists) |
