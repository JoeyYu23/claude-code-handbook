# Book 3: Architect

> Verified on 2026-10-04 with Claude Code 2.1.289.

Books 1 and 2 teach you to work well with one agent. Book 3 is for engineers who design the system the agents work inside: the harness around the model, the checks that decide when work is done, the many agents running at once, the fences around them, and the bill at the end of the month.

The second edition rebuilds this book around one change. When agents write most of the code, nobody reads every line any more. The job moves from writing and reviewing code to designing how work gets verified, contained and paid for. Every chapter here starts from that assumption.

## How to read this book

Read Part I first. The harness, the verification gates and the instruction files are the base the other parts build on. After that, read the parts in any order, depending on what you are designing now.

Each chapter says which Claude Code version it was checked against and ends with dated sources. Commands and settings change quickly; if something does not match what you see, check the version line first.

## Contents

### Part I: The harness

1. [Harness Engineering](/en/book3-architect/01-harness-engineering): what the harness is, what recent studies measured about it, how to measure and audit your own, and what you can own when you cannot own the model.
2. [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals): tasks that check themselves, done-checks the agent cannot skip, evals for setups you reuse, review agents, and what humans still check when no one reads the code.
3. [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns): what the research says instruction files do, rules that change behavior, AGENTS.md interop, and how to audit the files.

### Part II: Many agents

4. [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents): from one agent to a "software factory", and why factories fail.
5. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents): reviewer agents, adversarial verification, debate, and where agreement between agents proves nothing.
6. [Scheduled Agents and Routines](/en/book3-architect/06-scheduled-agents-routines): agents that run on a schedule, and how to recover from sleep or a lost network.
7. [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents): self-hosted environments, Managed Agents, and remote review.
8. [Remote Connection](/en/book3-architect/08-remote-connection): working with sessions across machines.

### Part III: Safety, cost and portability

9. [Containment and Security](/en/book3-architect/09-containment-and-security): the limits of auto mode, isolation, prompt injection, and admin controls.
10. [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured): a method for measuring your own spend and limits, and hard budget caps.
11. [Portability: Many Tools, Many Models](/en/book3-architect/11-portability): running one setup across Claude Code, Codex and others.
12. [Team Workflows](/en/book3-architect/12-team-workflows): review becomes verification; admin settings for teams.

### Part IV: Field notes

13. [The Builder's Job Now](/en/book3-architect/13-builders-job-now): an essay on what humans still own.

### Appendices

- [Agent Type Reference](/en/book3-architect/agent-reference)
- [MCP Server Registry](/en/book3-architect/mcp-registry)
- [Performance Benchmarks](/en/book3-architect/benchmarks)
- [First to Second Edition: What Changed](/en/book3-architect/migration-guide)

## What changed from the first edition

The first edition's Book 3 had nine chapters. Agent Teams became [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents). Security became [Containment and Security](/en/book3-architect/09-containment-and-security). Cost Reality was rewritten as a measurement method, and Harness Engineering was rewritten around published harness studies. Four chapters are new: Verification and Evals at Scale, Agents Checking Agents, Portability, and The Builder's Job Now. The [migration guide](/en/book3-architect/migration-guide) maps every old chapter to its new home, and [What's New](/en/whats-new) explains the shifts behind the changes.

Before Book 3, you should be comfortable with [hooks](/en/book2-advanced/09-hooks), [subagents](/en/book2-advanced/05-subagents) and [context engineering](/en/book2-advanced/15-context-engineering) from Book 2.
