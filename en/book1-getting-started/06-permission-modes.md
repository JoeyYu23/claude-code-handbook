# Chapter 6: Permission Modes

## The Question Behind the Question

Every time Claude Code asks "Can I do this?", there is a deeper question underneath: *How much do you trust me right now?*

That question does not have a single universal answer. Sometimes you want Claude to ask for permission on every action so you can learn what is happening. Other times you are deep in a flow state and you just want things to happen quickly. And sometimes you want to read a plan before anything gets changed at all.

Permission modes are how Claude Code handles all of these situations. They give you a volume knob — from "ask me about everything" to "just do it" — so you can match Claude's behavior to your current context.

---

## Why Permissions Exist At All

Before diving into the modes, let's establish the foundation: why does Claude Code ask for permission?

The short answer is that Claude Code can do real things to your real files. When it edits a file, that file changes. When it runs a command, that command actually runs. There is no undo button built into the universe.

This is very different from a chatbot that sends you suggestions and you copy them. Claude Code takes action. That power comes with responsibility — yours and Claude's.

The permission system is a safety layer. It makes sure you are in the loop before anything consequential happens. You can choose how tight that loop is. But it is always there if you want it.

---

## The Six Permission Modes

### 1. Default Mode: Ask As Needed

This is the standard mode. Claude Code will:
- Read files without asking (reading is generally safe)
- Ask before editing or creating files
- Ask before running shell commands

Think of this as having a contractor in your house who walks around freely but rings the doorbell before picking up a tool.

For most people most of the time, default mode is exactly right. It keeps you informed without being annoying.

---

### 2. Auto-Accept Edits: Trust and Go

In auto-accept mode (sometimes called `acceptEdits`), Claude automatically applies file edits without asking for each one. It still asks before running shell commands, but file changes happen immediately.

This is great when:
- You trust what Claude is doing
- You are working on a large refactor with many file changes
- You want to move quickly without clicking through individual approvals

**How to activate it:** Press `Shift+Tab` once while in default mode. You will see `⏵⏵ accept edits on` appear at the bottom of the terminal.

**The tradeoff:** You see changes happening in real time, but you are not reviewing each one before it lands. Keep an eye on what is happening, and know that `Ctrl+C` will stop Claude mid-task if something looks wrong.

---

### 3. Plan Mode: Eyes Before Hands

Plan mode is almost the opposite of auto-accept. In this mode, Claude Code can read and analyze as much as it wants, but it cannot modify any files or run any commands. All it can do is look and think — then give you a plan.

You review the plan. You ask questions, make adjustments, give feedback. When you are satisfied, you switch modes and tell Claude to proceed.

This is perfect for:
- Tasks that touch many files and you want to understand the full scope first
- Working on a codebase you do not know well yet
- Any time you want to see the map before starting the journey

**How to activate it:** Press `Shift+Tab` twice from default mode (once gets you to auto-accept, twice gets you to plan mode). You will see `⏸ plan mode on` at the bottom.

Or start a session directly in plan mode:

```bash
claude --permission-mode plan
```

**A practical tip:** When Claude presents its plan in plan mode, you can press `Ctrl+G` to open the plan in your text editor. Add comments, strike things out, ask follow-up questions, then return to Claude and tell it what you want changed.

---

### 4. Auto Mode: Autonomous Operation (Team and Enterprise)

Auto mode is available on Claude's Team and Enterprise plans. In this mode, Claude operates with significantly greater autonomy — it can read files, make edits, run commands, and handle multi-step tasks without stopping to ask for permission at each step.

What makes Auto mode safe despite its autonomy is Anthropic's built-in safety classifier. This classifier runs continuously in the background, screening Claude's planned actions for anything that would be harmful or irreversible. If the classifier flags an action, Claude pauses and asks — even in Auto mode.

Auto mode is designed for:
- Teams running longer, more complex tasks where constant interruptions would be counterproductive
- Workflows where Claude's judgment has been validated and trusted over time
- Scenarios where a human reviewer is watching the output rather than approving each step

**Important:** Auto mode is not the same as Bypass mode (described below). Auto mode still has safety rails — they are just more sophisticated and less intrusive than the default prompts.

---

### 5. DontAsk Mode: Allowlist-Only Operation

DontAsk mode flips the permission model on its head. Instead of asking about everything and letting you allow or deny, DontAsk mode starts from a position of denial: only tools that have been explicitly pre-authorized are permitted. Everything else is denied without prompting.

This is useful for:
- Locked-down environments where you want precise control over exactly what Claude can do
- Enterprise deployments where IT or security teams define a specific approved toolset
- Situations where you want Claude to be helpful in a narrowly scoped way without any risk of it going outside those boundaries

You configure the allowlist in your settings file or through your organization's Claude configuration:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "Bash(npm run build)",
      "Read(**/*.ts)",
      "Edit(**/*.ts)"
    ]
  }
}
```

With DontAsk mode active, Claude can only do those specific things. Anything not on the list is simply declined — no prompting, no asking, no workarounds.

---

### 6. Bypass Mode: No Guardrails

There is a sixth mode — `bypassPermissions` — that skips all permission prompts entirely. Claude does everything without asking anything.

This mode exists for automation scenarios: running Claude in scripts, CI/CD pipelines, or isolated containers where there is no human watching anyway.

**How to activate it:**

```bash
claude --dangerously-skip-permissions
```

**Important:** Only use bypass mode in environments where Claude cannot cause lasting damage — containers, throwaway VMs, sandboxed systems. Do not use it on your main development machine for interactive work. The permission system exists for a reason.

---

## Switching Between Modes Mid-Session

You do not have to commit to a mode for an entire session. You can switch as your needs change.

The quickest way is `Shift+Tab`, which cycles through the main interactive modes in order:
1. Default mode (normal prompts)
2. Auto-accept mode (`⏵⏵ accept edits on`)
3. Plan mode (`⏸ plan mode on`)
4. Back to default

So if you are in the middle of a session and decide you want to just let Claude rip through 20 file changes, hit `Shift+Tab` once to enable auto-accept. When it is done, hit it again to go back to normal.

For Auto mode, DontAsk mode, and Bypass mode, you configure them at startup or through your settings — they are not part of the `Shift+Tab` cycle.

---

## The Allowlist and Denylist

Beyond the broad modes, Claude Code lets you specify exactly which actions are always allowed or always denied, regardless of mode.

Think of it like a set of standing orders:

- **Allowlist (allow rules):** "You never need to ask me about X. Just do it."
- **Denylist (deny rules):** "You are never allowed to do Y, no matter what."

For example, you might say:
- Always allow running `npm run test` — I always want tests to run freely
- Always deny reading my `.env` file — that contains secrets, never touch it
- Always deny running `git push` — I will push manually, thank you

You manage these rules by running `/permissions` inside a Claude Code session, which opens a settings interface showing all current rules and where they come from.

You can also write them directly in a settings file:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "Bash(npm run build)"
    ],
    "deny": [
      "Read(./.env)",
      "Bash(git push *)"
    ]
  }
}
```

Rules are checked in order: **deny rules always win**, then ask rules, then allow rules. If something appears in both allow and deny, the deny wins.

---

## Real-World Scenarios

**Scenario: You are learning**

Stay in default mode. Read every permission prompt. It is a free education. When Claude asks "can I edit `utils.js`?" before making a change, you see exactly which files are being modified and why. This is slow, but it builds intuition fast.

**Scenario: You are in a refactor sprint**

You have a clear goal and you trust Claude's direction. Switch to auto-accept mode. Let the changes flow. Keep an eye on the output. Have your git history ready in case you need to roll back.

**Scenario: You inherited a messy codebase**

Start in plan mode. Ask Claude to analyze the architecture and tell you what it would do to add your new feature. Read the plan carefully before a single byte changes. This is caution as a superpower.

**Scenario: You are on a team running longer tasks**

With a Team or Enterprise plan, Auto mode lets Claude handle complex multi-step tasks while the safety classifier watches for anything problematic. Good for tasks that would be tedious to supervise step by step.

**Scenario: You need a precisely constrained environment**

Use DontAsk mode with a carefully defined allowlist. Claude can only do what is on the list — nothing more, nothing less. Ideal for shared environments or regulated workplaces.

**Scenario: You are running automated tests in CI**

Use bypass mode in your pipeline script. Since the environment is isolated and there is no sensitive data at risk, this is safe and appropriate.

---

## The Philosophy in One Sentence

The permission system is not about distrusting Claude — it is about keeping you in the driver's seat. Claude is incredibly capable, and that capability should stay under your control.

Choose the mode that matches your confidence and context. Start conservative if you are unsure. Loosen up as you build trust. And always remember: `Ctrl+C` is right there if you want to stop.

---

**Next up:** [Chapter 7 — Reading and Understanding Code](./07-reading-code.md) — Using Claude to explore and make sense of any codebase.
