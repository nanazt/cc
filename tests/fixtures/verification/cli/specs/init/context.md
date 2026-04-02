# Init Spec

Last consolidated: Phase 2 (2026-02-10)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
Project scaffolding and configuration initialization from templates.

## Public Interface
Init.Create operation accepts project name and template selection.

## Domain Model
ProjectTemplate and ProjectConfig entities.

## Behavior Rules
Template selection defaults to "basic" when not specified.

## Error Handling
Reports descriptive errors on invalid template names or existing directories.

## Dependencies
Requires Config component for default settings.

## Configuration
TEMPLATE_DIR environment variable for custom template location.
