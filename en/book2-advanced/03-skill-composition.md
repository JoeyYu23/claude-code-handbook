# Chapter 3: Skill Composition

Individual skills are powerful. Skills that work together are transformative. This chapter covers the patterns for composing skills into workflows — from chaining two commands in sequence to building multi-agent pipelines that parallelize work across your entire codebase.

---

## The Composition Problem

Consider a typical feature development workflow:

1. Research existing code to understand the architecture
2. Write a plan for the new feature
3. Implement the feature with tests
4. Review for security vulnerabilities
5. Generate a commit message and create a PR

You could do all of this with a single long conversation, but that approach has problems: the research output clogs the context before the implementation starts, the planning phase requires different access patterns than the implementation phase, and by the time you are writing the PR description, Claude is working with a context full of intermediate exploration that no longer matters.

Skill composition solves this by letting each phase run in its own context, with only the essential output passed forward.

---

## Pattern 1: Sequential Skill Chaining

The simplest composition is invoking skills one after another, where the output of each becomes the input to the next.

Create a `research` skill that explores the codebase and produces a structured summary:

```yaml
---
name: research
description: Research a feature area in the codebase and produce a structured summary
context: fork
agent: Explore
---

Research the $ARGUMENTS area of the codebase.

Produce a structured summary including:
1. Relevant files (with paths)
2. Key classes and functions
3. Current patterns in use
4. Potential integration points for new features
5. Any technical debt or known issues

Keep the summary concise. No more than 500 words.
```

Then create an `implement` skill that expects that summary as context:

```yaml
---
name: implement
description: Implement a feature based on a research summary and requirements
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Bash(npm test)
argument-hint: <feature description>
---

Implement the following feature: $ARGUMENTS

Use the research context from the previous conversation turn as the architectural guide.

Implementation requirements:
1. Follow existing patterns in the codebase (as documented in the research)
2. Write tests alongside the implementation
3. Do not refactor anything outside the direct scope of this feature
4. Add type hints and docstrings to any public API

Run the test suite when done.
```

Workflow in practice:

```text
/research authentication module
[research agent runs, returns structured summary]

/implement add refresh token support to the authentication module
[implementation agent reads the research from context, implements the feature]
```

The research runs in a forked context (`context: fork`) so its internal exploration does not fill your main conversation. Only the summary comes back. The implementation skill then works with that clean summary.

---

## Pattern 2: Skills That Spawn Subagents

Skills with `context: fork` run in their own isolated context. But you can go further and write skills that explicitly coordinate multiple agents working in parallel.

Here is a `full-review` skill that runs three types of review simultaneously:

```yaml
---
name: full-review
description: Run security, performance, and code quality reviews in parallel
context: fork
agent: general-purpose
allowed-tools: Bash(claude *)
---

Run three parallel reviews of the recent changes:

1. Spawn a security review agent:
   `claude -p "Review git diff HEAD~1 for security vulnerabilities. Focus on: injection, auth bypasses, data exposure, insecure dependencies. Be specific about file and line numbers." --max-turns 5`

2. Spawn a performance review agent:
   `claude -p "Review git diff HEAD~1 for performance issues. Focus on: N+1 queries, unnecessary loops, missing caching opportunities, large memory allocations." --max-turns 5`

3. Spawn a quality review agent:
   `claude -p "Review git diff HEAD~1 for code quality. Focus on: readability, naming, missing tests, error handling gaps." --max-turns 5`

Wait for all three to complete, then synthesize their findings into a single prioritized report.
```

This pattern uses Claude's ability to run subprocesses. Each review agent runs independently with its own context, then the coordinating agent merges the results.

---

## Pattern 3: Workflow Skills with `!` Injection

For workflows that need fresh external data at invocation time, combine shell injection with skill composition:

```yaml
---
name: sprint-plan
description: Plan implementation for all open issues in the current sprint
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Bash(gh *), Read
---

## Current sprint issues
!`gh issue list --milestone "Current Sprint" --json number,title,body,labels --jq '.[] | "Issue #\(.number): \(.title)\n\(.body)\n"'`

## Current codebase architecture
!`find . -name "*.md" -path "*/docs/*" | head -5 | xargs cat 2>/dev/null || echo "No docs found"`

## Your task

Analyze the above issues and produce an implementation plan:

1. Group issues by component/area
2. Identify dependencies between issues
3. Estimate complexity (S/M/L) for each
4. Suggest an implementation order
5. Flag any issues that need clarification before starting

Format as a markdown table that can be pasted into the sprint planning doc.
```

Every time you run `/sprint-plan`, the live issue data is fetched fresh. Claude never sees stale data.

---

## Pattern 4: Skill Libraries

For teams working on the same codebase, a shared skill library committed to the repository creates a shared vocabulary of workflows.

Project structure:

```text
.claude/
└── skills/
    ├── commit/
    │   └── SKILL.md
    ├── deploy/
    │   ├── SKILL.md
    │   └── scripts/
    │       └── pre-deploy-checks.sh
    ├── migration/
    │   └── SKILL.md
    ├── component/
    │   ├── SKILL.md
    │   └── templates/
    │       ├── react-component.tsx.template
    │       └── test.tsx.template
    └── api-conventions/
        ├── SKILL.md
        └── reference.md
```

The `api-conventions` skill uses `user-invocable: false` so it works as background knowledge rather than a command:

```yaml
---
name: api-conventions
description: REST API conventions for this codebase. Load when generating or reviewing API endpoints.
user-invocable: false
---

When working with API endpoints in this codebase:

- Use resource-based naming: `/users/{id}/orders`, not `/getUserOrders`
- Return consistent error format from [reference.md](reference.md)
- All list endpoints must support `?page=` and `?limit=` pagination
- Authentication via Bearer token in Authorization header
- 4xx errors include an `error` object with `code` and `message` fields
- 5xx errors are caught by the global error handler and logged

Never return raw exception messages to clients.
```

This skill loads automatically when anyone on the team asks Claude to create or review API code. The full error format reference stays in `reference.md` and is only loaded when relevant.

---

## Pattern 5: Parameterized Template Skills

Some workflows follow a consistent pattern but need parameterization for each use. A React component generator is a good example:

```yaml
---
name: component
description: Generate a React component with tests and stories
disable-model-invocation: true
argument-hint: <ComponentName> [description]
---

Create a new React component called $0.

$1

Use the template at [templates/react-component.tsx.template](templates/react-component.tsx.template) as a starting point.

Requirements:
1. TypeScript with explicit prop types
2. Props interface exported separately
3. Default export is the component
4. Write a test file following the pattern in [templates/test.tsx.template](templates/test.tsx.template)
5. Place files at:
   - `src/components/$0/$0.tsx`
   - `src/components/$0/$0.test.tsx`
   - `src/components/$0/index.ts` (re-export)
6. Run `npm test -- --testPathPattern=$0` to verify tests pass
```

With the template file:

```typescript
// templates/react-component.tsx.template
import React from 'react';

export interface {{ComponentName}}Props {
  // Define props here
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = (props) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default {{ComponentName}};
```

Usage:

```text
/component UserProfileCard displays a user's avatar, name, and bio with edit button
```

Claude generates a complete, tested component following your exact conventions.

---

## Pattern 6: Pre/Post Skill Hooks

Skills can define their own lifecycle hooks, executed around the skill's invocation:

```yaml
---
name: refactor
description: Refactor code following our standards
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: ".claude/hooks/save-checkpoint.sh"
  Stop:
    - hooks:
        - type: command
          command: ".claude/hooks/run-tests.sh"
---

Refactor $ARGUMENTS following our coding standards:
- Extract functions longer than 20 lines
- Remove duplication
- Improve naming
- Do not change behavior

Run tests after each significant change.
```

The `save-checkpoint.sh` hook creates a git stash before each file edit, giving you an easy recovery path. The `Stop` hook runs your test suite when the skill finishes, ensuring the refactor did not break anything.

---

## Pattern 7: Composition Through Subagent Delegation

The most powerful composition pattern is writing a coordinator skill that explicitly delegates to specialized subagents:

```yaml
---
name: ship-feature
description: Complete feature shipping workflow from implementation to PR
disable-model-invocation: true
argument-hint: <feature branch name>
---

Execute the complete feature shipping workflow for branch $ARGUMENTS:

**Phase 1 - Quality Gates** (run in sequence):
1. Run security review: check for vulnerabilities in the diff
2. Run test coverage check: ensure new code has test coverage
3. If either fails, stop and report issues

**Phase 2 - Documentation** (run in parallel):
4. Generate API documentation for any new endpoints
5. Update the CHANGELOG.md with the changes
6. Check if README needs updates

**Phase 3 - PR Creation**:
7. Create a comprehensive PR description including:
   - Summary of changes
   - Testing approach
   - Screenshots/examples if applicable
8. Run `gh pr create --title "..." --body "..."` to open the PR

Report back with the PR URL and any issues found during quality gates.
```

This skill orchestrates an entire pipeline. Each phase produces output that feeds into the next. The parallel Phase 2 tasks can run via spawned agents to save time. The whole workflow executes with a single command.

---

## Design Principles for Composable Skills

**Keep skills focused.** A skill that does one thing composes better than one that does many. The `/commit` skill should commit. The `/review` skill should review. A `/commit-and-review` skill becomes rigid and hard to reuse.

**Use `context: fork` for expensive research.** Any skill that needs to read a lot of files before acting should fork. The exploration output stays in the subagent context; only the actionable result returns.

**Design outputs as inputs.** When a skill produces a report or summary, format it in a way that a downstream skill can easily consume. Markdown tables and structured lists compose better than prose paragraphs.

**Version your project skills.** Skills in `.claude/skills/` should be committed alongside your code. When the codebase evolves, the skills evolve with it. Treat them as living documentation.

**Protect dangerous skills with `disable-model-invocation: true`.** Deploy, migrate, and publish skills should always require explicit invocation. Never let Claude trigger them automatically because the code "looks ready."

---

## Debugging Composition Issues

If a chained workflow is not working as expected:

1. Run each skill individually to isolate which step is failing.
2. Use `/btw` to ask Claude what it sees as the current context before invoking the next skill.
3. Check `/context` to see if the context is becoming too large between steps. If so, add a `context: fork` to the expensive steps.
4. Review skill descriptions to ensure they do not accidentally trigger each other when you do not want them to.

---

**Next up:** [Chapter 4 — Sub-agents Explained](./04-subagents.md) — What sub-agents are, how the Agent tool works, and when to use them versus the main conversation.
