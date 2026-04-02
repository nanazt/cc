# Emitter Spec

Last consolidated: Phase 1 (2026-03-01)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
Output code generation and serialization from AST.

## Public Interface
Emitter.Emit operation accepts AST and returns generated output string.

## Domain Model
EmitOptions for controlling output format (minified, pretty-printed).

## Behavior Rules
Output encoding is always UTF-8.

## Error Handling
Reports errors on unsupported AST node types encountered during emission.

## Dependencies
Requires Parser component for AST type definitions.

## Configuration
DEFAULT_EMIT_FORMAT for output style preference.
