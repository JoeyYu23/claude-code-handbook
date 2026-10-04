# Cloud and Managed Agents

> Verified on 2026-10-04 with Claude Code 2.1.289.

Sooner or later an agent has to run somewhere other than your laptop: overnight, in parallel, near internal services, or inside a product you ship. In October 2026 there are four distinct answers, and they are easy to confuse because they share words like "cloud", "environment" and "session".

Keep two questions apart:

1. **Where does the agent loop run?** On your machine, in an Anthropic-managed VM, or on hosts your organization operates.
2. **Where does the model run?** On the Anthropic API, or through a cloud provider such as Amazon Bedrock.

| Option | Agent loop runs on | Model served by | Built for |
|---|---|---|---|
| Cloud sessions (Claude Code on the web) | Anthropic-managed VM | Anthropic API | Developers handing off tasks |
| Self-hosted environments | Your hosts, via runners | Anthropic API by default | The same, inside your network |
| Claude Managed Agents | Anthropic sandbox or your own sandbox | Anthropic API (or Claude Platform on AWS) | Agents inside your own product |
| Cloud provider deployment | Wherever you run `claude` | Bedrock, Agent Platform or Foundry | Billing and governance in your cloud |

The rest of this chapter takes them in turn, then covers the one remote job most teams adopt first: code review that runs in the cloud.

## Cloud sessions from the terminal

A cloud session is a full Claude Code session on an Anthropic-managed VM. It keeps running after you close the laptop, and you can steer it from any device. From the CLI:

```bash
# start a new cloud session for the current repository
claude --cloud "Fix the flaky test in auth.spec.ts"

# queue a follow-up message into a running cloud session
claude -p "Also update the changelog" --cloud <session-id>

# pull a cloud session and its branch into this checkout
claude --teleport            # picker
claude --teleport <session-id>
```

Each `--cloud` call creates an independent session, so three calls give you three parallel workers. Handoff from the CLI is one-way: you can pull a cloud session down with `--teleport` (or `/teleport` inside a session), but you can't push a running terminal session up. If the repository has no GitHub remote, or the Claude GitHub App isn't installed on it, Claude Code bundles and uploads your local repository instead.

`--cloud` needs a claude.ai login and the organization's remote-sessions policy turned on. It is not available on Bedrock, Agent Platform or Foundry. The older `--remote` spelling still works as a deprecated alias. The first edition's `claude --remote <host> --teleport`, `tp_...` session IDs and `claude teleport revoke` never existed; ignore them.

On isolation, the docs list what you get in Anthropic-hosted environments: an isolated VM per session, network access limited by default, and git credentials that never enter the VM (a proxy attaches them server-side and refuses branch deletions and tag pushes).

### Check that it worked

`claude --cloud "List the top-level directories and stop"` prints a session link. Open it at claude.ai/code and watch the session run. Then run `claude --teleport <session-id>` in a clean checkout of the same repository; you should land on the session's branch with its conversation loaded.

## Self-hosted environments

Self-hosted environments (public beta, Team and Enterprise, off by default) run those same cloud sessions on infrastructure you operate. Developers see your environment in the same picker as Anthropic's. There are three parts:

- **Environment**: a named destination created on the **Cloud environments** admin page. It has one shared secret (the "environment key") and an ID that starts with `ccpool_`.
- **Runner**: a long-lived process on your hosts, built into the normal `claude` binary as `claude self-hosted-runner`. Like a self-hosted CI runner, it polls for work, clones the repository, and spawns a child Claude Code process per session.
- **Session**: one task a developer started.

All traffic is outbound: runners poll `api.anthropic.com`, and Anthropic never connects into your network. Two facts shape the design:

- **Session content still goes to Anthropic.** Checkouts, build artifacts and secrets stay on your hosts, but prompts, responses and tool results stream to `api.anthropic.com`, and Anthropic stores the transcript. Self-hosting is about where code executes and what it can reach, not about keeping the conversation in-house.
- **A runner serves one owner at a time.** The first session a runner claims locks it to that user, so checked-out code never mixes between people. With the default `--drain-grace-sec 0`, a runner exits when its sessions finish, and your orchestrator restarts it on a fresh disk. Your minimum fleet size is the number of people (and Claude Tag agents) active at once.

The smallest working setup, after an Owner turns on **Allow self-hosted environments** and creates an environment:

```bash
claude self-hosted-runner --help        # needs Claude Code 2.1.224 or later
mkdir -p /etc/claude
(umask 077 && cat > /etc/claude/environment-secret)   # paste the key, Enter, Ctrl-D
claude self-hosted-runner \
  --environment-secret-file /etc/claude/environment-secret \
  --base-dir /srv/claude-work
```

`claude self-hosted-runner setup` runs a guided version of the same steps. For production, the docs cover runner images, egress control, git credentials, Kubernetes recipes and an autoscaling orchestrator.

What doesn't route to self-hosted runners yet: Code Review and Claude Security sessions. Organizations with Zero Data Retention can't use the feature. If a runner sends model requests to Bedrock or Agent Platform, server-managed settings from claude.ai no longer reach its sessions.

### Check that it worked

On the Cloud environments page, the environment's status changes from **No runners deployed** to **Healthy** within seconds of the runner starting. Start a session at claude.ai/code and pick your environment: the runner logs `Picked up session <session-id>` with its active count and capacity. Then `claude -p "say hi" --cloud <session-id>` from any logged-in machine prints `Sent to cloud session.`

## Claude Managed Agents

Managed Agents is a different product. It is an API for running Claude as an autonomous agent inside your own application: Anthropic supplies the agent loop, tools, sandbox and session state, and you create agents, environments and sessions with HTTP calls, the SDKs or the `ant` CLI. It is in beta behind the `managed-agents-2026-04-01` header (the SDKs set it for you) and is enabled by default for API accounts. It is not eligible for Zero Data Retention or HIPAA BAA coverage, because sessions are stateful by design.

Use Claude Code when a developer is driving. Use Managed Agents when your software is driving: an inbound triage agent, a nightly data job, a customer-facing assistant. Four platform release notes from August and September 2026 matter for anyone running these unattended.

### Session budgets (7 August)

A session can carry a hard spend ceiling. The platform prices everything the session consumes at public list rates (model tokens, web searches at $10 per 1,000, and runtime at $0.08 per hour) and stops issuing new model requests once that "list cost" reaches the cap. The session pauses with the stop reason `budget_reached`; it is not terminated, and raising or removing the budget resumes it.

Three details catch people out:

- **The amount is in cents, as a string.** `"125"` means $1.25. Decimals such as `"25.00"` are rejected.
- **The cap is checked between requests.** The request that crosses the line still finishes, so a session capped at 50 cents can pause at 53. Size the cap with one request's margin per thread.
- **Budgets attach at creation only.** You can change or remove a budget later, but you can't add one to a session that started without it. On a scheduled deployment, the budget applies to each run separately, not to the deployment's total.

Because the cap uses list prices, a negotiated discount means you hit the cap before you have spent that much in real money.

### Advisor model (7 August)

An agent can name an advisor: a model at least as capable as its own that the primary thread consults mid-turn for planning or a second look. You add it as `{"type": "advisor", "model": "<model id>"}` in the agent's multiagent roster. Consultations count against the same budget at the advisor's rates. Depending on the advisor model, your client may see only a `redacted` placeholder while the agent reads the full advice, so check the compatibility table before you rely on reading it.

### Auto permission policy (10 September)

Tools in the built-in agent toolset run without asking by default, and MCP tools default to asking. The new `auto` policy lets the server evaluate each call against the tool, its input and the conversation so far. Each call runs, is denied (the agent gets an error result and your client can't override it), or pauses for your approval when the server can't decide.

Two warnings from the docs deserve repeating. First, `auto` is not a human checkpoint: a call judged safe runs before anyone sees it. Put `always_ask` on any tool a person must review. Second, the server treats text in `user.message` events as your intent, and not text from tool results, fetched pages or other threads. If your application relays an end user's text in `user.message`, that user's words count as intent too.

### Memory stores

A memory store is a set of text documents that outlives sessions. Attached at session creation (up to eight per session), each store is mounted under `/mnt/memory/`, and the agent reads and writes it with ordinary file tools. Every change creates an immutable version, so you get an audit trail. Since 19 August, sessions in self-hosted sandboxes can attach stores too; the SDK workers download each store into the sandbox and sync changes back.

Stores attach `read_write` by default. The docs warn that a prompt injection in one session can then write instructions that later sessions read as trusted memory. Attach reference material `read_only`.

### Try it

With the `ant` CLI installed (`brew install anthropics/tap/ant` on macOS) and an environment created as in the quickstart, describe the agent in a file:

```markdown
---
name: Ops Agent
model: claude-opus-5-5
tools:
  - type: agent_toolset_20260401
    default_config:
      permission_policy:
        type: auto
    configs:
      - name: bash
        permission_policy:
          type: always_ask
---

You triage failing builds and propose fixes. Do not push.
```

```bash
ant apply agent.md        # prints the agent ID and writes claude-lock.json
ant beta:sessions create \
  --agent "$AGENT_ID" \
  --environment-id "$ENVIRONMENT_ID" \
  --budget '{type: limit, max_list_cost: {amount: "200", currency: USD}}'
ant beta:sessions connect <session-id>
```

`connect` (CLI 1.32.0 or later) follows the session live, lets you send messages, and shows **Allow tool call?** when a call is waiting. Add `--web` to open the Console's session viewer instead.

### Check that it worked

`ant beta:sessions list` shows the new session. In the `connect` view, ask the agent to run a shell command: because `bash` is `always_ask`, the input line changes to **Allow tool call?**. On the session's event stream, each `agent.tool_use` event carries an `evaluation` field that says whether `auto` or `always_ask` decided the call. When the session goes idle, its `usage.list_cost` should be well under 200 cents.

## Cloud providers: Bedrock, Agent Platform, Foundry

If your organization buys Claude through a cloud provider, Claude Code can send its model requests there. The supported options are Amazon Bedrock, Claude Platform on AWS, Google Cloud's Agent Platform (formerly Vertex AI) and Microsoft Foundry. Billing, IAM and audit logs then live in your cloud: AWS Cost Explorer and CloudTrail, GCP Billing and Cloud Audit Logs, Azure Cost Management and Azure Monitor.

The easiest setup is the login wizard. Run `claude`, choose **3rd-party platform**, then Amazon Bedrock or Google Vertex AI (the label the prompt still uses for Agent Platform). It checks which models your account can invoke, lets you pin them, and writes the result to the `env` block of `~/.claude/settings.json`. `/setup-bedrock` and `/setup-vertex` reopen it later. Manual setup uses environment variables:

```bash
# Amazon Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Google Cloud's Agent Platform
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource-name
```

Then pin model versions with `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` and `ANTHROPIC_DEFAULT_FABLE_MODEL`, using the IDs your provider console shows. Without pins, aliases resolve to Claude Code's built-in default for that provider, which can lag the newest release. Don't copy model ID tables from books, this one included: provider IDs and regional availability change faster than any book.

What you give up: Remote Control, `--cloud`, `--teleport` and ultrareview all need a claude.ai login and the Anthropic API. Auto mode works on these providers only with newer models (Sonnet 5 or later, Opus 4.7 or later, and the Fable models).

To keep a managed fleet on one route, set `allowedProviders` in managed settings (Claude Code 2.1.285 or later), for example `["bedrock"]`. For per-team budgets or central keys in front of any provider, put an LLM gateway behind `ANTHROPIC_BASE_URL` or the provider-specific base URL variables. The docs mention LiteLLM as one that enterprises use, and note it is unaffiliated with Anthropic and not security-audited.

### Check that it worked

Start `claude` and run `/status`. The `API provider` line should read Amazon Bedrock, Google Vertex AI or Microsoft Foundry, with your region, project or resource and the resolved model. If the line is missing, the variables aren't reaching the process; set them in the `env` block of your settings file instead of your shell.

## Remote review

Review is the cloud job most teams turn on first, because it runs in parallel with the developer and its cost is easy to see. There are two Anthropic-hosted options.

**Ultrareview** (research preview) runs a fleet of reviewer agents in a cloud sandbox against your branch or a PR. Every finding is reproduced before it is reported. From a session:

```text
/code-review ultra            # current branch vs default branch
/code-review ultra develop    # against another base
/code-review ultra 1234       # a GitHub PR
```

From CI or a script, use the subcommand, which blocks until the review finishes:

```bash
claude ultrareview 1234 --json        # raw findings as JSON
claude ultrareview 1234 --post        # post the findings to the PR as you
```

`claude -p '/code-review ultra'` launches the review and exits without the findings, so use the subcommand in scripts. Pro and Max accounts get three free runs, once per account; after that a review typically costs $5 to $25 in usage credits, and the launch dialog shows the estimate first. It needs a claude.ai login and isn't available on Bedrock, Agent Platform or Foundry, or under Zero Data Retention.

**Code Review** (research preview, Team and Enterprise) is a GitHub integration that reviews pull requests on open, on every push, or on request (`@claude review`). The docs give an average of $15 to $25 per review, billed as usage credits outside the plan. Choose the trigger with that in mind: reviewing on every push multiplies the cost by the number of pushes. Tune what it reports with a `REVIEW.md` file in the repository, and set a monthly cap for the Claude Code Review service under claude.ai/admin-settings/usage.

Neither replaces your own gates. A reviewer agent is another opinion, not proof; [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers how to use one well.

### Check that it worked

Run `claude ultrareview --json` on a branch with a small, deliberate bug, such as an off-by-one in a loop bound. The command blocks, then prints a JSON payload; the bug should appear as a finding with a file and line. For Code Review, open a test PR and comment `@claude review`; a check run and review comments appear on the PR, and the admin page shows the review's cost.

## Choosing

- A developer wants to hand off a task and close the laptop: **cloud session**.
- The task needs internal services or must execute inside your network: **self-hosted environment**.
- Your product needs an agent with its own budget, memory and approval flow: **Managed Agents**.
- Finance or compliance wants Claude spend and logs in your cloud account: **cloud provider deployment**, accepting the features you lose.
- You want a second pass on every PR without tying up a laptop: **ultrareview or Code Review**, with a spend cap set first.

Whatever you pick, decide the spend ceiling and the isolation boundary before the first unattended run. [Containment and Security](/en/book3-architect/09-containment-and-security) and [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) cover both.

## Sources

- "Use Claude Code in the cloud", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/claude-code-on-the-web
- "Self-hosted environments" and "Self-hosted environments quickstart", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/self-hosted-environments , https://code.claude.com/docs/en/self-hosted-environments-quickstart
- "Enterprise deployment overview", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/third-party-integrations
- "Claude Code on Amazon Bedrock", "Claude Code on Google Cloud's Agent Platform", "Claude Code on Microsoft Foundry", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/amazon-bedrock , https://code.claude.com/docs/en/google-vertex-ai , https://code.claude.com/docs/en/microsoft-foundry
- "Find bugs with ultrareview" and "Code Review", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/ultrareview , https://code.claude.com/docs/en/code-review
- Claude Platform release notes, entries for 2026-08-07 (session budgets, advisor), 2026-08-19 (memory stores in self-hosted sandboxes) and 2026-09-10 (`auto` permission policy, `ant beta:sessions connect`), Anthropic. https://platform.claude.com/docs/en/release-notes/overview
- "Claude Managed Agents overview", "Session budgets", "Permission policies", "Using agent memory", "Multiagent orchestration", Claude Platform docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/managed-agents/overview , https://platform.claude.com/docs/en/managed-agents/budgets , https://platform.claude.com/docs/en/managed-agents/permission-policies , https://platform.claude.com/docs/en/managed-agents/memory , https://platform.claude.com/docs/en/managed-agents/multiagent-orchestration
- "Connect to a Managed Agents session from your terminal", Claude Platform docs, Anthropic, accessed 2026-10-04. https://platform.claude.com/docs/en/cli-sdks-libraries/cli/sessions-connect
- `claude --help`, `claude ultrareview --help`, `claude self-hosted-runner --help`, Claude Code 2.1.289, run 2026-10-04.
