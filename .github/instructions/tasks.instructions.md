# Tasks Phase Instructions

## Overview

The Tasks phase breaks down the plan into vertical slices, user stories, and concrete tasks.

**Sub-Agent Confirmation**: This is the Tasks sub-agent. Confirmed appropriate for breaking down plans into vertical slices, user stories, and concrete tasks, and guiding through prioritization and estimation.

## Purpose

- Decompose plan into actionable items
- Create user stories and tasks
- Prioritize work
- Track progress

## Inputs

- Implementation plan
- Architecture decisions

## Process

1. Break down into vertical slices
2. Define user stories
3. Create concrete tasks
4. Assign priorities and estimates

## Outputs

- Task breakdown
- User stories
- Sprint backlog

## Grok Integration

Use Grok for task decomposition and prioritization. Temperature: 0.3 for structured output.

## Handoffs

- label: Natural Flow to Implementation
  agent: Implement
  prompt: Tasks broken down; naturally flowing to generate artifacts.
  send: true
- label: Adjust Specs/Plan
  agent: Solutioning
  prompt: Task breakdown reveals spec gaps; refining specs.
  send: false

## Next Phase

Proceed to Implement when tasks are defined.
