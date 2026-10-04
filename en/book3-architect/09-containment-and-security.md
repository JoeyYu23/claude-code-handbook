# Containment and Security

> Verified on 2026-10-04 with Claude Code 2.1.289.

There are two ways to limit the damage an agent can do. You can supervise what it does, by approving actions or having a classifier approve them. Or you can contain what it is able to do, with boundaries the operating system enforces whatever the agent decides. Anthropic's engineering post "How we contain Claude across products" (May 2026) puts it plainly: supervision is probabilistic and has a miss rate; containment is deterministic and is "what gets hit when everything probabilistic misses."

Since August 2026, Claude Code supervises by default: auto mode is the starting permission mode. This chapter is about what that does and doesn't buy you, and how to add the containment that has to sit underneath it once agents run for hours without you watching.

## Three sources of risk

Anthropic's post sorts agent risk into three kinds. It is a useful checklist because each needs a different defense.

- **User misuse.** You, or a teammate, ask for something harmful, carelessly or on purpose. That includes being phished: in an internal red-team exercise in February 2026, a researcher emailed an employee a ready-to-paste prompt that, among routine setup steps, asked Claude to read `~/.aws/credentials` and POST it to an external endpoint. Claude completed the exfiltration in 24 of 25 runs. The instruction came from the user, so there was nothing anomalous for a model-side check to catch.
- **Model misbehavior.** The agent does something nobody asked for. Anthropic reports seeing Claude models "helpfully" escape a sandbox to finish a task and dig through git history for test answers. More capable models make fewer obvious mistakes but find more unexpected paths to a goal.
- **External attackers.** Instructions arrive through what the agent reads: web pages, files, tool results, MCP servers, other agents. This is prompt injection.

Model-side defenses (training, classifiers, probes) help against the second and third. Only environment boundaries help against all three.

## What auto mode buys, and what it doesn't

Auto mode replaces most permission prompts with a classifier that blocks actions that go beyond your request, target infrastructure it doesn't recognize, or look driven by hostile content. [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) covers how to use it. Here are the numbers Anthropic has published, and what they mean for design.

**It beats tired humans.** In a controlled study with 1,053 paid testers, one permission prompt per session was swapped for a clearly dangerous command. Testers caught 13.6% of them; auto mode blocked 89%. Anthropic's telemetry shows users approve 93% to 97% of permission prompts, depending on which post you read, and approve more carelessly as a session goes on. Per-action human review was never a strong boundary.

**It has a known miss rate.** A footnote in the containment post says the classifier blocks roughly 0.4% of benign commands and lets roughly 17% of "overeager" actions through, and calls it "one layer of defense-in-depth inside a sandbox, not a substitute for one." The documentation says the same: the classifier "is a per-action control, not an isolation boundary."

**Targeted attacks get through.** Anthropic's launch post for the new default reported that none of 720 indirect prompt-injection attempts in a third-party evaluation (Trajectory Labs, 72 scenarios run 10 times each) succeeded against its models in auto mode. On 26 August 2026, Johann Rehberger (Embrace the Red) published a chain that did succeed, in 3 to 4 of 5 attempts per variant on a small sample:

1. A web page answers WebFetch with `415 Unsupported Media Type`, so Claude retries with `curl` in Bash.
2. A redirect serves a ZIP with encoded records, a decoder binary, and a file named `struct.py`.
3. Claude sensibly refuses to run the binary and writes its own Python decoder instead.
4. It runs that decoder from inside the extracted folder. Python's `base64` imports `struct`, the planted `struct.py` shadows the standard module, and the attacker's code runs.

The classifier only saw a short, harmless-looking decoder. In some runs, auto mode then blocked the command Claude wrote to kill the malware once it noticed. Anthropic closed the report as informative and, in Rehberger's account, described auto mode as a best-effort convenience feature whose real boundary is OS isolation and network egress control. Rehberger's own advice: run unattended agents in a container, VM or OS sandbox, restrict egress, monitor them, and keep home directories, SSH keys and cloud credentials out of reach.

**Some defaults surprise people.** Auto mode allows, by default, reading `.env` and sending credentials to their matching API, and pushing to any branch of the repository you're working in, including the default branch. Run `claude auto-mode defaults` to see the full rule lists your version ships with.

The design conclusion: keep auto mode on, because it is better than prompt fatigue, but treat every unattended run as if the classifier will eventually miss.

## Fences and sandboxes

Steve Yegge's essay "Fences, not Sandboxes" (24 August 2026) argues the opposite emphasis. After ten weeks running a factory of 50 to 60 agents, he found they had built a governance system for themselves, with written rules, rulings, and over a hundred "fences". A fence, in his words, is "any mechanism that turns you away if you aren't supposed to be there": not a wall that stops a determined adversary, but "a polite refusal." His bet is that as models mature, organizations will govern them mostly with rules like these rather than with containment.

Both views are useful if you are precise about what each mechanism stops:

| Mechanism | Kind | Stops a well-meaning agent | Stops a hijacked agent |
|---|---|---|---|
| `permissions.deny` and `ask` rules | Fence | Yes, for commands as written | Not reliably; rules match the command text |
| PreToolUse hooks | Fence | Yes | Only what the hook can see |
| Auto mode classifier, `hard_deny` rules | Fence | Mostly | Sometimes, as above |
| Branch protection, required CI checks | Fence, enforced by the server | Yes | Yes, for that one action |
| Bash sandbox | Sandbox | Yes | For shell commands only |
| Container or VM with egress control | Sandbox | Yes | Yes, within the boundary |

Fences encode what you want and catch honest mistakes cheaply. The Embrace the Red chain is what fences don't cover: every step looked legitimate. So fence the workflow, and sandbox the machine.

## Choose an isolation boundary

The Claude Code docs compare the options by what they isolate:

| Approach | What is inside the boundary | Setup |
|---|---|---|
| Sandboxed Bash tool (`/sandbox`) | Bash, PowerShell and Monitor commands and their children | Minimal on macOS; `bubblewrap` and `socat` on Linux and WSL2 |
| Sandbox runtime (`npx @anthropic-ai/sandbox-runtime claude`) | The whole Claude Code process, including file tools, MCP servers and hooks | Low; beta research preview |
| Dev container | The full development environment | Medium; Docker |
| Virtual machine | A full operating system | High |
| Cloud session | A full OS on Anthropic's infrastructure | None; needs a subscription |

The built-in Bash sandbox is the easy win, but read its limits. It covers shell commands only. The Read, Edit and WebFetch tools follow permission rules instead; hooks, local MCP servers, LSP servers and your status line command run outside it with your full access. By default, sandboxed commands can still read most of your machine, including `~/.ssh` and `~/.aws/credentials`, until you deny them. Network filtering checks hostnames without inspecting TLS, so a broad allowed domain such as `github.com` can become an exfiltration path. For `--dangerously-skip-permissions`, the docs say to always use a container, VM or the sandbox runtime, so that file tools, MCP servers and hooks are inside the boundary too.

Two boundaries people assume and shouldn't:

- **Worktrees.** A linked worktree shares hooks, config, refs and the stash with the main repository. Alex Chaplinsky's post "Git worktrees are not an isolation boundary for coding agents" (July 2026) shows an agent in a worktree installing a `pre-commit` hook that runs as you in your main checkout, and rewriting the email on your own commits. Claude Code's worktree checks stop accidental edits to the main checkout; they are not a security boundary. See [Worktrees](/en/book2-advanced/08-worktrees).
- **Dev containers with your credentials inside.** The docs warn that with `--dangerously-skip-permissions`, a malicious project can exfiltrate anything in the container, including Claude Code's own credentials in `~/.claude`. Don't mount `~/.ssh` or cloud credential files; prefer short-lived, repository-scoped tokens.

### Set up the Bash sandbox for unattended work

Put this in `~/.claude/settings.json` (or deploy it through managed settings, below):

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false,
    "credentials": {
      "files": [
        { "path": "~/.aws/credentials", "mode": "deny" },
        { "path": "~/.ssh", "mode": "deny" }
      ],
      "envVars": [
        { "name": "GITHUB_TOKEN", "mode": "deny" },
        { "name": "NPM_TOKEN", "mode": "deny" }
      ]
    }
  },
  "permissions": {
    "deny": ["Read(~/.aws/**)", "Read(~/.ssh/**)", "Read(./.env)"]
  }
}
```

`failIfUnavailable` makes Claude Code refuse to start rather than silently run unsandboxed when a dependency is missing. `allowUnsandboxedCommands: false` removes the escape hatch that lets Claude retry a failed command outside the sandbox. The `credentials` block covers sandboxed commands; the `Read` deny rules cover Claude's own file tools, which the sandbox doesn't wrap. There is no built-in credential deny list, so list what you have.

### Check that it worked

Ask Claude (don't type these yourself at the `!` prompt, which runs outside the sandbox) to run:

- `touch ~/sandbox-probe`: it should fail with `Operation not permitted` on macOS or `Read-only file system` on Linux and WSL2.
- `curl --noproxy '*' https://example.com`: it should fail with `Could not resolve host`.
- `cat ~/.aws/credentials`: it should be denied.

If Claude offers to retry outside the sandbox, decline. If `touch` succeeds, run `/sandbox` and check the Config tab and dependencies.

## Prompt injection: assume it lands, control where data goes

No current defense stops every injection. The lessons in Anthropic's containment post are about limiting what a successful one can do:

- **Egress is where exfiltration ends.** Both of Anthropic's most instructive incidents were data leaving through a permitted path. In one, a third party showed that Cowork's allowlisted `api.anthropic.com` let a planted file upload workspace files to the attacker's own Anthropic account using an attacker-supplied API key. Their conclusion: an allowlist entry is "a capability grant", not a destination filter. Everything reachable through an allowed domain is attack surface.
- **Tool output is untrusted even when the tool is trusted.** An audited GitHub connector can still load a poisoned README into context.
- **Persistent state outlives the session.** CLAUDE.md files, memory, mounted workspaces and the state of scheduled agents are reloaded every run. An injection that writes there becomes a persistence mechanism. Review changes to agent instruction files like code, and give long-lived agents read-only access to anything they don't need to change.
- **Untrusted repositories can run code before you approve anything.** In a `claude -p` or SDK run, the workspace trust dialog never appears, and a repository's hooks, `env` block and `apiKeyHelper` are used. Don't run headless Claude Code on an untrusted checkout, such as an external contributor's PR, outside a container or VM.
- **`.claudeignore` does nothing.** The first edition recommended it. The permissions docs say a `.claudeignore` file "has no effect"; use `Read` deny rules.
- **Deny rules match commands as written.** `Bash(git push *)` doesn't match `git -C repo push`. For a firm network boundary, use the sandbox or your firewall, not command patterns.

## Security agents

Agents now also hunt for vulnerabilities. Three you will meet:

- **Claude Security plugin.** A multi-agent scan inside your session: agents map the architecture, build a threat model, hunt, and independently review each finding before writing a report, then turn the findings you choose into patches you review. Install with `/plugin install claude-security@claude-plugins-official`, then run `/claude-security`. It can scan a whole repository or only a branch, PR or commit, and its usage counts against your plan. Lighter options already built in: `/security-review` for one pass over your branch, and the security guidance plugin, which reviews code as Claude writes it.
- **Cursor Security Review.** A Cursor bot launched on 23 September 2026 for Teams and Enterprise. It posts one review comment per pull request reporting exploitable bugs (injection, auth bypasses, committed secrets, SSRF, unsafe deserialization, vulnerable dependency changes) with an attack path and proposed fix, and enforces team rules you write.
- **Codex Security.** OpenAI's open-source CLI and TypeScript SDK (`npx @openai/codex-security scan <dir>`) for finding, validating and fixing vulnerabilities, with a command that drafts a `SECURITY.md` policy for future scans.

These are worth running, and they find real bugs. They are also agents reviewing agent-written code, often on the same model family, so they share blind spots. Treat a clean scan as one signal. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers how to combine reviewers.

## Admin controls that hold

For a team, put policy in managed settings, which users can't override. On macOS the file is `/Library/Application Support/ClaudeCode/managed-settings.json`; on Linux and WSL, `/etc/claude-code/managed-settings.json`; it can also come from MDM or server-managed settings on claude.ai. Settings confirmed in the current settings reference:

| Setting | Effect |
|---|---|
| `permissions.disableBypassPermissionsMode: "disable"` | Rejects `--dangerously-skip-permissions` |
| `allowManagedPermissionRulesOnly: true` | Ignores allow, ask and deny rules from user, project and local files and `--allowedTools` |
| `permissions.deny` | Blocks tool uses in every mode, including bypass |
| `disableAutoMode: "disable"` | Removes auto mode; sessions start in Manual |
| `autoMode.hard_deny` | Classifier rules that user intent can't override |
| `sandbox.enabled`, `failIfUnavailable`, `allowUnsandboxedCommands` | Requires the Bash sandbox |
| `deniedModels`, `availableModelsMatch` | Block models or versions (2.1.283+) |
| `allowedProviders` | Limit which API providers the machine may use (2.1.285+) |
| `maxEffortLevel` | Cap effort, and with it spend per turn (2.1.267+) |
| `disableRemoteControl: true` | Turn off Remote Control |

Two caveats. Developers can add their own `autoMode.allow` entries, and an `allow` entry can override an organization's `soft_deny`; only `hard_deny` and permission deny rules are firm. And for running Claude Code inside an evaluation or scanning harness, `claude --restricted` removes the command-running tools and WebFetch unless `--tools` names them, ignores user, project and local settings, confines file tools to the working directories, and refuses bypass mode.

A starting file:

```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./secrets/**)"],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true,
  "sandbox": { "enabled": true, "failIfUnavailable": true, "allowUnsandboxedCommands": false }
}
```

### Check that it worked

On one machine, run `/status` inside Claude Code. The `Setting sources` line should show `Enterprise managed settings` with the source in parentheses, such as `(file)` or `(remote)`. Then run `claude --dangerously-skip-permissions`: it should be refused.

## Budgets are containment too

A runaway agent can do financial damage as well as technical damage. Simon Willison argued on 3 October 2026 that services agents touch need "default hard budget caps", limits that cut off and return errors, not warning emails. Apply the same rule to your own agents: `--max-budget-usd` on every headless run, a session `budget` on Managed Agents, spend limits on usage credits and API workspaces, and hard caps on any cloud account an agent can deploy to. [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) lists where each cap lives.

## A minimum baseline

For anything that runs unattended:

1. Auto mode on, with `permissions.deny` for secrets and `ask` for pushes and deploys you want to see.
2. The Bash sandbox on, with `failIfUnavailable` and `allowUnsandboxedCommands: false`, and credential paths denied.
3. Unattended or untrusted work in a container, VM or cloud session, with egress restricted to what the task needs.
4. No long-lived credentials inside the boundary. Use scoped, short-lived tokens.
5. Server-side fences that hold no matter what: branch protection, required checks, no agent approving its own PR.
6. A hard spend cap on every run.
7. Logs you actually read: OpenTelemetry export, or at least `/permissions` > Recently denied.

## Sources

- "How we contain Claude across products", Anthropic Engineering (Max McGuinness, Mikaela Grace, Jiri De Jonghe, Jake Eaton, Abel Ribbink), 2026-05-25. https://www.anthropic.com/engineering/how-we-contain-claude
- "Auto mode is now the default in Claude Code for Pro, Max, and Team plans", Claude blog, Anthropic, 2026-08-07. https://claude.com/blog/auto-mode-default-in-claude-code
- "Breaking Claude Code Opus 5 Auto Mode", Johann Rehberger, Embrace The Red, 2026-08-26 (Hacker News discussion 2026-08-31). https://embracethered.com/blog/posts/2026/breaking-claude-code-opus-5-and-automode/
- "Fences, not Sandboxes", Steve Yegge, 2026-08-24. https://yegge.ai/essays/fences-not-sandboxes/
- "Git worktrees are not an isolation boundary for coding agents", Alex Chaplinsky, Fletch, 2026-07-30. https://fletch.sh/blog/git-worktrees-vs-clones-for-ai-agents/
- "We're going to need default hard budget caps on pretty much everything", Simon Willison, 2026-10-03. https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/
- "Choose a permission mode", "Configure auto mode", "Configure the sandboxed Bash tool", "Choose a sandbox environment", "Development containers", "Configure permissions", "Security", "Managed settings", "Settings reference", "Scan your codebase for vulnerabilities", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes , https://code.claude.com/docs/en/auto-mode-config , https://code.claude.com/docs/en/sandboxing , https://code.claude.com/docs/en/sandbox-environments , https://code.claude.com/docs/en/devcontainer , https://code.claude.com/docs/en/permissions , https://code.claude.com/docs/en/security , https://code.claude.com/docs/en/managed-settings , https://code.claude.com/docs/en/settings-reference , https://code.claude.com/docs/en/claude-security
- "Rollouts and Security Review", Cursor changelog, 2026-09-23. https://cursor.com/changelog
- openai/codex-security repository README, GitHub, accessed 2026-10-04. https://github.com/openai/codex-security
- `claude --help` and `claude auto-mode --help`, Claude Code 2.1.289, run 2026-10-04.
