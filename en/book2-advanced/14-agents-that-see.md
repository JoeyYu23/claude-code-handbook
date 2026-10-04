# Agents That See

> Verified on 2026-10-04 with Claude Code 2.1.289.

When an agent writes most of your UI code, reading every line stops being the check that matters. The question becomes: does the screen look and behave the way it should? For a long time the answer required you. You ran the app, clicked through it, took a screenshot, and pasted it back into the conversation.

That loop is now mostly closed. Claude Code can open your app in a browser pane, drive an iOS Simulator, control native apps on your desktop, and publish a page that shows you what it built. This chapter covers each of those tools, when to pick which, and how to set them up so the agent checks its own UI work before it tells you it is done.

Boris Cherny, who leads Claude Code, put it this way at Y Combinator's Startup School 2026 (quoted by John Gruber on Daring Fireball, August 2, 2026): "The verification is probably the single most important thing that people do not get right, largely." His example was an experiment that had Claude rewrite the Electron Claude desktop app in Swift, screenshot both versions, and compare them pixel by pixel; it had been running for about two weeks. Gruber's reply is worth keeping in mind too: pixel matching proves the copy matches the reference, not that the reference is any good. Visual checks answer "did it build what I specified?" You still own "was that the right thing to specify?"

You do not need a two-week project to use the idea. You need a way for the agent to see.

## Pick the most precise tool first

Claude Code has several ways to look at a running program. The official docs describe an order of preference, and it is a good rule to follow when you write prompts: the narrower the tool, the faster and more reliable the check.

| What you are checking | Best tool | Where it runs |
|---|---|---|
| Logic, data, API responses | Tests, `/verify`, plain shell commands | Any surface |
| A web app you are building | The Browser pane with preview servers | Desktop app |
| A third-party site with no login | The Browser pane (external browsing) | Desktop app |
| A site where you are logged in | Claude in Chrome | CLI, VS Code |
| An iOS app | The iOS Simulator pane | Desktop app on macOS |
| A native app, a GUI-only tool, a simulator from the CLI | Computer use | CLI on macOS; Desktop on macOS and Windows |
| Showing the result to a human | Artifacts and `/design` | CLI and Desktop |

Computer use is the broadest and slowest option. The docs say Claude falls back to it only when no connector, shell command, browser integration, or simulator pane can do the job. You should think the same way: screen control is for things nothing else can reach.

## Verify without a screen: `/run` and `/verify`

Before reaching for pixels, check whether a bundled skill already covers it. Claude Code ships three that work together:

| Skill | What it does |
|---|---|
| `/run` | Launch and drive your app to see a change working |
| `/verify` | Build and run your app to confirm a change does what it should, without falling back to tests or type checks |
| `/run-skill-generator` | Record how to build and launch your project, so `/run` and `/verify` stop guessing |

`/run` and `/verify` infer how to start your project from its type and from files like `README`, `package.json`, or a `Makefile`. That works for a standard launch. If your app needs a database, an env file, or a multi-step build, run `/run-skill-generator` once. It gets the app running from a clean environment and commits the recipe as a project skill under `.claude/skills/run-<name>/`.

`/verify` can also write its own recipe to `.claude/skills/verify/SKILL.md` when it had to work out the steps. Since v2.1.286, when a session starts with a project skill named `verify` in place, Claude's built-in commit instructions tell it to run that skill before each commit (docs and test changes excepted). Commit that file, and every agent in the repo runs the same check.

### Check that it worked

Run `/verify` after a small change. Claude should report what it built, how it launched the app, and what it observed. If it recorded a recipe, `git status` shows a new or changed `.claude/skills/verify/SKILL.md`.

## The Browser pane: let Claude test its own web changes

In the Desktop app, Claude can start your dev server and open it in the Browser pane. From there it takes screenshots, inspects the DOM, clicks elements, fills forms, and fixes what it finds. By default this happens automatically after edits: the docs call it auto-verify.

The pane can also open static HTML, PDFs, images, and videos from your project. Click such a path in the chat and it opens there.

### Configure the preview server

Claude writes the first server configuration itself and stores it in `.claude/launch.json` at the root of the folder you opened. Edit it when your dev command is not the default:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "web",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": 3000,
      "autoPort": true
    }
  ]
}
```

Useful fields, all from the Desktop docs:

- `autoPort`: `true` picks a free port when 3000 is taken and passes it to your server as `PORT`. Set `false` when the port must not change, for example for OAuth callbacks.
- `cwd`: run a server from a subfolder, such as `apps/web` in a monorepo. You can list several configurations, one per server.
- `url`: open a different address, such as `https://localhost:8443` or an `*.localhost` subdomain. Set `url` without a command to attach to a server you already run yourself.
- `env`: extra environment variables. This file is usually committed, so keep secrets out of it and use the Desktop local environment editor instead.

Auto-verify is on by default. To turn it off for one project, add `"autoVerify": false` at the top level of `launch.json`, or use the toggle in the server dropdown. Preview tools stay available either way; you can still ask Claude to verify.

Turn on **Persist sessions** in the server dropdown if you are tired of logging in again after every restart. It keeps cookies and local storage across server restarts.

### Write prompts that end in evidence

Auto-verify catches crashes and obvious breakage. For anything subtler, say what "done" looks like:

```text
Add a dark mode toggle to the settings page.
Done means: the toggle persists across reloads, the header and cards
change color, and no text is unreadable at 375px width.
After you finish, screenshot the settings page in both modes at 375px
and 1280px and tell me what you checked.
```

Two things make this prompt work. It gives a checkable definition of done, and it asks for evidence you can glance at instead of code you would have to read.

### Check that it worked

Ask Claude to change a visible string, then watch the Browser pane. You should see Claude reload the page and take a screenshot before it answers. If nothing happens, open the server dropdown and confirm a server is running and auto-verify is on.

## Browsing external sites

Since July 2026 the Browser pane can also browse external sites in tabs, so Claude can read documentation, issue trackers, or a design reference next to your app. Open it with **Cmd+Shift+B** on macOS or **Ctrl+Shift+B** on Windows, or from the **Views** menu.

External pages get two extra safety checks:

- The same safety classifiers that auto mode uses review Claude's write actions on external pages (clicking, typing) in every permission mode, and you get a prompt when they flag something.
- The first time Claude acts on a site, you choose **Allow once**, **Always allow**, or **Deny**. Each site, including each subdomain, needs its own approval. Local dev servers and project files never need approval, which is why auto-verify runs without prompts.

Even on an approved site, Claude will not buy things, create accounts, or get past CAPTCHAs without you.

The Browser pane uses a clean profile with none of your logins or history. That is a feature. Use it for building and testing and for public sites. When the agent genuinely needs to act as you, use Claude in Chrome instead (next section), and be deliberate about it.

Administrators can restrict or block external browsing with managed settings; see the Desktop docs.

## Claude in Chrome: when the agent needs your login

Claude in Chrome connects the CLI or the VS Code extension to a Chrome extension. It became generally available in the week of June 29, 2026. Claude opens its own tabs, collected in a tab group tied to your session, and shares your browser's login state. It can read console errors and DOM state, fill forms, upload files, and record a GIF of what it did.

Requirements, per the docs: Chrome, Edge, or another Chromium browser; the Claude in Chrome extension version 1.0.36 or later; a direct Anthropic plan (Pro, Max, Team, or Enterprise) signed in with `/login`. It does not work with an API key, through Bedrock, Google Cloud, or Foundry, or in WSL.

Start a session with the integration on:

```bash
claude --chrome
```

Then run `/chrome` to check status, manage site permissions, reconnect, or pick which connected browser to use. The integration is working when the panel shows `Status: Enabled` and `Extension: Installed`.

You can make it the default from `/chrome`, but note the docs' warning: with Chrome enabled by default, the browser tools and their instructions are always loaded, which costs context in every session. Connecting only when you need it with `--chrome` is the cheaper habit. See [Context Engineering](/en/book2-advanced/15-context-engineering) for why that matters.

::: warning
Claude in Chrome acts inside your real logged-in sessions: email, docs, admin consoles. Text on any page it reads can try to steer it. Keep it for tasks that need your identity, keep site permissions narrow in the extension settings, and prefer the Desktop Browser pane or a headless test browser for everything else. [Containment and Security](/en/book3-architect/09-containment-and-security) covers prompt injection in more depth.
:::

### Check that it worked

Run:

```text
Open http://localhost:3000, read the browser console, and list any errors.
```

A new tab should open in a Claude tab group, and Claude should report the console contents. If it says browser tools are unavailable, run `/chrome` and follow the reconnect option.

## The iOS Simulator pane

Claude Code Desktop on macOS has an iOS Simulator pane, in public beta since late July 2026. When Claude builds, installs, launches, or checks your app in a simulator, the pane opens next to the conversation and streams the device screen. Claude taps through the app and reads the screen to confirm its changes; you can watch, or drive the same device yourself.

The pane drives the simulator directly. It does not need computer use, never takes over your screen, and does not need the macOS Accessibility or Screen Recording permissions.

Requirements from the docs:

- Claude Desktop v1.24012.0 or later, on a Mac
- Xcode with the iOS platform installed (the pane uses whichever Xcode `xcode-select -p` points to)
- Pro, Max, Team, or Enterprise, except Enterprise organizations with a HIPAA configuration
- A local session; cloud and SSH sessions cannot reach your simulators

There is no command to open it. Phrase the task around running or checking the app:

```text
Build the app and run it on the iPhone SE simulator.
Tap through onboarding and confirm each screen fits without clipping.
Screenshot any screen that looks wrong.
```

Things worth knowing:

- **Consent per device.** The first time Claude uses a simulated device, you allow it once. Claude's screenshots of the device go to Anthropic under your normal retention settings, so do not sign in to real accounts on a device Claude uses.
- **Two actions follow your permission mode instead.** Opening a URL on the device (it can carry data off the device) and building the app (`xcodebuild` runs your project's build scripts on your Mac).
- **One device per session.** Parallel sessions each get their own device, up to four panes per session. Desktop shuts down simulators it booted when you quit, archive the session, or ten minutes after you detach.
- **Simulators only.** Claude cannot drive a physical iPhone.

From the CLI there is no pane. Claude reaches the simulator through computer use, controlling it with the mouse on your screen.

### Check that it worked

Ask Claude to build and run the app. The pane should open with a live device and a **Claude is using this device** badge while Claude drives it. If the pane says no simulators were found, install the iOS runtime from Xcode's settings or run `xcodebuild -downloadPlatform iOS`.

## Computer use: the last resort that reaches everything

Computer use lets Claude see your screen and control the mouse and keyboard. It is the tool for native apps, design tools, hardware control panels, and anything without an API.

Availability matters here, because it is narrower than the other tools:

- **CLI:** research preview on macOS, Pro or Max plans only, interactive sessions only (not with `-p`).
- **Desktop:** research preview on macOS and Windows, Pro or Max only. Not on Team or Enterprise plans. Since early September 2026 it can also run in the background on macOS, working in approved apps while you keep working.

### Enable it in the CLI

Computer use ships as a built-in MCP server called `computer-use`, off by default:

1. In an interactive session, run `/mcp`.
2. Select `computer-use` and choose **Enable**. The choice persists per project.
3. The first time Claude uses your screen, macOS asks for **Accessibility** and **Screen Recording**. Grant both, then select **Try again**. macOS may require restarting Claude Code after granting Screen Recording.

In Desktop, the toggle is under **Settings > This computer > System > Computer use**.

### How it behaves

- **Per-app approval.** Enabling the server does not grant every app. Each app needs **Allow for this session**. Terminals and IDEs carry an "equivalent to shell access" warning; Finder and System Settings carry their own.
- **Fixed control tiers.** Browsers and trading platforms are view-only, terminals and IDEs are click-only, everything else gets full control. This pushes Claude toward the dedicated tools.
- **One session at a time**, holding a lock until it exits. Other apps are hidden while Claude works, and your terminal is excluded from screenshots.
- **Stop anytime** with `Esc` anywhere, or `Ctrl+C` in the terminal.

A typical prompt:

```text
Build the MenuBarStats target, launch it, open the preferences window,
and verify the interval slider updates the label. Screenshot the
preferences window when you're done.
```

::: warning
Unlike the sandboxed Bash tool, computer use runs on your real desktop with whatever you approve. Claude checks each action and flags possible prompt injection from on-screen content, but the trust boundary is different. Approve the fewest apps you can, close windows with sensitive data, and never approve a terminal "just to be safe".
:::

### Check that it worked

Run `/mcp` and confirm `computer-use` shows as enabled. Then ask for a harmless check, such as opening Calculator and reading the display. You should see the macOS notification "Claude is using your computer · press Esc to stop" and, at the end, a second notification that Claude is done.

## Showing you the result: artifacts and `/design`

Seeing is not only for the agent. When terminal text is the wrong medium, Claude can publish an artifact: a single interactive web page on claude.ai, private to you until you share it. Ask for one in plain words:

```text
Make an artifact that shows the settings page before and after this
change, side by side, with the three screenshots you took.
```

Artifacts suit annotated diffs, before-and-after comparisons, dashboards, and option grids. Since July 2026 a published artifact can also pull live data through the viewer's MCP connectors. They require a Pro, Max, Team, or Enterprise plan, a session signed in with `/login`, and the Anthropic API (not Bedrock, Google Cloud, or Foundry). Press `Ctrl+]` to reopen the session's most recent artifact.

`/design` (a research preview; the commands reference lists v2.1.265 or later) builds on artifacts: give it a brief and Claude publishes a canvas of editable artboards. You pick one, adjust it, and tell Claude to implement it. Then the Browser pane or simulator closes the loop by checking the implementation against the artboard.

A styled page costs more output tokens than the same content as text, and images embedded as data URIs are the main driver. The docs suggest SVG or HTML for diagrams, no interactivity you do not need, and summaries instead of full datasets.

## Building your own agent that sees

If you are building an agent on the Claude API rather than using Claude Code, the same capabilities exist as tools. On August 19, 2026, the computer use tool left beta as the `computer_toolset_20260801` toolset (no beta header, several actions per turn, `zoom` on by default), and Anthropic launched a browser use tool, `browser_toolset_20260801`, for driving a browser your application hosts. The browser toolset reads the page itself (accessibility tree, elements, forms, tabs) on top of screenshot-and-click. On Opus 5.5 and Sonnet 5.5 on the Claude API, the older `computer_20251124` tool is rejected, so new integrations should start on the toolsets. See the platform release notes for migration details.

## Costs and failure modes

Seeing is not free, and it is not proof.

- **Screenshots fill context.** The API limits how many images a request can carry. When a session passes the limit, Claude Code drops a batch of the oldest images and the next turn reprocesses the conversation from that point, so you pay a cache rebuild. Long visual sessions are a good reason to compact or start fresh. See [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching).
- **A screenshot shows one state.** "It rendered" is not "it works". Pair visual checks with tests for the logic behind them; [Check the Work](/en/book1-getting-started/12-check-the-work) and [Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals) cover how.
- **The agent grades its own homework.** Ask for the evidence (screenshots, console output, the steps it took), not only the verdict. When the stakes are high, have a second agent or a human look at that evidence.
- **Pages and screens are untrusted input.** Anything Claude reads on a web page or screen can contain instructions aimed at it. The more access the tool has (your logged-in Chrome, your full desktop), the more this matters.

## Check that it worked

Pick one UI change in a project you know and run the loop end to end:

1. Ask for the change with a written definition of done and a request for screenshots.
2. Confirm Claude used the most precise tool available (Browser pane, Chrome, simulator pane, or computer use only when nothing else fits).
3. Look at the screenshots or the artifact it produced, not the diff, and decide whether the change is right.
4. If you could make that call from the evidence alone, the setup is working.

## Sources

- "Desktop application" (preview, Browser pane, computer use), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/desktop
- "Test iOS apps in the simulator", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/desktop-ios-simulator
- "Let Claude use your computer from the CLI", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/computer-use
- "Use Claude Code with Chrome", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/chrome
- "Share session output as artifacts", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/artifacts
- "Extend Claude with skills" (Run and verify your app), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/skills
- "Commands" reference (`/design`, `/verify`), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- What's new, Week 27 (June 29 – July 3, 2026), Week 28 (July 6–10), Week 30 (July 20–24), Week 34 (August 17–21), Week 36 (August 31 – September 4), Anthropic. https://code.claude.com/docs/en/whats-new
- "How Claude Code uses prompt caching" (Accumulating many images), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- Claude Platform release notes, August 19, 2026 (computer use toolset GA, browser use tool) and September 22, 2026 (Opus 5.5), Anthropic. https://platform.claude.com/docs/en/release-notes/overview
- "Boris Cherny on Trying to Get Claude Code to Rewrite the Claude App", Daring Fireball (John Gruber), 2026-08-02. https://daringfireball.net/linked/2026/08/02/cherny-claude-swift
