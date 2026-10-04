# Memory

> Verified on 2026-10-04 with Claude Code 2.1.289.

## Every session starts fresh, except for two things

Claude Code begins each session with an empty conversation. It does not remember the bug you fixed last week or the decision you made yesterday. Two mechanisms carry knowledge from one session to the next:

| | CLAUDE.md files | Auto memory |
| --- | --- | --- |
| Who writes it | You | Claude |
| What it holds | Instructions and rules | Learnings and patterns |
| Scope | Project, user, or organization | One repository (all its worktrees share it) |
| Loaded | Every session | Every session (first 200 lines or 25 KB of the index) |

[The previous chapter](/en/book1-getting-started/14-claude-md) covers CLAUDE.md and AGENTS.md. This one is about auto memory: the notes Claude writes for itself.

## What auto memory is

As you work, Claude can save short notes about what it learned, so next time it does not start from zero. The documentation names four kinds. Claude records the kind in the note's header:

- **user:** your role, expertise, and how you like to work
- **feedback:** corrections you gave Claude, and approaches you confirmed
- **project:** ongoing work, deadlines, and decisions that cannot be worked out from the code or git history
- **reference:** where to find things outside the project, such as an issue tracker or a dashboard

What it does not save: anything Claude can read straight from your code (architecture, file paths, how a bug was fixed), and anything your CLAUDE.md already says. It also does not save something every session; it decides whether a fact would be useful in a future conversation.

Typical examples are "this project's tests need a local Redis instance" or "the user prefers short answers." While you work you may see messages such as "Saved 2 memories" or "Recalled 2 memories". That is Claude writing to or reading from its memory folder.

## Where memory lives

Auto memory is stored as ordinary Markdown files on your own computer, in a folder per project:

```
~/.claude/projects/<project>/memory/
├── MEMORY.md           index, one line per memory, loaded every session
├── user_role.md        one memory
├── feedback_testing.md one memory
└── ...
```

Facts that help you understand the setup:

- The `<project>` name comes from the git repository, so every worktree and subfolder of the same repo shares one memory folder. Outside a git repository, the project folder is used.
- Only the first 200 lines or 25 KB of `MEMORY.md`, whichever comes first, load at startup. Claude keeps the index short by moving detail into the other files, which it opens on demand.
- Memory is machine-local. It is not shared with teammates, other computers, or cloud sessions. (That is the main reason team rules belong in CLAUDE.md, which travels with the repository.)
- Memory files are not deleted by Claude Code's automatic cleanup of old session records. They stay until you or Claude edit or delete them.
- To keep memory somewhere else, set `autoMemoryDirectory` in your settings to an absolute path or a path starting with `~/`.

## Ask Claude to remember something

You can tell Claude directly:

```
Remember that the API tests need a local Redis instance running.
```

```
Always use pnpm, not npm, in this project.
```

Claude saves these to auto memory. If you want something to be a standing rule for the whole team, ask for it to go in CLAUDE.md instead ("add this to CLAUDE.md"), or edit the file yourself.

A rule of thumb for what to store, and where:

| Put it in... | When it is... | Example |
| --- | --- | --- |
| CLAUDE.md | A rule or standard the whole team follows | "Run `npm test` before every commit" |
| Auto memory | A personal preference or a fact about your setup | "The user wants explanations in plain language" |
| Neither (a skill or hook) | A multi-step procedure, or something that must always happen | "Release checklist", "format on save" |

Do not store secrets. API keys and passwords belong in environment variables, not in files that Claude reads and that sit on disk in plain text.

## See, edit, and turn off memory

Run:

```
/memory
```

It lists your CLAUDE.md, CLAUDE.local.md and other memory file locations across user and project scopes, lets you open any of them in your editor, gives you a toggle for auto memory, and has an option to open the auto memory folder. Everything is plain Markdown. If a note is wrong or out of date, edit the line or delete the file; Claude uses whatever is there next session.

To turn auto memory off:

- Use the toggle in `/memory`. This saves `autoMemoryEnabled` to your user settings (`~/.claude/settings.json`).
- For one project only, put this in that project's settings file:

  ```json
  {
    "autoMemoryEnabled": false
  }
  ```

- Or set the environment variable `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

Auto memory is on by default in local sessions. It is off by default in sessions running in a self-hosted environment, and in background sessions and sessions started by another Claude Code session the `/memory` toggle can turn it off but not back on there. To turn it back on, run `claude` yourself in a terminal and use the toggle in that session.

### Check that it worked

1. Tell Claude: "Remember that I prefer short answers." You should see a "Saved memory" message.
2. Run `/memory` and open the auto memory folder. You should find a new `.md` file with that note, and a line for it in `MEMORY.md`.
3. Quit, start a new session in the same project, and ask: "What do you know about how I like answers?" Claude should mention your preference.

## Memory is not enforcement

Notes in memory and lines in CLAUDE.md are context. Claude reads them and usually follows them, but they are not a lock. If a rule must hold every time, such as "never edit files in `generated/`", turn it into a permission rule or a hook (see [Hooks](/en/book2-advanced/09-hooks)). For how memory fits with the rest of what Claude keeps in its working memory, see [Memory Architecture](/en/book2-advanced/17-memory-architecture) and [Context Engineering](/en/book2-advanced/15-context-engineering).

## Sources

- Anthropic, "How Claude remembers your project" (auto memory, storage location, `/memory`, settings), Claude Code documentation, accessed 2026-10-04. https://code.claude.com/docs/en/memory
- Anthropic, Claude Code Glossary ("Auto memory"), accessed 2026-10-04. https://code.claude.com/docs/en/glossary
- Anthropic, Claude Code commands reference (`/memory`), accessed 2026-10-04. https://code.claude.com/docs/en/commands

Next: [IDE Integration](/en/book1-getting-started/16-ide-integration)
