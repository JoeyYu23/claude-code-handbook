# Why Claude Code?

> Verified on 2026-10-04 with Claude Code 2.1.289.

## The problem it solves

Building software has never been easier to start and never more tiring to finish. Every project involves a dozen tools with their own quirks, documentation lags behind the code, and the gap between "I have an idea" and "it works" is mostly mechanical effort: setup, glue code, tests, error messages.

Coding agents attack that gap. They do not remove the need to know what you want. They remove much of the typing, looking up and trial and error between the idea and the working thing.

This chapter covers when Claude Code is the right tool, when it is not, and how it compares with the alternatives in October 2026. It tries to be fair: Claude Code is not the best choice for everyone.

## When to reach for it

### "I inherited a codebase I don't understand"

You are handed someone else's project and need to understand it fast. Open a terminal in the project folder, start Claude Code and ask:

```
What does this project do?
Walk me through the folder structure.
What happens when a user logs in? Draw it as a simple diagram.
```

Claude Code reads the source files and builds you a map. It is reading the code itself, not trusting the comments. What used to take a week of onboarding can take an afternoon. Chapter 7 shows how to do this well.

### "I want to build something but don't know where to start"

The blank page stops most beginners. With an agent you start from the idea:

```
Create a simple personal website with my name, a short bio, and links to my social profiles.
```

A minute later you have files you can open in a browser. Then you can ask about any part of it, which is a better way to learn than reading a textbook first.

### "I have a tedious, repetitive job"

This is where agents earn their keep:

- 200 files that all need the same small update
- The same kind of test for thirty functions
- A weekly report built by copying numbers from one place to another
- Hundreds of files to rename to a new convention

Boring, error-prone work by hand. One clear request for an agent, followed by a check that it did all 200 and not 190.

### "I'm a developer and want to move faster"

Experienced developers spend much of the day on work that needs care but not deep thought: boilerplate, dependency updates, merge conflicts, tests for code that already works, pull request descriptions. Hand those off and your attention stays on the parts only you can do. In 2026 many teams go further and let agents write most of the code while people specify, review and verify. Book 3 covers what that takes.

### "I'm stuck on a bug"

Paste the error and say where it happens:

```
I'm getting TypeError: Cannot read properties of undefined (reading 'map')
when I load the dashboard page.
```

Claude Code reads the component, traces where the data comes from, finds that the API returns a different shape than the page expects, fixes it, and runs the page again. It reads without the assumptions that made you miss it.

## When not to use it, or not alone

### Production systems without a checkpoint

If a change goes straight to a live system that handles money, health data or logins, do not let any agent ship it without a human checkpoint. Auto mode blocks production deploys by default (Chapter 6), but that is a safety net, not a review process.

### Security-critical code

Authentication, encryption, permission checks and input validation need human scrutiny and, ideally, a security review. Agents are good at drafting this code and good at finding bugs in it. Neither replaces someone accountable for the result.

### When you need to learn the skill yourself

For a course assignment, an interview or anything you will have to explain line by line, be honest about how much you are learning. Addy Osmani calls the risk "agentic skill decay": agents finish tasks without teaching you. Ask Claude Code to explain as it goes, or write the first version yourself and ask it to review.

### Decisions that depend on things it cannot see

Which database, which architecture, which trade-off between speed and safety: these depend on your team, budget and plans. Claude Code is a good thinking partner here and will surface options you missed. The decision is still yours.

## How it compares, October 2026

There are now several serious coding agents. Here is an honest summary of the main ones. All of them change monthly, so check the current state before you commit a team to one.

| | Claude Code | OpenAI Codex | Cursor | Google Antigravity CLI |
|---|---|---|---|---|
| Made by | Anthropic | OpenAI | Cursor | Google |
| Main form | Terminal, desktop, web, IDE | Terminal, desktop, IDE, cloud | Code editor with agents | Terminal and desktop |
| Models | Claude only | OpenAI GPT models | Several vendors | Google Gemini |
| Open source | No | CLI is open source (Apache-2.0) | No | Not stated |

### Where Claude Code is strong

**The models.** Anthropic's current line-up (Fable 5.1, Opus 5.5, Sonnet 5.5) is among the strongest for coding, and Claude Code is tuned for them. Claude models are popular enough that rivals offer them too: GitHub Copilot added Sonnet 5.5 the day it launched.

**One engine, many surfaces.** The same session engine runs in the terminal, the desktop app, the web, and VS Code and JetBrains. Your instructions and settings travel with you, and you can move a running session from terminal to desktop or from cloud to terminal.

**Customization.** Claude Code has the deepest set of ways to shape the agent: `CLAUDE.md` instruction files, skills (packaged procedures), hooks (scripts that run on events), subagents, MCP connections and a plugin marketplace. Books 2 and 3 cover them. Since September 2026 it also reads `AGENTS.md`, the instruction file other agents use, if a project has one.

**A considered safety model.** Auto mode uses a separate classifier model to block risky actions instead of asking you about each one. It is not perfect (Chapter 6 explains its limits), but it is a real middle ground between approving everything by hand and turning all checks off.

**Long autonomous work.** The Fable models are built for tasks "larger than a single sitting", in Anthropic's words, and Claude Code adds background agents, scheduled routines and cloud sessions around them.

### Where Claude Code is weaker

**Claude models only.** You cannot pick a GPT or Gemini model inside Claude Code without third-party workarounds. Cursor and open-source harnesses let you switch models freely, which matters when one vendor's model is better at a particular job, or cheaper.

**A heavy harness.** Claude Code sends a lot of instructions and tool descriptions with every request. A widely discussed July 2026 measurement by Systima found about 33,000 tokens of overhead before your first word, against about 7,000 for OpenCode. Critics pointed out that the test used an older model and that most of that overhead is cached after the first turn. Chapter 3 explains what this means in practice.

**Usage limits.** Subscription plans have session and weekly limits, and changes to them are a recurring source of complaints on Hacker News. If you hit limits often, Book 2's [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) chapter helps. The top model, Fable, can bill to extra usage credits rather than your plan's included usage.

**Closed source.** You cannot read or modify Claude Code's own code. Codex's CLI and tools such as OpenCode and Pi are open source, which some teams require.

**Fast change.** Claude Code ships new versions almost daily. That brings features quickly, and it also means behavior and defaults shift under you. This handbook pins every how-to to a version for that reason.

### Where the others are strong

- **Codex** is the closest rival in scope, with OpenAI's models and strong cloud environments. If your organization standardizes on OpenAI, it is the natural choice.
- **Cursor** is the best fit if you want to live in an editor and see every change as you type, with your pick of models.
- **Antigravity CLI** fits teams already on Google Cloud and Gemini.
- **Open-source harnesses** fit people who want full control over what the agent sends, which model it uses and what it costs.

### You do not have to choose only one

Moving between agents is easier than it was. Claude Code can import settings from other agents:

```bash
claude import --dry-run codex
```

The `import` command accepts `codex`, `gemini` or `cursor`, and `--dry-run` shows what it would import without writing anything. A shared `AGENTS.md` file gives every tool the same project instructions. Book 3's [Portability](/en/book3-architect/11-portability) chapter goes further.

## A simple way to decide

When you face a task, ask three questions:

1. **Is it mostly mechanical?** Repetitive edits, boilerplate, test scaffolding. Hand it to the agent and check the result.
2. **Is it mostly about understanding?** A new codebase, a confusing error, a new technology. The agent is excellent here, but stay engaged and ask it to explain.
3. **Is it mostly about judgment?** Architecture, security design, what your users need. Use the agent as a thinking partner and keep the decision.

When in doubt, try it. Asking costs little. Not asking, when it could have helped, costs you the afternoon.

### Check that it worked

You should now be able to say, for your own situation, which of the three kinds of work dominates your week and whether Claude Code or one of the alternatives fits better. If you already use another agent, run `claude import --dry-run` with its name (`codex`, `gemini` or `cursor`) after you install Claude Code in Chapter 4, and look at what would carry over.

## Sources

- "Overview", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/overview
- "Model configuration" (Fable, aliases, usage credits), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- "Store instructions and memories" (AGENTS.md), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/memory
- `claude import --help`, Claude Code 2.1.289, run 2026-10-04.
- "Models overview", Claude Platform Docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/about-claude/models/overview
- Systima, "Claude Code vs OpenCode token overhead", 2026-07-12. https://systima.ai/blog/claude-code-vs-opencode-token-overhead ; Hacker News discussion https://news.ycombinator.com/item?id=48883275
- "Claude Sonnet 5.5 in GitHub Copilot", GitHub Changelog, 2026-09-28. https://github.blog/changelog/2026-09-28-claude-sonnet-5-5-in-github-copilot
- "Codex changelog", OpenAI, accessed 2026-10-04. https://learn.chatgpt.com/docs/changelog
- "Changelog", Cursor, accessed 2026-10-04. https://cursor.com/changelog
- "An important update: transitioning Gemini CLI to Antigravity CLI", Google Developers Blog, 2026-05-19. https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/
- Addy Osmani, "Agentic Skill Decay", 2026-08-31. https://addyo.substack.com
- openai/codex repository (license Apache-2.0), GitHub, accessed 2026-10-04. https://github.com/openai/codex
