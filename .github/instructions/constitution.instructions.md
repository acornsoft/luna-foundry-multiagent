# Constitution Phase Instructions

## Overview

The Constitution phase establishes the foundational principles, constraints, and manifesto for the project. It ensures alignment with Acornsoft's Grok-native ecosystem, xAI principles, and truth-seeking development. For business problem/solution development and analysis, this phase sets the stage for neutral Markdown capture by roles like Functional Consultant, Azure Solution Architect, etc., ensuring time-boxed (32-hour) analysis and Azure DevOps MCP integration.

## Purpose

- Define project vision and core values for requirements capture
- Establish technical and operational constraints (e.g., neutral Markdown, no branding)
- Align with Grok/xAI first principles and role-based collaboration
- Set the tone for lean, mean, truth-seeking development from raw notes to analysis

## Inputs

- High-level project requirements (business problems, solutions)
- Stakeholder goals (e.g., client-neutral docs)
- Existing Acornsoft patterns, constraints, and role assignments

## Process

1. **Cross-Platform OS Detection**: Automatically detect operating system (Windows/macOS/Linux) and load appropriate platform-specific configurations and installation guidance.
2. **Shell Strategy Establishment**: Establish PowerShell 7+ as primary shell for cross-platform .NET development and object-oriented scripting, with BASH as secondary for Unix tool integration and legacy compatibility. Both terminals must be configured and available.
3. Review Acornsoft manifesto and Grok principles, confirming Grok-only stack and truth-seeking.
4. Identify key constraints: 32-hour time-box for analysis, neutral Markdown (no branding), Azure DevOps MCP for work items, role-specific domains (e.g., SAP for ERP, Azure for cloud).
5. Define success criteria: Complete analysis Markdown ready for Plan phase, with Azure DevOps links.
6. Assign roles and orchestration: Functional Consultant for raw notes, Requirements Specialist for framework; Luna agent loads guardrails and prompts alignment.
7. Configure MCP servers: Ensure acornsoftDevOpsServer and sourceDevOpsServer are set for multi-instance Azure DevOps access in analysis/forensics.
8. Check dependencies: Confirm VS Code Insiders/VS Code with skills, PowerShell 7+, Node.js, Pandoc, Azure CLI, Azure DevOps CLI, Mermaid CLI (mmdc for diagram processing), required extensions (GitHub Copilot, vscode-awesome-copilot, Mermaid Markdown Syntax Highlighting), MCP support, repos, and Azure DevOps PAT are installed/configured based on OS (Windows/Linux/macOS); verify Azure CLI is configured for work item creation; use HTML format for User Stories to ensure proper formatting in Azure DevOps work items.
9. Interactive Azure DevOps Configuration: Display the loaded initiative-specific defaults to the user and ask for confirmation. Allow session-specific overrides or creation of new initiative configurations. If user chooses to override, capture new values and use them for this session.
10. Document foundational decisions: Output constitutional framework with principles, roles, and boundaries.

## Outputs

- Constitutional framework document (neutral Markdown)
- Key principles, constraints, and role assignments
- Loaded and confirmed initiative-specific Requirements Writing default settings for work item creation (with user overrides if specified)
- Interactive confirmation of Azure DevOps work item defaults for the detected initiative
- Dependency confirmation (e.g., VS Code, PowerShell 7, Node.js, Pandoc, Mermaid CLI, extensions, repos setup)
- Alignment confirmation with xAI ecosystem and Azure DevOps integration

## Handoffs

- label: Foundational Anchor (@Luna)
  agent: Luna
  prompt: Constitution loaded and verified; confirm baseline met.
  send: true
- label: Clarify your Vision with established baseline
  agent: Clarify
  prompt: Constitution complete; now clarify our intent and context (business problem).
  send: true

## Grok Integration

Use Grok for first-principles reasoning to validate foundations. Temperature: 0.7 for creative alignment. Luna sub-agents (e.g., @Constitution) auto-load and enforce.

## Next Phase

Proceed to Clarify when foundations are established, using MacroFlow-Analysis.md as a real-world example for iteration.
