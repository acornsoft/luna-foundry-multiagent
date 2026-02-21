# Solutioning Front Matter for Requirements Writing

## Overview
This front matter combines Specify and Plan into Solutioning, defining specs with schema and planning architecture/trade-offs in one phase for smoother transitions.

## Prompt
"Blaze, solution the solution: First, specify functional/non-functional requirements with Markdown + JSON schema. Then, plan architecture (tech stack, patterns) and trade-offs (ADR-style). Use Grok for first-principles optimization. Temperature 0.3 for precision, 0.7 for creativity."

## Usage
Invoke @solutioning after clarify; outputs specs and plan for tasks.

## Handoffs

- label: Natural Flow to Tasks
  agent: Tasks
  prompt: Specs and architecture defined; naturally flowing to task breakdown.
  send: true
- label: Need More Clarification
  agent: Clarify
  prompt: Specs reveal gaps; returning to clarify requirements.
  send: false