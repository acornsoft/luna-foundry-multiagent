# Implement Phase Instructions

## Overview

The Implement phase generates clean, production-ready code based on the plan and tasks.

## Purpose

- Generate code
- Follow coding standards
- Ensure quality and testing
- Deploy solutions

## Inputs

- Task breakdown
- Technical specs

## Process

1. Generate code for each task
2. Apply coding standards (#region, etc.)
3. Test and validate
4. Deploy and integrate

## Outputs

- Production code
- Tests
- Deployed solution

## Handoffs

- label: Implementation Complete
  agent: Luna
  prompt: Artifacts generated and validated; project complete.
  send: true
- label: Adjust Tasks
  agent: Tasks
  prompt: Implementation reveals task adjustments needed.
  send: false

## Grok Integration

Use Grok for code generation. Temperature: 0.3 for precise code.

## Next Phase

Process complete; iterate if needed.
