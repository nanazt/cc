# Parser Spec

Last consolidated: Phase 1 (2026-03-01)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
Input parsing and AST construction from source text.

## Public Interface
Parser.Parse operation accepts source string and returns AST.

## Domain Model
AST nodes: Program, Statement, Expression, Literal.

## Behavior Rules
Parsing is deterministic -- same input always produces same AST.

## Error Handling
Collects all parse errors before returning, with line and column positions.

## Dependencies
None.

## Configuration
MAX_RECURSION_DEPTH for nested expression limit.
