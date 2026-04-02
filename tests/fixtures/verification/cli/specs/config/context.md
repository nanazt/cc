# Config Spec

Last consolidated: Phase 2 (2026-02-10)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
User configuration management and persistence to disk.

## Public Interface
Config.Load and Config.Save operations for reading and writing user preferences.

## Domain Model
ConfigFile entity with key-value pairs and optional nesting.

## Behavior Rules
Missing config file creates default configuration on first load.

## Error Handling
Reports errors on permission failures and malformed config files.

## Dependencies
None.

## Configuration
CONFIG_PATH for custom config file location.
