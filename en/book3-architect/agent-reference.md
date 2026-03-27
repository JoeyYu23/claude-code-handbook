# Appendix A: Agent Type Reference

This reference covers the main agent types available in Claude Code, including built-in agent roles and common custom subagent patterns. Use this as a quick reference when designing multi-agent workflows.

---

## Built-in Agent Roles

These are the primary roles Claude Code fulfills in different configurations:

| Agent Type | Description | When to Use | Tools Available |
|------------|-------------|-------------|-----------------|
| **Interactive agent** | The standard Claude Code session. Takes instructions, reads files, writes code, runs commands. | All standard development work. | All tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, and configured MCP tools |
| **Subagent** | A spawned agent running in its own isolated context window. Reports results back to the parent. | Isolate exploration that would fill main context; parallel research tasks. | Configurable via agent definition file (`tools:` field) |
| **Plan-mode agent** | Claude operating in read-only analysis mode (Shift+Tab to toggle). | Architecture review, understanding unfamiliar codebases, safe exploration before changes. | Read, Glob, Grep, WebFetch — no Write/Edit/Bash |
| **Non-interactive agent** | Claude Code invoked via `claude -p "..."`. No interactive session, outputs to stdout. | CI pipelines, scripts, batch processing, automated workflows. | All tools, or restricted via `--allowedTools` |
| **Remote Control agent** | A local Claude Code process accessible via web or mobile. | Continue work from non-local devices. | Same as interactive agent (full local tools) |
| **Cloud agent** | Claude Code on the web, running in Anthropic-managed VMs. | Work without local setup; parallel cloud sessions. | Constrained by VM environment; no local filesystem |

---

## Subagent Catalog

Subagents are defined as markdown files in `.claude/agents/`. Below are common subagent patterns, organized by function:

### Code Quality Agents

| Subagent Name | Description | When to Use | Recommended Tools |
|--------------|-------------|-------------|-------------------|
| **security-reviewer** | Reviews code for injection vulnerabilities, missing auth checks, exposed secrets, insecure dependencies. | Before merging any PR touching auth, payment, or data access code. | Read, Grep, Glob |
| **test-writer** | Generates unit and integration tests for existing code. Follows existing test patterns in the repo. | After implementing a feature; when adding coverage to untested legacy code. | Read, Write, Bash (test runner) |
| **type-checker** | Reviews TypeScript/Python type annotations. Finds missing types, incorrect generics, unsound casts. | After large refactors; when adding types to a JavaScript codebase. | Read, Bash (tsc/mypy) |
| **linter-fixer** | Fixes lint errors and formatting issues across many files. | Batch cleanup tasks; migrations to new lint rules. | Read, Write, Bash (linters) |
| **doc-writer** | Generates or updates inline documentation, JSDoc/docstrings, README files. | After implementing public APIs; maintaining documentation currency. | Read, Write |

### Research and Analysis Agents

| Subagent Name | Description | When to Use | Recommended Tools |
|--------------|-------------|-------------|-------------------|
| **codebase-explorer** | Explores unfamiliar codebases, maps architecture, identifies key files and patterns. | Onboarding to new projects; understanding inherited code. | Read, Glob, Grep |
| **dependency-auditor** | Reviews package.json/requirements.txt for outdated, vulnerable, or unnecessary dependencies. | Before major releases; quarterly dependency reviews. | Read, Bash (npm audit / pip-audit), WebFetch |
| **performance-profiler** | Analyzes code for performance issues: N+1 queries, unnecessary re-renders, algorithmic complexity. | Performance investigation; before production launches. | Read, Grep, Bash |
| **migration-planner** | Analyzes a codebase change request and produces a step-by-step migration plan with impact assessment. | Large refactors; library upgrades; architectural changes. | Read, Glob, Grep |
| **dead-code-detector** | Finds unused functions, unreachable code, orphaned files. | Cleanup sprints; before major refactors. | Read, Glob, Grep, Bash |

### Infrastructure and DevOps Agents

| Subagent Name | Description | When to Use | Recommended Tools |
|--------------|-------------|-------------|-------------------|
| **ci-debugger** | Analyzes CI/CD failures: reads logs, identifies root cause, suggests fixes. | When pipeline failures are not immediately obvious. | Read, Bash, WebFetch |
| **dockerfile-reviewer** | Reviews Dockerfiles for best practices: layer caching, security, image size. | Before building production images; Dockerfile refactors. | Read |
| **terraform-reviewer** | Reviews Terraform configurations for security, cost efficiency, best practices. | Before applying infrastructure changes. | Read, Bash (terraform plan) |
| **log-analyzer** | Analyzes application logs or error logs to identify patterns and root causes. | Production incidents; error rate spikes. | Read, Bash, configured MCP tools |

### Product and Design Agents

| Subagent Name | Description | When to Use | Recommended Tools |
|--------------|-------------|-------------|-------------------|
| **accessibility-checker** | Reviews UI code for WCAG compliance, ARIA attributes, keyboard navigation. | Before shipping UI features; accessibility audits. | Read, Bash (axe), browser MCP |
| **ui-reviewer** | Takes screenshots of UI states and reviews against design specifications. | Front-end implementation review; visual regression checks. | Read, browser MCP |
| **api-designer** | Reviews or designs REST/GraphQL APIs for consistency, REST best practices, versioning strategy. | Before implementing new API resources. | Read |

---

## Subagent Definition Format

All subagent definitions are markdown files in `.claude/agents/`:

```markdown
---
name: agent-name
description: When and why to use this agent. Used by Claude to decide when to delegate.
tools: Read, Grep, Glob, Bash    # Comma-separated list; defaults to all tools
model: sonnet                     # Optional: sonnet (default), opus, haiku
---

You are a [role description].

[Instructions for what the agent should do]
[What to check, how to analyze, what to produce]
[Output format expectations]
```

**Tool options:**

| Tool | Description |
|------|-------------|
| `Read` | Read file contents |
| `Write` | Write files (create or overwrite) |
| `Edit` | Edit existing files (string replacement) |
| `Bash` | Execute shell commands |
| `Glob` | Find files matching patterns |
| `Grep` | Search file contents with regex |
| `WebFetch` | Fetch and process web URLs |
| `mcp__[server]__[tool]` | Specific MCP tool |

**Model selection guidance:**

- `haiku` — Simple, repetitive tasks; large batch jobs; high-volume automation
- `sonnet` — Default; most coding tasks; investigation and review
- `opus` — Complex architectural reasoning; difficult debugging; synthesis across many files

---

## Multi-Agent Orchestration Patterns

### The Investigator + Implementer Pattern

```
Main session                    Subagent: codebase-explorer
     |                               |
     |-- "Investigate how auth works"|
     |                               |-- Reads many files
     |                               |-- Maps the auth system
     |<-- Summary report ------------|
     |
     |-- (Implements changes based on summary)
```

The investigator subagent does expensive file reads in isolation; only its summary enters the main context.

### The Writer + Reviewer Pattern

```
Session A (Writer)              Session B (Reviewer)
     |                               |
     |-- Implements feature          |
     |-- Commits to branch           |
     |                               |-- Reads the branch diff
     |                               |-- Reviews for issues
     |                               |-- Posts review comments
     |<-- Review feedback ------------|
     |-- Addresses feedback          |
```

### The Parallel Research Pattern

```
Main session
     |
     |-- Spawns: security-reviewer
     |-- Spawns: performance-profiler
     |-- Spawns: dependency-auditor
     |
     |<-- Security report
     |<-- Performance report
     |<-- Dependency report
     |
     |-- Synthesizes all reports
     |-- Prioritizes issues
```

Running three independent analysis agents in parallel produces results faster than running them sequentially in the main context.

---

## Agent SDK

For building fully custom agent workflows beyond Claude Code's built-in subagent system, the [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) provides programmatic access to Claude Code's tools and orchestration capabilities.

The Agent SDK is the right tool when you need:

- Custom orchestration logic that goes beyond simple delegation
- Integration with external systems as part of the agent loop
- Fine-grained control over tool access and permissions
- Building a product powered by Claude Code's capabilities
- Programmatic spawning and coordination of agent teams

**Quick example:**

```typescript
import { AgentRuntime } from "@anthropic-ai/agent-sdk";

const runtime = new AgentRuntime({
  model: "claude-sonnet-4-6",
  tools: ["Read", "Write", "Bash"],
});

const result = await runtime.run(
  "Analyze src/auth/ and produce a security audit report"
);
```

The SDK handles context management, tool execution, and result streaming. See the full documentation at [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview).

---

*See [Chapter 4 — Sub-agents Explained](/en/book2-advanced/04-subagents) and [Chapter 6 — Parallel Agent Orchestration](/en/book2-advanced/06-parallel-agents) in Book 2 for detailed coverage of multi-agent patterns.*
