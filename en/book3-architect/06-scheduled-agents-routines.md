# Scheduled Agents and Routines

> Verified on 2026-10-04 with Claude Code 2.1.289.

A scheduled agent is a prompt that runs without you: a nightly triage of new issues, a weekly dependency audit, a morning summary of what merged yesterday. Setting one up takes five minutes. Keeping it trustworthy for months takes more thought, and three questions do most of the work:

1. **Where does it run?** In the cloud, in a desktop app, inside a session, or under your operating system's scheduler.
2. **What happens when it can't run on time?** The laptop was asleep, the network was down, or the previous run was still going.
3. **How do you know it did the right thing?** "The job ran" and "the job did its work" are different claims.

This chapter covers the four ways to schedule Claude Code work and then the parts that are the same everywhere: catching up after missed runs and checking the results.

## Choose where the schedule lives

| | Cloud routine | Desktop scheduled task | `/loop` in a session | Your own scheduler (cron, launchd, systemd) |
|---|---|---|---|---|
| Runs on | Anthropic-managed cloud (or your org's self-hosted environment) | Your machine | Your machine | Your machine or a server |
| Needs the machine on | No | Yes, and the desktop app open | Yes, and the session alive | Yes |
| Local files and tools | No, a fresh clone each run | Yes | Yes | Yes |
| Minimum interval | 1 hour | 1 minute | 1 minute | Whatever the scheduler allows |
| If a run is missed | Not normally an issue, since it doesn't depend on your machine | One catch-up run for the most recent missed time | No catch-up: fires once when the session is next idle | Depends on the scheduler (see below) |
| Permission prompts | None, runs autonomously | Set per task | Inherited from the session | Whatever flags you pass to `claude -p` |

The official docs' rule of thumb: use cloud routines for work that should run reliably without your machine, desktop tasks when the work needs local files and tools, and `/loop` for quick polling during a session. Add your own scheduler when you need full control, a server instead of a laptop, or authentication that a claude.ai login doesn't cover. GitHub Actions' `schedule` trigger is a fifth option for repository work. It runs in UTC by default, has a 5-minute minimum interval, can be delayed or even dropped under heavy load, and is turned off automatically in public repositories after 60 days without activity.

## Cloud routines

A **routine** is a saved Claude Code configuration (a prompt, one or more repositories, an environment, and a set of connectors) that runs as a full cloud session. A routine can have three kinds of triggers, and you can combine them:

- **Schedule**: hourly, daily, weekdays, weekly, or a single run at a future time.
- **API**: an HTTP POST with a per-routine bearer token, for alerting systems and deploy pipelines.
- **GitHub**: repository events such as a pull request being opened or a release.

Routines are in research preview and available on Pro, Max, Team, and Enterprise plans. Create them at claude.ai/code/routines, from the Routines page in the desktop app's Code tab, or from the CLI:

```text
/schedule weekdays at 9:07, list pull requests merged since the previous run, group them by area, and open an issue titled "Merged yesterday" with the summary
```

Claude asks follow-up questions about the repository and schedule before saving. `/schedule list`, `/schedule update`, and `/schedule run` manage routines from the CLI. For a schedule the presets don't offer, pick the closest preset and then set a cron expression with `/schedule update`. Anything more frequent than once an hour is rejected. `/schedule` needs a claude.ai subscription login. With an API key or a cloud provider login, the command is hidden.

Things to design for:

- **No permission prompts.** A routine runs shell commands, repository skills, and the connectors you included without stopping for approval. Its reach is whatever you give it: the repositories, the environment's network access, and the connectors. All of your connectors are included by default, so remove the ones the routine doesn't need.
- **Pushes go to `claude/` branches** unless your prompt says otherwise. Use GitHub branch protection or rulesets to control which branches a run can push to.
- **API payloads are untrusted.** Text sent with an API trigger arrives wrapped in a block that labels it as untrusted data. The routine acts on it only if its saved prompt explicitly refers to that block. This means a leaked token can't take over the routine's instructions.
- **Start a few minutes past the hour.** Runs scheduled exactly on the hour can start several minutes late, so the docs suggest a time like 9:07.
- **A lost GitHub connection pauses runs.** The routine skips runs for up to 72 hours and resumes when you reconnect. After 72 hours it turns itself off.
- **Limits.** Scheduled runs are capped at 100 per hour per account, and **Run now** plus API fires at 30 per hour per routine. Runs draw on your subscription usage like any other session.

### Check that it worked

Click **Run now** on the routine, open the run, and read the transcript. A green status in the run list only means the session started and exited without an infrastructure error. It does **not** mean the task succeeded. Blocked network requests, missing connector tools, and task failures all show up in the transcript, not in the status. From the CLI, `/schedule why did my nightly review do nothing this morning?` reads the run log and explains what happened.

## Desktop scheduled tasks

In the desktop app's Code tab, **Routines → New routine → Local** creates a task that runs on your own machine, with your files and tools. You give it a name, instructions, a permission mode, a model, a working folder, and a schedule (manual, hourly, daily, weekdays, or weekly). For other intervals, ask Claude in any desktop session, for example "schedule a task to run all the tests every 6 hours".

The rules that matter for reliability:

- **The app must be running and the computer awake.** Desktop checks the schedule every minute while it is open. If the computer sleeps through a scheduled time, the run is skipped. **Settings → This computer → System → Keep computer awake** prevents idle sleep, but closing the lid still sleeps the machine.
- **Missed runs: one catch-up, the most recent one.** When the app starts or the computer wakes, Desktop looks back over seven days. If a task missed runs, it starts exactly one catch-up run for the most recently missed time and discards the older ones. A daily task that missed six days runs once.
- **Write the prompt for late runs.** A 9am task might run at 11pm. Put the guardrail in the prompt itself, for example: "Only review today's commits. If it's after 5pm, skip the review and post a summary of what was missed."
- **Pre-approve tools.** A task in manual mode stalls on the first tool it isn't allowed to use and waits for you. Click **Run now** once after creating it, answer the prompts with "always allow", and later runs will approve the same tools without asking. You can review and revoke these approvals on the task's detail page.
- **Isolate the working tree.** By default a task runs against whatever state your folder is in, uncommitted changes included. Turn on the worktree toggle to give each run its own git worktree.

The task's prompt is stored at `~/.claude/scheduled-tasks/<task-name>/SKILL.md`, with `name` and `description` in the frontmatter and the prompt as the body. The schedule, folder, model, and enabled state are **not** in that file. Change those in the Edit form or by asking Claude. (The first edition showed a `schedule:` field in this file. That was wrong.)

### Check that it worked

Open the task's detail page and look at its history. Each past run is listed, including skipped runs. Hover over a skipped entry to see why: the computer was asleep, the previous run was still going, or other tasks were already running.

## `/loop` and session-scoped tasks

`/loop` reruns a prompt inside the current session, which makes it good for babysitting work that lasts hours, not weeks:

```text
/loop 15m check whether CI passed on this branch and address any new review comments
```

Leave out the interval (`/loop check the deploy`) and Claude picks a delay between one minute and one hour after each iteration. Leave out the prompt too (`/loop`) and it runs a built-in maintenance prompt, or your own `.claude/loop.md` if one exists.

You can also schedule one-off reminders in plain language ("in 45 minutes, check whether the integration tests passed"). Claude uses the `CronCreate`, `CronList`, and `CronDelete` tools behind the scenes, and a session can hold up to 50 tasks.

Know the limits before you rely on it:

- Tasks fire only while the session is running and idle, between turns.
- Recurring tasks have **jitter**: they can fire up to 30 minutes after the scheduled time, or up to half the interval for tasks that run more often than hourly. If timing matters, schedule off the hour and half-hour.
- Recurring tasks **expire after seven days**. They fire one last time and then delete themselves.
- There is **no catch-up**. If several fire times pass while Claude is busy, the task fires once.
- `--resume` and `--continue` restore cron tasks that haven't expired, but not a self-paced `/loop`.
- Moving the session to the background (agent view) carries its `/loop` tasks with it, so they keep running without a terminal, as long as the machine is on.

`CLAUDE_CODE_DISABLE_CRON=1` turns the scheduler off entirely.

### Check that it worked

Ask "what scheduled tasks do I have?" Claude lists each task's ID, schedule, and prompt. After the first fire, the result appears in the conversation.

## Your own scheduler: cron, launchd, systemd

When none of the built-in options fit, run `claude -p` from your operating system's scheduler. This is the most work, and it gives you the most control. Before writing the job, know how each scheduler treats missed runs:

| Scheduler | What happens to runs missed while the machine was asleep or off |
|---|---|
| cron | Skipped. |
| launchd `StartCalendarInterval` (macOS) | Run when the machine wakes. Several missed intervals are merged into one run. |
| launchd `StartInterval` (macOS) | Missed while asleep. |
| systemd timer with `Persistent=true` (Linux) | Run when the timer next activates, including after the machine was powered off. Applies only to `OnCalendar=` timers. |

None of them knows whether the *network* was up, or whether the last run actually succeeded. So don't let the scheduler decide when the job is due. Let a wrapper script decide, and have the scheduler call it often (for example, hourly). The script runs the agent only when the last *successful* run is older than the job's interval. That one design handles sleep, power-off, lost network, and failed runs in the same way.

### A wrapper that catches up

```bash
#!/bin/bash
# run-agent.sh: run one scheduled agent job, catching up after missed or failed runs.
set -u
JOB="nightly-triage"
REPO="$HOME/src/my-app"
PROMPT_FILE="$HOME/.config/agent-jobs/$JOB.md"
STATE="$HOME/.local/state/agent-jobs/$JOB"
INTERVAL=$((24 * 60 * 60))   # the job is due once per day
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:/usr/bin:/bin"
mkdir -p "$STATE"
log() { echo "$(date '+%F %T') $*" >>"$STATE/log"; }

# 1. One run at a time (mkdir is atomic and works on macOS and Linux).
mkdir "$STATE/lock" 2>/dev/null || { log "previous run still going"; exit 0; }
trap 'rmdir "$STATE/lock"' EXIT

# 2. Due? Compare against the last successful run, not the last attempt.
now=$(date +%s)
last=$(cat "$STATE/last-success" 2>/dev/null || echo 0)
[ $((now - last)) -ge "$INTERVAL" ] || exit 0
since=$(cat "$STATE/last-success-iso" 2>/dev/null || echo "7 days ago")

# 3. Online? If not, leave quietly. The next trigger tries again.
curl -s -o /dev/null --max-time 10 https://api.anthropic.com || { log "offline"; exit 0; }

# 4. Run the agent with hard limits and machine-readable output.
cd "$REPO" && git fetch --quiet origin
export CLAUDE_CODE_OAUTH_TOKEN="$(cat "$HOME/.config/agent-jobs/token")"
export CLAUDE_CODE_RETRY_WATCHDOG=1
claude -p "$(cat "$PROMPT_FILE") Cover everything since: $since." \
  --permission-mode dontAsk \
  --allowedTools "Read,Grep,Glob,Bash(git log *),Bash(gh issue list *),Bash(gh issue create *)" \
  --max-turns 40 --max-budget-usd 3 \
  --output-format json >"$STATE/last-run.json" 2>>"$STATE/log"
code=$?

# 5. Record success only if the run really succeeded.
if [ "$code" -eq 0 ] && [ "$(jq -r '.is_error' "$STATE/last-run.json")" = "false" ]; then
  echo "$now" >"$STATE/last-success"
  date -u +%Y-%m-%dT%H:%M:%SZ >"$STATE/last-success-iso"
  log "ok, cost \$$(jq -r '.total_cost_usd' "$STATE/last-run.json")"
else
  log "failed (exit $code): $(jq -r '.result // "no result"' "$STATE/last-run.json" 2>/dev/null)"
fi
```

Why each piece is there:

- **The prompt covers "everything since the last success"**, not "today". A run after three days offline then covers three days in one pass. This matches the behavior of Desktop's catch-up run and launchd's merged wake-up run: one run covers the gap, instead of three runs racing each other.
- **`--permission-mode dontAsk` plus `--allowedTools`** means anything you didn't list is denied instead of waiting for an approval that will never come. The trailing ` *` in `Bash(git log *)` is prefix matching, and the space before `*` matters. Make the allow list as narrow as the job allows.
- **`--max-turns` and `--max-budget-usd`** bound a run that goes wrong. Both apply only in `-p` mode.
- **Check both the exit code and `is_error`.** The JSON result's `subtype` field is not enough. In a test for this chapter, a run that failed on an API error ("Credit balance is too low") exited with code 1 and reported `"subtype": "success"` together with `"is_error": true`.
- **`jq`** reads the JSON result. Install it if your system lacks it.
- **`CLAUDE_CODE_RETRY_WATCHDOG=1`** makes Claude Code keep retrying capacity errors (429 and 529) with backoff instead of giving up after the default retry count, which suits unattended jobs.
- **Authentication.** A scheduler doesn't have your interactive login. `claude setup-token` creates a one-year OAuth token for a subscription account. Store it in a file only you can read (`chmod 600`) and export it as `CLAUDE_CODE_OAUTH_TOKEN`. An `ANTHROPIC_API_KEY` in the environment takes precedence over that token. If you add `--bare` for reproducible runs, it skips `CLAUDE.md` and hooks and does not read `CLAUDE_CODE_OAUTH_TOKEN`, so it needs an API key or `apiKeyHelper`.

::: warning
`claude -p` skips the workspace trust dialog, and without `--bare` it runs the repository's project hooks and connects the servers in its `.mcp.json`. Only schedule jobs in repositories you trust. [Containment and Security](/en/book3-architect/09-containment-and-security) covers isolation for unattended agents.
:::

### Wire it to the scheduler

**macOS (launchd).** Save as `~/Library/LaunchAgents/com.example.agent-jobs.plist`, with the full path to your script:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.example.agent-jobs</string>
  <key>ProgramArguments</key>
  <array><string>/Users/you/bin/run-agent.sh</string></array>
  <key>StartCalendarInterval</key>
  <dict><key>Minute</key><integer>7</integer></dict>
  <key>StandardOutPath</key><string>/tmp/agent-jobs.out</string>
  <key>StandardErrorPath</key><string>/tmp/agent-jobs.err</string>
</dict>
</plist>
```

`StartCalendarInterval` with only `Minute` fires at 7 minutes past every hour, and on wake if the machine slept through one. Load it and fire it once by hand:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.example.agent-jobs.plist
launchctl kickstart -k gui/$(id -u)/com.example.agent-jobs
```

**Linux (systemd user timer).** The service runs the script, and the timer calls it hourly and catches up after power-off:

```ini
# ~/.config/systemd/user/agent-jobs.service
[Service]
Type=oneshot
ExecStart=%h/bin/run-agent.sh

# ~/.config/systemd/user/agent-jobs.timer
[Timer]
OnCalendar=hourly
Persistent=true
[Install]
WantedBy=timers.target
```

Enable it with `systemctl --user enable --now agent-jobs.timer`.

**cron** works too (`7 * * * * /home/you/bin/run-agent.sh`). Because the wrapper decides when the job is due, cron's habit of skipping missed runs costs you at most an hour of delay.

### Check that it worked

- `launchctl print gui/$(id -u)/com.example.agent-jobs` (macOS) or `systemctl --user list-timers` (Linux) shows the job and its next run.
- After a manual kick, `~/.local/state/agent-jobs/nightly-triage/log` has an `ok` line with a cost, and `last-success` contains a fresh timestamp.
- Test catch-up deliberately: disconnect the network, trigger the job (the log should say `offline` and `last-success` should not change), reconnect, and trigger again (it should run and cover the whole gap).

## Catching up after sleep or lost network

Whatever you schedule with, the same principles keep jobs correct when runs are missed:

1. **Make the job idempotent.** Running it twice should not open two issues or post two summaries. Have the prompt check for existing output first ("if an issue titled 'Merged yesterday' already exists for this date, update it").
2. **Track the last success, not the last attempt.** Record a timestamp only after a verified success, and drive the next run's scope from it.
3. **One run covers the gap.** After a long outage, run once over the whole missed window instead of replaying every missed slot.
4. **Prevent overlap.** A lock, or the scheduler's own rule. Desktop, for example, skips a run if the previous one is still going.
5. **Put time guardrails in the prompt.** A late run should know it is late and adjust what it does.
6. **Retry cheap failures, give up on expensive ones.** Network blips and capacity errors are worth retrying. A run that hit its turn or budget cap needs a human, not another attempt.

Background sessions in agent view also survive sleep: their processes resume when the machine wakes. A session that was in the middle of a response when the machine slept can come back unresponsive. Opening it makes the supervisor restart it, and it continues from where it stopped. Shutting the machine down stops them.

## Know that it did the right thing

A scheduled agent that fails silently is worse than none, because you stop checking by hand. Build three signals:

- **A staleness alarm that lives outside the job.** If the job never runs, it can't report its own failure. Something else must notice. A check in your shell startup file is enough for a personal setup:

  ```bash
  # in ~/.zshrc or ~/.bashrc: warn when the job has not succeeded for two days
  f=~/.local/state/agent-jobs/nightly-triage/last-success
  [ -f "$f" ] && [ $(( $(date +%s) - $(cat "$f") )) -gt 172800 ] && echo "nightly-triage: no successful run in 2 days"
  ```

- **A visible result.** Every run should leave something you will see anyway: an issue, a pull request, a message in a channel, an entry in a log you actually read. For routines, remember that the run status shows only infrastructure health. You must read the transcript or the output.
- **A periodic review of the output.** Once a week, read a few runs end to end. Scheduled agents drift as repositories change. A prompt written for last month's code can quietly start doing the wrong thing. [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents) covers putting an automated check between the agent and anything it publishes.

Spend deserves its own alarm. A job that loops for 40 turns every hour costs real money. `total_cost_usd` in the JSON output is a client-side estimate. Log it per run and compare it against your bill, as described in [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured).
<!-- AUTHOR-DATA: typical per-run cost and monthly total of one real scheduled job, to make the cost point concrete -->

For running agents on your own infrastructure, see [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents). For headless runs in CI, see [Automated Workflows](/en/book2-advanced/10-automated-workflows).

## Sources

- "Automate work with routines", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/routines
- "Schedule recurring tasks in Claude Code Desktop", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/desktop-scheduled-tasks
- "Run prompts on a schedule" (`/loop`, cron tools, jitter, expiry, limitations), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/scheduled-tasks
- "Run Claude Code programmatically" (headless mode, permission modes, bare mode, JSON output), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/headless
- "CLI reference" (`--max-turns`, `--max-budget-usd`), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/cli-reference
- "Authentication" (`claude setup-token`, `CLAUDE_CODE_OAUTH_TOKEN`, credential precedence), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/authentication
- "Environment variables" (`CLAUDE_CODE_RETRY_WATCHDOG`, `CLAUDE_CODE_DISABLE_CRON`), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/env-vars
- "Manage multiple agents with agent view" (sleep and wake behavior), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- "Agent SDK reference: TypeScript" (result message fields), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-sdk/typescript
- `launchd.plist(5)` manual page, macOS (Darwin 25), `StartCalendarInterval` and `StartInterval`, read 2026-10-04.
- `systemd.timer(5)` manual page, `Persistent=`, man7.org, accessed 2026-10-04. https://man7.org/linux/man-pages/man5/systemd.timer.5.html
- "Events that trigger workflows" (`schedule`), GitHub Docs, accessed 2026-10-04. https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
