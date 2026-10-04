# Plugins, Marketplace and Mods

> Verified on 2026-10-04 with Claude Code 2.1.289.

A plugin is a package: a directory of skills, subagents, hooks, MCP servers and other components that Claude Code installs, enables and updates as one unit. In September and October 2026 the plugin system grew in three directions at once. `claude plugin eval` (September) lets you prove a plugin helps. Claude Marketplace (September 23) gave plugins a public storefront. And Mods (October 1) let a plugin run code inside Claude Code itself, which makes plugins far more capable and far more dangerous.

This chapter covers installing plugins, building and testing your own, publishing them, and writing mods, with the risks of each.

## Three things called "marketplace"

The names overlap, so start here:

| Name | What it is |
|---|---|
| **A plugin marketplace** | A catalog file, `.claude-plugin/marketplace.json`, in a git repository or directory. It lists plugins and where to fetch each. You add it with `/plugin marketplace add`. `claude-plugins-official` is Anthropic's |
| **Anthropic's directory** | The catalog people browse on claude.ai and in Cowork. Authors submit to it through a developer portal. A plugin installed from it reaches Claude Code through account sync, as `<name>@synced` |
| **Claude Marketplace** | The website at claude.com/marketplace, launched September 23, 2026: plugins, connectors, Claude-powered products and service partners in one place. It is not something you add with `/plugin marketplace add` |

## What a plugin contains

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # manifest: name, version, description, author
├── skills/
│   └── review/SKILL.md  # runs as /my-plugin:review
├── agents/
│   └── reviewer.md      # a subagent Claude can delegate to
├── hooks/
│   └── hooks.json       # settings-style hooks, or a mod's code module
└── .mcp.json            # MCP servers
```

Plugins can also carry LSP servers, output styles, themes and a `bin/` directory of executables. Only `plugin.json` goes inside `.claude-plugin/`; components saved there do not load. Skills and agents are namespaced by the plugin name, so two plugins can each ship a `review` skill without colliding.

### What an enabled plugin costs you

An enabled plugin is part of every session, not only the ones where you use it:

- **Context.** The name and description of every skill, agent and command Claude can invoke on its own sit in context on every turn. Bodies load only when used.
- **Processes.** Its MCP servers run alongside each session, and its hooks fire on their events.
- **Trust.** What it runs, it runs as you.

`claude plugin details <name>` prints a plugin's component inventory and projected token cost, split into **always-on** (what every session carries) and **on-invoke** (paid each time a skill or agent fires). The Installed tab in `/plugin` groups plugins **Not used recently**, and `/doctor` flags unused ones.

## Install and manage plugins

Claude Code adds `claude-plugins-official` the first time you start an interactive terminal session. To install from it:

```text
/plugin install commit-commands@claude-plugins-official
```

In a session, this opens the plugin's details rather than installing at once. Read the **Will install** list (commands, agents, skills, hooks, MCP and LSP servers) and, for official plugins, the **Context cost** estimate, then pick a scope:

- **User**: you, in every project on this machine (the default).
- **Project**: everyone in this repository, through the committed `.claude/settings.json`. Each collaborator still installs it locally.
- **Local**: you, in this repository only.

The install summary tells you whether the plugin is active now or needs `/reload-plugins`. Skills then appear as `/<plugin>:<skill>`, for example `/commit-commands:commit`.

From the shell, for scripts and setup:

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install formatter@your-org --scope project
claude plugin list
claude plugin disable formatter@your-org
claude plugin uninstall formatter@your-org --scope project
```

Marketplaces can come from GitHub (`owner/repo`, optionally `#tag`), any git URL, a local path starting with `./`, or a hosted `marketplace.json` URL. Inside a session, `/plugin install deploy-helper --marketplace your-org/plugins` adds the marketplace and opens the plugin in one step (2.1.275 and later).

**Updates.** Auto-update is on by default for Anthropic's official marketplaces and off for community, third-party and local ones. Toggle it per marketplace in the **Marketplaces** tab of `/plugin`. `claude plugin update <plugin>@<marketplace>` updates one plugin on demand. A running session keeps the version it loaded until you run `/reload-plugins` or start a new session.

### Review a plugin before you install it

A plugin can run code on your machine with your privileges, whichever marketplace lists it. A marketplace name tells you who publishes the catalog, not what each plugin does. Claude Code only accepts Anthropic's official and community marketplace names from `github.com/anthropics/` repositories, so a third party cannot pose as one, but your coworker's marketplace is third-party too.

Before installing anything you have not read:

1. `claude plugin marketplace list` to see where each marketplace came from.
2. Open the plugin in `/plugin` and read **Will install**.
3. Read the source: `hooks/hooks.json` (the command each hook runs), `.mcp.json` (each server's command or URL), and every file in `bin/`.
4. Clone it and run `claude --plugin-dir <dir> plugin details <name>` for the component inventory, and `claude plugin validate <dir>` to see what a mod's code does (below).

Remember that auto-update can change the files you reviewed. For plugins you depend on, consider turning auto-update off for that marketplace and updating deliberately.

## Build a plugin

Two ways to start:

```bash
# Scaffold under ~/.claude/skills/<name>/; it loads every session as <name>@skills-dir
claude plugin init my-plugin --with skills hooks

# Or create a directory anywhere and load it for one session
mkdir -p my-first-plugin/.claude-plugin my-first-plugin/skills/hello
```

A minimal manifest:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": { "name": "Your Name" }
}
```

And a skill at `skills/hello/SKILL.md`:

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

Validate, then load it for one session:

```bash
claude plugin validate ./my-first-plugin
claude --plugin-dir ./my-first-plugin
```

Run `/my-first-plugin:hello` inside the session. Edit files and run `/reload-plugins` to pick up changes. `--plugin-dir` also takes a `.zip`, or a folder of plugins (2.1.265 and later), and `--plugin-url` fetches a `.zip` for one session.

Keep developing against the directory, not an installed copy: Claude Code caches installed plugins by version, so edits do not reach an installed copy until you bump the version and reinstall.

## Test a plugin with `claude plugin eval`

`claude plugin eval` (2.1.269 and later) runs your plugin against a suite of realistic prompts, grades the results, and compares them with a run that has no plugin loaded. That last part is the point. A high score alone does not show the plugin helped; Claude might do as well without it.

Max Taylor's benchmark of tdd-guard, a third-party plugin that blocks edits until a failing test exists, shows why a baseline matters. Across 54 runs on three small projects he found it "didn't write better code, but it did buy consistency", at 2 to 4 times the cost on a fresh codebase. Without a baseline, its tidy test-first transcripts would have looked like better code.

### Write the suite

Let Claude draft it:

```bash
cd my-plugin
claude plugin eval init
```

This opens a session in which Claude reads the plugin, asks what a good result looks like, proposes prompts that should and should not trigger it, designs graders, trial-runs them, and writes one case directory per prompt under `evals/`. Each case has a `prompt.md` (the prompt, plus limits such as `max_turns` and `allowed_tools`) and one or more graders under `graders/`:

```markdown
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?hello"'
---
```

That grader passes when Claude actually invoked the skill. Other grader types include regex checks, file checks and `llm` rubrics judged by a second model. `claude plugin eval init --bare first-case` writes a blank template if you prefer to start by hand.

### Run it and read Δ

```bash
claude plugin eval .
```

Each case runs three times with the plugin and three times without. The summary looks like this:

```text
CASE        WITH  W/OUT Δ      RUNS COST    NOTES
first-case  1.00  0.33  +0.67  6    $0.41
```

`Δ` is what the plugin contributed. The most common first finding is a Δ near zero with the `tool_used: Skill` grader failing, meaning Claude does not pick your skill on natural phrasing. Fix the skill's `description` and run again. To iterate cheaply on one case, use `--case <name> --runs 1 --ablation none`, then confirm at the default three runs.

Every run and every judge call is a real model call on your plan or API bill.

### Gate CI on it

```bash
claude plugin eval . \
  --trust-plugin \
  --json results.json \
  --threshold 0.8 \
  --model claude-sonnet-5 \
  --judge-model claude-haiku-4-5 \
  --no-publish \
  --max-cost-usd 20
```

Exit code 0 means every case met the threshold; 1 means a case fell short or failed to load; 2 means a partial run (cost ceiling hit or credential rejected). The Δ is reported but never changes the exit code. Pin both models so a model rollout is not mistaken for a plugin regression; use whatever model IDs your account offers.

::: warning An eval is not a security review
`claude plugin eval` runs the plugin on your machine, as you. Each run gets a temporary home and working directory and sees only the plugin under test, but the plugin's hooks and any real MCP servers you start run outside the agent's sandbox. `--trust-plugin` skips the first-run trust prompt, so pass it only for plugins you would run yourself. A passing suite says the plugin works, not that it is safe.
:::

## Publish a plugin

Before any release: choose a permanent kebab-case `name` (a rename breaks every install), decide how you version (bump `version` on every release, or omit it in a git-hosted marketplace so the commit SHA is used), run `claude plugin validate --strict ./your-plugin`, install it once from a local marketplace, and run your eval suite.

**Your own marketplace.** Add `.claude-plugin/marketplace.json` to a repository. For a single plugin in its own repository:

```json
{
  "name": "your-marketplace",
  "owner": { "name": "Your Name" },
  "plugins": [
    { "name": "deploy-helper", "source": "./" }
  ]
}
```

Once pushed, it is published. Users run `claude plugin marketplace add your-org/your-marketplace`, then `claude plugin install deploy-helper@your-marketplace`. A private repository makes a private marketplace. `claude plugin tag` creates a `{name}--v{version}` git tag when other plugins declare version ranges on yours.

**Anthropic's directory.** Submit from the developer portal at claude.ai/directory/manage. It needs a paid claude.ai plan; on Team and Enterprise an Owner submits. Anthropic's September 25 announcement says each submission is validated and safety-scanned on arrival, and published plugins get analytics on installs by surface and version. The portal applies rules the CLI does not check, so a clean `validate --strict` does not guarantee approval. Some components are Claude Code-only and do not load on claude.ai or in Cowork. The `claude-plugins-official` marketplace does not take submissions through the portal.

**Claude Marketplace.** Anthropic describes Claude Marketplace as one place for "more than 2,000" connectors and plugins, plus Claude-powered products from partner companies and consulting partners, where organizations can spend part of a committed Anthropic budget on listed software. For a Claude Code user, its practical use is discovery: a plugin's **Claude Code** button there copies the `claude plugin install ...@claude-plugins-official` command.

## Mods

A mod is a plugin whose `hooks/hooks.json` points to a code module: JavaScript or TypeScript functions that Claude Code calls in its own process when events happen. Mods shipped in 2.1.287 on October 1, 2026, and are on by default. Settings [hooks](/en/book2-advanced/09-hooks) run a shell command or HTTP request on an event; a mod's hook is a function that can observe the event, rewrite it, or answer it so Claude Code's usual behavior never runs.

That reach covers prompts (rewrite a prompt, change system prompt sections, drop a submission), tools (deny, rewrite or answer a tool call; approve or deny a permission decision), turns and subagents, and the interface (panes beside the transcript, a band above the prompt, buttons and text fields, or redrawing Claude Code's own rows and spinner). Mods run in the terminal and the Desktop app's Code tab; in the VS Code extension, `claude -p` and the Agent SDK, their hooks run but nothing they draw appears.

### A small mod

```text
guard-mod/
├── .claude-plugin/plugin.json
└── hooks/
    ├── hooks.json        # { "modules": ["./register.js"] }
    └── register.js
```

```javascript
// hooks/register.js
export function register(on) {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (/git push .*--force/.test(e.command)) {
      // Answer the event: the command never runs, and Claude reads this as the result
      return { deny: 'Force pushes are not allowed here. Push to a new branch instead.' }
    }
    return next(e)
  })
}
```

Load it with `claude --plugin-dir ./guard-mod`. Write tests as `*.test.ts` files that import from `claude-code/testing`, and run them with `claude plugin test`, which needs no session, sign-in or network.

You can also ask Claude for one ("make a mod that shows the current git branch above the prompt"). Claude works from the built-in `plugin-authoring` skill, writes the mod under `~/.claude/dev-mods/<session-id>/`, and asks whether to enable hot reloading for the session. Approve it and the mod loads at the end of the turn. Copy it out of that folder to keep it; session mod folders are cleaned up. Anthropic publishes sample mods (`token-weather`, `blast-radius`, `replay-theater`) in the `anthropics/claude-code-playground` repository, and the source of some built-in mods, including `/diff`, lives in the `mods` directory of `anthropics/claude-code`.

### The risks

Anthropic's announcement is direct: mods "aren't sandboxed", and you "should only install mods from sources you trust, the same way you'd install any code on your computer." Concretely, once loaded a mod can:

- read and write any file your account can, start programs and make network requests;
- read environment variables and settings files, including API keys;
- see every prompt and tool call, rewrite them, submit prompts as if you typed them, and message your other sessions;
- approve a tool call before you are asked, including one an `ask` rule would prompt for or a `PreToolUse` hook blocked (unless that hook is in managed settings); in auto mode, a call a mod approves skips the classifier;
- spend your usage by calling a model.

If you turn on the Bash sandbox, it still does not contain processes a mod starts. Deny rules are not a full fence either. Where the built-in guard (below) loads, a user's mod cannot approve a call a `deny` rule refuses, but deny rules govern Claude's tool calls, not the mod's own file and process calls: with `Read(.env)` denied, a mod can still read `.env` itself. One thing a mod cannot do is change what the permission prompt shows.

**Read before you install.** `claude plugin validate ./some-mod` lists what a mod's code does without running it:

```text
  ❯ ./register.js hooks: session.start, tool.call, ui.render{component=Pane}
  ❯ ./register.js calls: $.fs.read, $.http.fetch, $.store.set, $.ui.open
```

Claude Code refuses to load a mod that uses the mods API in a way this analysis cannot read. Treat `tool.call`, `tool.check` and `prompt.submit` in the `hooks:` line, and `$.fs.write`, `$.process.run`, `$.http.fetch`, `$.env.get` and `$.model.complete` in the `calls:` line, as the parts that need a reason.

**Turning mods off.** Disable one in `/plugin`; start with `claude --safe-mode` to disable all your customizations for one session; or set `"disableAllHooks": true` in `~/.claude/settings.json` to stop installed mods (and your settings hooks) everywhere. `/plugin` shows a line such as `1 mod active · first-mod`, so you can see what loaded.

**For organizations.** On Team and Enterprise plans, and on any machine with managed settings, a built-in guard mod, `cc-plugin-sec-default`, loads ahead of every user mod. It stops user mods from changing managed hooks, managed instructions, the system prompt and managed MCP servers, and makes deny rules take precedence. It adds no other restriction. To stop user-installed mods entirely, set `allowManagedModsOnly` in managed settings:

```json
{
  "pluginConfigs": {
    "cc-plugin-sec-default@builtin": {
      "options": { "allowManagedModsOnly": true }
    }
  }
}
```

Existing plugin controls such as marketplace allowlists also decide which mods can be installed at all. [Containment and Security](/en/book3-architect/09-containment-and-security) covers the wider policy picture.

### Mod, hook, skill or MCP server?

| Pick | When |
|---|---|
| Skill | You keep pasting the same instructions |
| Settings hook | You want to block, allow or log an event with a script you already have |
| MCP server | Claude needs to reach an external system |
| Mod | You need a pane or band in the UI, a command that runs without a Claude turn, or to rewrite an event in-process |

Prefer the least powerful option that does the job. A settings hook that blocks force pushes is easier to audit than a mod that does the same thing, and it cannot read your environment. [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill) covers the other half of that decision.

### Check that it worked

1. Install a plugin: `/plugin install commit-commands@claude-plugins-official`, choose user scope, then type `/commit-commands:` and confirm its skills appear. In the shell, `claude plugin list` should show it with a `Status` line.
2. Run `claude plugin details commit-commands` and note its always-on token cost.
3. For your own plugin, `claude plugin validate ./my-first-plugin` should print `✔ Validation passed`, and `claude plugin eval .` should print a summary table with a `Δ` column.
4. For a mod, start `claude --plugin-dir ./guard-mod`, run `/plugin`, and confirm the line under the tabs names your mod. Then ask Claude to run `git push --force` in a scratch repository; the command should be refused with your message.

## Sources

- Plugins overview; Install and manage plugins; Plugin security and trust; Create a plugin; Publish and distribute a plugin; Measure plugin cost and usage. Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/plugins/overview
- Test plugins with evals, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/plugin-evals
- Mods overview; Create a mod; Mods reference; React to events with a mod; Manage mods for your organization. Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/plugins/mods/overview
- What's new, Week 37 (September 7–11, 2026): `claude plugin eval`, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w37
- Claude Code changelog, 2.1.287 (2026-10-01): Claude Mods, Anthropic. https://code.claude.com/docs/en/changelog
- "Customize Claude Code with mods", Anthropic, 2026-10-01. https://claude.com/blog/claude-code-mods
- "Claude Marketplace", Anthropic, 2026-09-23. https://claude.com/blog/claude-marketplace
- "Build plugins for Claude", Anthropic, 2026-09-25. https://claude.com/blog/build-plugins-for-claude
- Max Taylor, "I benchmarked tdd-guard. It didn't write better code", 2026-09-28. https://www.maxtaylor.me/articles/i-benchmarked-tdd-guard-it-didn-t-write-better-code
- `claude plugin --help` and subcommand help, Claude Code 2.1.289, run 2026-10-04.
