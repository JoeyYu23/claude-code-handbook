# Chapter 15: Memory System

## Every Session Starts Fresh — Except When It Doesn't

Claude Code starts each new session without memory of previous sessions. It does not remember the bug you fixed last week, the architectural decision you made last month, or the test command you mentioned yesterday. Each session begins with a clean slate.

This design has real benefits — it keeps things predictable, clean, and privacy-respecting. But it creates a practical problem: important context that accumulates over time gets lost.

Claude Code solves this with two complementary memory systems:

1. **CLAUDE.md files** — instructions you write (covered in Chapter 14)
2. **Auto memory** — notes Claude writes to itself automatically

This chapter focuses on auto memory: what it is, how it works, how to see what Claude has saved, and how to manage it.

---

## What Auto Memory Is

As you work with Claude Code, it observes patterns and learns things worth remembering for future sessions. Rather than making you write everything down manually, Claude saves these learnings automatically.

Examples of what Claude might save:

- "This project uses `yarn test:watch` to run tests in watch mode, not `npm test`"
- "The user prefers error messages to use the `AppError` class, not plain Error objects"
- "The build command is `npm run build:prod` — running `npm run build` produces a dev build that the user does not want"
- "This project's API base URL is set in `src/config.ts`, not a .env file"

These are small facts that make Claude more effective next session. Rather than re-discovering them through conversation, Claude already knows.

Auto memory requires Claude Code v2.1.59 or later. You can check your version with `claude --version`.

---

## Where Memories Are Stored

Auto memory is stored as plain text files on your computer — not in a cloud server, not sent anywhere. The files live at:

```
~/.claude/projects/<project-name>/memory/
```

Inside this folder:
- `MEMORY.md` — the main index file, loaded at the start of every session
- Additional topic files like `debugging.md`, `api-conventions.md`, `build-commands.md` — detailed notes that Claude reads on demand

The `MEMORY.md` file's first 200 lines are loaded into every session automatically. For longer notes, Claude creates separate topic files and loads them when relevant.

All of these are plain Markdown files. You can open, read, edit, and delete them like any text file.

---

## How Auto Memory Gets Created

Claude decides what to save based on two signals:

**Corrections and clarifications:** When you correct Claude — "no, actually use `pnpm`, not `npm`" — Claude often saves this as something to remember.

**Discoveries:** When Claude figures out something non-obvious about your project — a quirky build command, an unusual file structure, a non-standard naming convention — it may save it so it does not need to re-discover it next time.

Claude is selective about what it saves. It does not dump everything into memory — it saves things that would be genuinely useful to know at the start of a future session.

You will sometimes see "Writing memory" appear in the Claude Code interface. This means Claude is actively updating its memory files based on something it learned.

---

## Asking Claude to Remember Something

You can explicitly ask Claude to save something:

```
Remember that the staging server is at staging.my-project.internal
and requires VPN access to reach
```

```
Always use `date-fns` for date manipulation in this project, not
`moment.js`. Add this to memory so you don't forget.
```

```
Remember that the QA team tests every Friday afternoon, so we should
avoid deploying on Friday mornings
```

Claude will save these to auto memory and confirm it has done so.

**The key distinction:** if you want something saved as an instruction (a rule Claude should follow), ask it to be added to CLAUDE.md. If you want something saved as a fact or context item, auto memory is fine. Both are loaded each session; the difference is organizational and about intent.

---

## Viewing and Managing Your Memory

To see everything Claude has saved about a project, run inside a session:

```
/memory
```

This command shows:
- All CLAUDE.md and rules files loaded for the current session
- A link to open the auto memory folder
- A toggle to enable or disable auto memory

You can click any file in the list to open it in your text editor.

**Editing memory:** Auto memory files are just text files. Open them, change them, delete lines — Claude will use whatever is there next session. If Claude saved something incorrectly or outdated, just edit the file.

**Deleting memory:** If you want to start fresh, you can delete files from `~/.claude/projects/<project>/memory/`. Or delete the entire folder to clear all memory for a project.

**Disabling auto memory:** If you prefer Claude not to save notes automatically, add this to your settings:

```json
{
  "autoMemoryEnabled": false
}
```

Or run `/memory` in a session and use the toggle.

---

## When to Use Memory vs. CLAUDE.md

Both systems persist information across sessions. How do you decide which to use?

**Use CLAUDE.md when:**
- You want to write specific instructions deliberately
- The information should be shared with your whole team (via version control)
- It is a rule or standard, not just a fact
- You want full control over exactly what Claude sees

**Use auto memory when:**
- You want Claude to accumulate knowledge gradually without your intervention
- The information is machine-local and personal (not shared with the team)
- You want Claude to learn your preferences organically over time
- It is operational context (build commands, server addresses, workflow facts)

In practice, most projects use both: CLAUDE.md for the intentional standards, auto memory for the details Claude picks up along the way.

---

## The Memory System in Practice

Here is how the two systems work together over the lifetime of a project:

**Week 1:** You start a new project. You write a CLAUDE.md with the basic project structure, build commands, and team conventions. Auto memory is empty.

**Week 2:** You correct Claude a few times: "use `pnpm`, not `npm`" and "the test environment needs the `TEST_MODE=true` flag." Claude saves these to auto memory.

**Week 3:** Claude has discovered that your project has a quirky deployment script and saves the relevant commands. Your auto memory now contains useful operational knowledge.

**Week 8:** A new teammate joins. They get your CLAUDE.md (from git) automatically. They do not get your auto memory (it's local to your machine) — but they can build their own quickly.

**Six months later:** Your CLAUDE.md is well-developed with team standards. Your auto memory has accumulated dozens of small facts that make Claude immediately effective in your codebase without needing to re-learn anything.

---

## Privacy and Auto Memory

Auto memory is stored locally on your machine. Claude does not send your auto memory to Anthropic's servers or use it to train models. The files are yours.

One important note: Claude will never save sensitive information like API keys, passwords, or authentication tokens to memory. If you ask it to remember a secret, it should decline and explain that secrets belong in environment variables, not memory files.

If you ever want to verify what is in your memory before sharing your machine or a project directory, run `/memory` and review the files listed there.

---

## A Practical Tip

The most natural way to build up useful auto memory is to work with Claude Code regularly and correct it when it gets things wrong. Over time, the corrections accumulate into a useful profile of your preferences and your project's quirks.

If you are starting on a new machine or want to bring a new project up to speed quickly, you can seed the memory manually by asking Claude:

```
Let me tell you some things about this project that I want you to
remember for future sessions...
```

And then describe the most important context. Claude will save what you tell it and have it ready next session.

---

**Next up:** [Chapter 16 — IDE Integration](./16-ide-integration.md) — How to use Claude Code inside VS Code, Cursor, JetBrains, and choosing the right setup for your workflow.
