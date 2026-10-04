# How It Works

> Verified on 2026-10-04 with Claude Code 2.1.289.

You do not need to know how an engine works to drive a car. But a correct picture of what is under the hood helps you drive better: you write clearer requests, notice when something has gone wrong, and understand why a long session gets slow or expensive.

This chapter gives you that picture in four parts: the loop the agent runs, the harness around the model, the context window, and the models you can choose.

## The agent loop

When you give Claude Code a task, it works in a loop. Anthropic's docs describe three phases: **gather context**, **take action**, and **verify results**. The phases blend together and repeat until the task is done.

```
You give a task
      |
      v
+--> Gather context  (read files, search, look at errors)
|         |
|         v
|    Take action     (edit files, run commands)
|         |
|         v
|    Verify results  (run tests, read output, check the page)
|         |
+---------+  not done yet? go round again
          |
          v
   Report back to you
```

A question about your code might need only the first phase. A bug fix might go round the loop a dozen times. Say you ask "fix the failing tests." Claude Code might:

1. Run the test suite to see what fails
2. Read the error output
3. Search for the relevant source files
4. Read them
5. Edit the code
6. Run the tests again to confirm

All of that happens from your one message. Each step's result decides the next step. This is what makes it an agent rather than a chatbot.

You are part of the loop too. Press `Esc` to stop Claude immediately and give a new direction. Or type a correction and press `Enter` while it is working: the message is queued and Claude reads it as soon as its current step finishes.

## The harness: the layer around the model

The model, Claude, is the part that reasons. On its own, a model can only produce text. It cannot open a file or run a command.

Claude Code is the layer around the model that gives it tools and decides what it sees. Anthropic's docs call this layer the *agentic harness*. The word matters because the same model behaves very differently inside different harnesses, and much of what makes one coding agent better than another is the harness, not the model. Book 3's [Harness Engineering](/en/book3-architect/01-harness-engineering) chapter goes deep on this.

### Tools

Tools are what the harness lets the model do. Claude asks to use a tool, the harness runs it, and the result goes back to the model. The main built-in tools fall into a few groups:

| Group | Tools | What they do |
|---|---|---|
| Files | `Read`, `Edit`, `Write` | Read a file, change part of a file, create a file |
| Shell | `Bash` (or `PowerShell` on Windows) | Run any command you could type: tests, git, package managers |
| Web | `WebSearch`, `WebFetch` | Search the web, read a page |
| Delegation | `Agent` | Hand a sub-task to a subagent with its own memory |
| Asking | `AskUserQuestion` | Ask you a multiple-choice question |

There are many more for planning, scheduling, worktrees and connected services. Run `/help` in a session, or see the official tools reference, for the full list. The tool names matter later, because permission rules are written in terms of them (Chapter 6).

### What gets sent on every turn

Here is the part most people get wrong. The model does not remember your conversation between messages. Each time you send a message, Claude Code makes a fresh request to the model and re-sends everything it needs to know, in roughly this order:

1. **The system prompt**: Claude Code's core instructions, plus the definitions of every tool the model may use.
2. **Project context**: your `CLAUDE.md` instruction files, Claude's own auto-memory notes (the first 200 lines or 25 KB of `MEMORY.md`), short descriptions of available skills, and the names of connected MCP tools.
3. **The conversation so far**: every message, every tool call and every tool result, including the full text of files Claude read and command output it saw.
4. **Your new message.**

That sounds wasteful, and without help it would be. *Prompt caching* fixes most of it: the model provider keeps recently processed text for a short time, so when a request starts with exactly the same text as the last one, that part is read from cache at a fraction of the price and much faster. Claude Code orders each request so the parts that rarely change come first. One consequence: switching models mid-session throws the cache away, because each model has its own.

### The baseline debate

How big is item 1 and 2 before you type anything? In July 2026 Systima put a logging proxy between Claude Code and the model and measured a simple first turn. They found about 32,800 tokens of overhead for Claude Code 2.1.207, against about 6,900 for the open-source OpenCode, on the same model. By their estimate, roughly 24,000 of Claude Code's tokens were tool definitions. The post reached the top of Hacker News under the headline "Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k".

The pushback was just as instructive. Commenters noted that the test used Claude Sonnet 4.5, an older model; that after the first turn most of the overhead is cached and cheap; and that both tools scored the same on Systima's own task checks. One commenter compared it to judging contractors by their quote alone without asking what the work includes.

Both sides have a point, and the practical lesson for you is simple:

- **The baseline is real.** Every token of instructions and tool definitions is space the model cannot use for your task, and it is paid for at least once per session (and again whenever the cache expires or is invalidated).
- **You add to it.** Systima also found that a 72 KB instruction file added about 20,000 tokens to every request, and that MCP servers and subagents multiply usage. Your own `CLAUDE.md`, plugins and connected tools are often a bigger lever than Claude Code's own prompt.
- **Claude Code already defers some of it.** MCP tool definitions load on demand by default, and full skill instructions load only when a skill is used.
- **Measure your own.** Run `/context` at the start of a session to see what is using space.

<!-- AUTHOR-DATA: the author's own /context reading at the start of a fresh session in a typical project, with Claude Code version and model, for comparison with Systima's 33k figure -->

Book 2's [Context Engineering](/en/book2-advanced/15-context-engineering) chapter shows how to keep your baseline small.

## The context window

The *context window* is how much text the model can take in at once: everything in the list above, for one request. Think of it as a whiteboard. Everything on it is visible to Claude. When it fills up, something has to be erased.

Fable 5.1, Opus 5.5 and Sonnet 5.5 have a 1-million-token window, enough for roughly 555,000 words. (Haiku 4.5 has 200,000 tokens.) That is large, but a long session that reads many big files and runs chatty commands can still fill it.

When the window nears its limit, Claude Code *compacts* automatically: it first clears older tool outputs, then summarizes the conversation. Your requests and key code survive. Detailed instructions you gave early on may not. For models with a native 1M window, automatic compaction kicks in at about 967,000 tokens by default.

Three habits follow from this:

- **Put lasting rules in `CLAUDE.md`,** not in an early chat message. `CLAUDE.md` is reloaded; chat instructions can be summarized away. (Chapter 14)
- **Start fresh when you switch tasks.** `/clear` starts a new conversation with an empty context. `/compact` summarizes the current one, and you can tell it what to keep: `/compact focus on the API changes`.
- **Check before you guess.** `/context` shows a colored grid of what is using space.

Sessions are also independent. Each new session starts with a fresh context, without the previous conversation. Claude Code saves every conversation to disk, so you can pick one up again with `claude --continue` (the most recent in this folder) or `claude --resume` (choose from a list).

## Models and effort

Claude Code runs on Anthropic's Claude models. As of October 2026 the current line-up is:

| Model | Alias in Claude Code | Best for | API price per million tokens (input / output) |
|---|---|---|---|
| Claude Fable 5.1 | `fable` | The hardest and longest tasks; investigates and verifies more | $10 / $50 |
| Claude Opus 5.5 | `opus` | Long-running coding and knowledge work; the default | $4 / $20 |
| Claude Sonnet 5.5 | `sonnet` | Fast, strong everyday coding | $2 / $10 |
| Claude Haiku 4.5 | `haiku` | Quick, simple tasks | $1 / $5 |

The prices are Anthropic's API list prices. On a Pro, Max or Team subscription you pay a flat fee and draw down usage limits instead, though Fable usage can be billed to extra usage credits depending on your plan; Claude Code asks before it does that.

On the Anthropic API and on Pro, Max, Team and Enterprise plans, the default model is Opus 5.5. Switch with `/model` during a session (with no argument it opens a picker), or start with a flag:

```bash
claude --model sonnet
```

Aliases point to the version Anthropic recommends for your provider and move when a new one ships. The table shows what they resolve to with a direct Anthropic account; on Amazon Bedrock, Google Cloud or Microsoft Foundry some aliases still point to older models. To pin an exact version, use its full name, such as `claude-opus-5-5`.

### Effort levels

Current models use *adaptive reasoning*: on each step the model decides whether and how long to think before acting. The *effort level* sets how much thinking it is willing to spend. Higher effort means more careful work, more tokens and more time.

| Level | Use it for |
|---|---|
| `low` | Quick back-and-forth where you check each result: brainstorming, a rename |
| `medium` | Day-to-day work with a clear scope. The default on Opus 5.5 and Sonnet 5.5 in Claude Code |
| `high` | Work where edge cases are likely, such as fixing a bug in an existing codebase. The default on Fable |
| `xhigh` | Deeper reasoning at higher cost |
| `max` | Hard problems you want worked through without you. Can overthink; test before using it routinely |

Set it with `/effort` (with no argument it opens a slider), `/effort high`, or at launch with `claude --effort high`. For one hard question without changing the session, put the word `ultrathink` in your message. The current level shows in the session header next to the model name.

A practical rule: stay on the default, and raise effort for a task only when the default visibly cuts corners. Book 2's [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort) chapter covers the trade-offs.

## Two safety nets

Because Claude Code acts on your real files, two mechanisms protect you.

**Checkpoints.** Before Claude edits a file, it saves a snapshot. Press `Esc` twice on an empty prompt to open the rewind menu and go back to an earlier point, or just ask Claude to undo. Checkpoints cover file edits only; they cannot undo a database change, a sent message or a deploy.

**Permissions.** The permission mode decides which actions run without asking you. By default, sessions now start in auto mode, where a classifier model blocks risky actions. Chapter 6 covers this in full.

## The one-sentence model

Claude Code is a loop: a model that reasons, wrapped in a harness that gives it tools and re-sends the whole conversation on every turn, inside a context window that eventually fills up. Most of what you learn in the rest of this handbook is about steering that loop: giving it the right context, the right permissions and a clear way to check its work.

### Check that it worked

Start a session in any project folder and run these three commands:

```
/context
/model
/effort status
```

`/context` should show a grid of what is using the context window, including system prompt, tools and any memory files. `/model` should open a picker with your current model highlighted (press `Esc` to close it without changing anything). `/effort status` should print the current effort level. If all three respond, you can see the harness for yourself.

## Sources

- "How Claude Code works", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/how-claude-code-works
- "How Claude Code uses prompt caching", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- "Explore the context window", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/context-window
- "Model configuration" (aliases, default model, effort levels, auto-compaction), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- "Tools reference", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/tools-reference
- "Commands", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- "Models overview" (line-up, prices, context windows), Claude Platform Docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/about-claude/models/overview
- Systima, "Claude Code vs OpenCode token overhead", 2026-07-12. https://systima.ai/blog/claude-code-vs-opencode-token-overhead
- "Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k", Hacker News discussion, 2026-07-12. https://news.ycombinator.com/item?id=48883275
