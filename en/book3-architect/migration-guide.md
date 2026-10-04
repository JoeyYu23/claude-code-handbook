# First to Second Edition: What Changed

> Written 2026-10-04.

The first edition (March 2026) taught you to use one agent well. The second edition (October 2026) is about working when agents write most of the code: checking their work, owning the harness, running many agents, containing them and measuring cost. For the five shifts in one page, read [What's New](/en/whats-new). This page is the lookup table: for every first-edition page, where its content lives now.

The first edition stays online as an archive. Links in the left column go to the original. Links in the middle column go to the new chapter.

## Quick map of the big moves

- **Several chapters became one.** Parallel Agent Orchestration (Book 2, ch. 6) and Multi-session Workflows (ch. 18) are now [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions). MCP Fundamentals, Database MCP and Building Custom MCP Servers (ch. 11, 13, 14) are now [MCP in Practice](/en/book2-advanced/12-mcp-in-practice). Browser MCP (ch. 12) is now part of [Agents That See](/en/book2-advanced/14-agents-that-see).
- **Chapters moved.** Book 2 was reordered: plugins moved up to chapter 4, subagents to 5, and the agent catalog to 6. In Book 3, the old chapters 19 to 23 had been numbered continuing from Book 2; the sidebar now numbers each book from 1. Appendices A to D lost their letters; they are now plain pages in Book 3.
- **Chapters rewritten.** Book 1: How It Works, Permission Modes (now Auto Mode and Permissions), Debugging (now Check the Work). Book 2: Sub-agents, Context Window Management, Token Optimization, Plugins. Book 3: Harness Engineering, Agent Teams, Security, Cost Reality.

## Eight new pages

| New page | What it covers |
| --- | --- |
| [What's New](/en/whats-new) | The five shifts, and how to read the first edition. |
| [Who to Follow](/en/who-to-follow) | Practitioners and official sources worth reading. |
| [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill) | How to choose between the three ways to give an agent a capability. |
| [Agents That See](/en/book2-advanced/14-agents-that-see) | Letting the agent look at the UI it built (also receives Browser MCP and computer use). |
| [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals) | Checking agent output when you no longer read every line. |
| [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) | Using one agent to review another's work, and where that fails. |
| [Portability: Many Tools, Many Models](/en/book3-architect/11-portability) | Working across tools and models without being locked in. |
| [The Builder's Job Now](/en/book3-architect/13-builders-job-now) | An essay on what the human is for. |

## Chapter-by-chapter map

### Book 1: Getting Started

| First edition | Second edition | How it changed |
| --- | --- | --- |
| [What Is Claude Code?](/v1/en/book1-getting-started/01-what-is-claude-code) | [What Is Claude Code?](/en/book1-getting-started/01-what-is-claude-code) | Updated for current behavior; same job. |
| [Why Claude Code?](/v1/en/book1-getting-started/02-why-claude-code) | [Why Claude Code?](/en/book1-getting-started/02-why-claude-code) | Updated for current behavior; same job. |
| [How It Works — The Mental Model](/v1/en/book1-getting-started/03-how-it-works) | [How It Works](/en/book1-getting-started/03-how-it-works) | Now explains the harness, the context window and the current model line-up. |
| [Installation](/v1/en/book1-getting-started/04-installation) | [Installation](/en/book1-getting-started/04-installation) | Updated for current behavior; same job. |
| [Your First Conversation](/v1/en/book1-getting-started/05-first-conversation) | [Your First Conversation](/en/book1-getting-started/05-first-conversation) | Kept with a light refresh. |
| [Permission Modes](/v1/en/book1-getting-started/06-permission-modes) | [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) | Auto mode is now the starting point; the other modes become the exception. |
| [Reading and Understanding Code](/v1/en/book1-getting-started/07-reading-code) | [Reading and Understanding Code](/en/book1-getting-started/07-reading-code) | Updated for current behavior; same job. |
| [Editing Files](/v1/en/book1-getting-started/08-editing-files) | [Editing Files](/en/book1-getting-started/08-editing-files) | Kept with a light refresh. |
| [Running Commands](/v1/en/book1-getting-started/09-running-commands) | [Running Commands](/en/book1-getting-started/09-running-commands) | Kept with a light refresh. |
| [Git Workflows](/v1/en/book1-getting-started/10-git-workflows) | [Git Workflows](/en/book1-getting-started/10-git-workflows) | Updated for current behavior; same job. |
| [Building a Simple Website — Hands-On Tutorial](/v1/en/book1-getting-started/11-build-website) | [Building a Simple Website](/en/book1-getting-started/11-build-website) | Updated for current behavior; same job. |
| [Debugging Like a Pro](/v1/en/book1-getting-started/12-debugging) | [Check the Work](/en/book1-getting-started/12-check-the-work) | Debugging is now part of a wider habit: checking that the agent's work is right. |
| [Working with APIs](/v1/en/book1-getting-started/13-working-with-apis) | [Working with APIs](/en/book1-getting-started/13-working-with-apis) | Kept with a light refresh. |
| [CLAUDE.md — Your AI's Instruction Manual](/v1/en/book1-getting-started/14-claude-md) | [CLAUDE.md and AGENTS.md](/en/book1-getting-started/14-claude-md) | Adds AGENTS.md support and how the two files interact. |
| [Memory System](/v1/en/book1-getting-started/15-memory) | [Memory](/en/book1-getting-started/15-memory) | Updated for current behavior; same job. |
| [IDE Integration](/v1/en/book1-getting-started/16-ide-integration) | [IDE Integration](/en/book1-getting-started/16-ide-integration) | Kept with a light refresh. |
| [Glossary](/v1/en/book1-getting-started/glossary) | [Glossary](/en/book1-getting-started/glossary) | Updated for current behavior; same job. |
| [Keyboard Shortcuts](/v1/en/book1-getting-started/keyboard-shortcuts) | [Keyboard Shortcuts](/en/book1-getting-started/keyboard-shortcuts) | Updated for current behavior; same job. |
| [Troubleshooting](/v1/en/book1-getting-started/troubleshooting) | [Troubleshooting](/en/book1-getting-started/troubleshooting) | Updated for current behavior; same job. |

### Book 2: Power User

| First edition | Second edition | How it changed |
| --- | --- | --- |
| [Built-in Slash Commands](/v1/en/book2-advanced/01-slash-commands) | [Slash Commands](/en/book2-advanced/01-slash-commands) | Updated for current behavior; same job. |
| [Custom Skills](/v1/en/book2-advanced/02-custom-skills) | [Custom Skills](/en/book2-advanced/02-custom-skills) | Updated for current behavior; same job. |
| [Skill Composition](/v1/en/book2-advanced/03-skill-composition) | [Skill Composition](/en/book2-advanced/03-skill-composition) | Kept with a light refresh. |
| [Sub-agents Explained](/v1/en/book2-advanced/04-subagents) | [Subagents](/en/book2-advanced/05-subagents) | Covers background, nested and forked subagents. |
| [Agent Types Catalog](/v1/en/book2-advanced/05-agent-catalog) | [Agent Catalog](/en/book2-advanced/06-agent-catalog) | Updated for current behavior; same job. |
| [Parallel Agent Orchestration](/v1/en/book2-advanced/06-parallel-agents) | [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions) | Merged with Multi-session Workflows; built around the agent view. |
| [Large Project Patterns](/v1/en/book2-advanced/07-large-projects) | [Large Projects](/en/book2-advanced/18-large-projects) | Updated for current behavior; same job. |
| [Hook System Deep Dive](/v1/en/book2-advanced/08-hooks) | [Hooks](/en/book2-advanced/09-hooks) | Updated for current behavior; same job. |
| [Automated Workflows](/v1/en/book2-advanced/09-automated-workflows) | [Automated Workflows](/en/book2-advanced/10-automated-workflows) | Updated for current behavior; same job. |
| [Custom Tool Creation](/v1/en/book2-advanced/10-custom-tools) | [Custom Tools](/en/book2-advanced/13-custom-tools) | Kept with a light refresh. |
| [MCP Fundamentals](/v1/en/book2-advanced/11-mcp-basics) | [MCP in Practice](/en/book2-advanced/12-mcp-in-practice) | Merged with the database and custom-server chapters into one. |
| [Browser MCP](/v1/en/book2-advanced/12-browser-mcp) | [Agents That See](/en/book2-advanced/14-agents-that-see) | Reworked around agents checking UI themselves; browser MCP is one tool among several. |
| [Database MCP](/v1/en/book2-advanced/13-database-mcp) | [MCP in Practice](/en/book2-advanced/12-mcp-in-practice) | Merged into MCP in Practice (the database example lives there). |
| [Building Custom MCP Servers](/v1/en/book2-advanced/14-custom-mcp) | [MCP in Practice](/en/book2-advanced/12-mcp-in-practice) | Merged into MCP in Practice (writing a small server). |
| [Context Window Management](/v1/en/book2-advanced/15-context-management) | [Context Engineering](/en/book2-advanced/15-context-engineering) | Rewritten for the current models and context handling. |
| [Token Optimization](/v1/en/book2-advanced/16-token-optimization) | [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) | Rewritten around limits, usage and prompt caching. |
| [Memory Architecture](/v1/en/book2-advanced/17-memory-architecture) | [Memory Architecture](/en/book2-advanced/17-memory-architecture) | Updated for current behavior; same job. |
| [Multi-session Workflows](/v1/en/book2-advanced/18-multi-session) | [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions) | Merged into the agent view chapter. |
| [Desktop App & Computer Use](/v1/en/book2-advanced/19-desktop-app) | [Agents That See](/en/book2-advanced/14-agents-that-see)<br>[Desktop and Web](/en/book2-advanced/19-desktop-and-web) | Split: computer use moves to Agents That See; the app itself stays in Desktop and Web. |
| [Plugins & Marketplaces](/v1/en/book2-advanced/20-plugins) | [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods) | Rewritten; adds the marketplace and mods. |
| [Worktree & Isolation](/v1/en/book2-advanced/21-worktree) | [Worktrees](/en/book2-advanced/08-worktrees) | Updated for current behavior; same job. |
| [Voice, Fast Mode & Effort Levels](/v1/en/book2-advanced/22-voice-fast-effort) | [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort) | Updated for current behavior; same job. |

### Book 3: Architect

| First edition | Second edition | How it changed |
| --- | --- | --- |
| [Harness Engineering](/v1/en/book3-architect/01-harness-engineering) | [Harness Engineering](/en/book3-architect/01-harness-engineering) | Rewritten around measuring and auditing your own harness. |
| [Agent Teams](/v1/en/book3-architect/02-agent-teams) | [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents) | Rewritten as orchestration of many agents. |
| [Scheduled Tasks & Automation Loops](/v1/en/book3-architect/03-scheduled-tasks) | [Scheduled Agents and Routines](/en/book3-architect/06-scheduled-agents-routines) | Updated for current behavior; same job. |
| [Cloud Providers & Remote Control](/v1/en/book3-architect/04-cloud-remote) | [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents) | Updated for current behavior; same job. |
| [CLAUDE.md Best Practices](/v1/en/book3-architect/05-claude-md-patterns) | [CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns) | Updated for current behavior; same job. |
| [Team Workflows](/v1/en/book3-architect/06-team-workflows) | [Team Workflows](/en/book3-architect/12-team-workflows) | Updated for current behavior; same job. |
| [Remote Connection](/v1/en/book3-architect/07-remote-connection) | [Remote Connection](/en/book3-architect/08-remote-connection) | Kept with a light refresh. |
| [Security and Privacy](/v1/en/book3-architect/08-security) | [Containment and Security](/en/book3-architect/09-containment-and-security) | Rewritten as containment: what stops an agent, not just what to avoid. |
| [Cost Reality — What Claude Code Actually Costs](/v1/en/book3-architect/09-cost-reality) | [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) | Rewritten as a method for measuring your own spend. |
| [Agent Type Reference](/v1/en/book3-architect/agent-reference) | [Agent Type Reference](/en/book3-architect/agent-reference) | Refreshed against the current sub-agents documentation. |
| [Performance Benchmarks](/v1/en/book3-architect/benchmarks) | [Performance Benchmarks](/en/book3-architect/benchmarks) | Old per-task token estimates removed; sourced benchmarks and harness studies added. |
| [MCP Server Registry](/v1/en/book3-architect/mcp-registry) | [MCP Server Registry](/en/book3-architect/mcp-registry) | Every server re-checked; dead or archived entries removed. |
| [Migration Guide](/v1/en/book3-architect/migration-guide) | This page | Rewritten as this map. |

## Index pages

Each book's overview page was rewritten to match the new contents: [Book 1](/en/book1-getting-started/), [Book 2](/en/book2-advanced/), [Book 3](/en/book3-architect/). The originals are at [Book 1](/v1/en/book1-getting-started/), [Book 2](/v1/en/book2-advanced/) and [Book 3](/v1/en/book3-architect/).

## What was dropped

- The first edition's Migration Guide (Appendix D) was a guide to switching from other AI coding tools. It is not repeated here, because tool features change monthly and the old comparisons are stale. It is still readable at [/v1/en/book3-architect/migration-guide](/v1/en/book3-architect/migration-guide); for working across tools, read [Portability](/en/book3-architect/11-portability).
- Unsourced numbers (the token-per-task tables in the benchmarks appendix) and MCP servers that could not be re-checked.

### Check that it worked

Pick any first-edition chapter you relied on, find its row above, and open the new link. If a command or setting you used in the original no longer appears, the new chapter's Verified line and Sources section say which version of Claude Code and which documentation it was checked against.
