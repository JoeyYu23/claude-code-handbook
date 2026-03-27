# Chapter 22: Voice, Fast Mode & Effort Levels

Claude Code offers several ways to adjust how you interact with and how Claude reasons about problems. This chapter covers three complementary features: voice dictation for hands-free input, fast mode for reduced latency, and effort levels for controlling reasoning depth and output quality.

---

## Voice Dictation

Voice dictation transforms Claude Code into a tool you can use without typing. Enable it once, then hold Space to dictate messages or commands directly to Claude.

### Enabling Voice Dictation

```text
/voice
```

This opens the voice configuration screen where you can:
- Enable or disable voice input
- Select input language (supports 50+ languages and dialects)
- Adjust microphone sensitivity
- Set voice feedback (should Claude respond with audio)
- Test the microphone

Once enabled, `/voice` again to adjust settings without re-enabling.

**First-time setup takes 30 seconds:** Select language, test your microphone, confirm audio permissions, and you are ready.

### Push-to-Talk with Space Bar

Hold Space to record. Release when done. Claude processes the audio and displays a transcript before sending to the model.

**Workflow:**

1. Hold Space
2. Dictate: "Add error handling to the auth middleware"
3. Release Space
4. Claude displays: `Add error handling to the auth middleware`
5. Press Enter to send, or edit the transcript if needed

**Multiple utterances in one recording:**

You can pause mid-recording and resume without releasing Space. Useful for longer instructions:

```
[Hold Space]
"Refactor the database query"
[Pause 2 seconds while thinking]
"Add caching for frequently accessed records"
[Release Space]
```

Claude concatenates these into a single message.

### Language Configuration

Voice supports multiple languages and automatically detects the most likely language based on your system settings:

```text
/voice [language]
```

Examples:
```text
/voice English (US)
/voice Mandarin Chinese
/voice Spanish (Mexico)
/voice French (Canada)
```

Language detection is not perfect, especially for code mixed with natural language. If transcription is inaccurate:

1. Switch to the most commonly used language for your commands
2. Speak more clearly between code terms
3. Use `/voice` to adjust sensitivity

**Tip:** For code-heavy instructions, consider typing code and using voice for English descriptions. For example, dictate "Create a function that does X" but type the function signature to avoid transcription errors on syntax.

### When Voice Works Best

**Ideal scenarios:**

- Writing commit messages: "Fixed the authentication timeout issue"
- High-level instructions: "Refactor this to be more testable"
- Code review feedback: "Add validation before saving to the database"
- Quick corrections: "That should be async instead"

**Avoid voice for:**

- Complex regex patterns
- Deeply nested code structures
- Precise JSON configurations
- Any instruction where one character error changes the meaning

---

## Fast Mode

Fast Mode reduces Claude's response latency by skipping some reasoning steps. The model is the same, but Claude operates with tighter constraints — prioritizing speed over exhaustive deliberation.

### Toggle Fast Mode

```text
/fast on
/fast off
```

Without an argument, `/fast` shows the current status.

**Fast mode affects:**
- Response generation (streaming starts faster)
- File analysis (skips some optimization passes)
- Reasoning chains (shorter internal deliberation)

It does NOT affect:
- Model capability (still uses the selected model)
- Token usage (roughly the same)
- Output format (still follows the same conventions)

### When to Use Fast Mode

**Use fast mode when:**

- You are iterating rapidly and need quick feedback (designing a UI, exploring approaches)
- You are performing routine tasks (refactoring variable names, adding comments)
- You are at your computer and want immediate responses (speed is the primary goal)
- You are on a slow network and latency matters more than thoroughness

**Do not use fast mode when:**

- You are making architecture decisions (needs full reasoning)
- You are debugging complex issues (needs careful analysis)
- You are writing security-critical code (needs thorough review)
- You have time and want the highest quality output

### Fast Mode in Scripts

Configure fast mode in `.claude/settings.json` for consistent behavior:

```json
{
  "session": {
    "fast_mode": true
  }
}
```

Or enable it per-agent:

```json
{
  "agents": [
    {
      "name": "routine-fixer",
      "fast": true,
      "instructions": "Apply formatting and linting fixes quickly"
    }
  ]
}
```

---

## Effort Levels

Effort controls how much computational resources Claude applies to a task, directly affecting reasoning depth, deliberation time, and output quality. This is separate from model selection — you can use Sonnet with high effort or Opus with low effort.

### Setting Effort

```text
/effort low
/effort medium
/effort high
/effort max
/effort auto
```

The default is `auto`, which adjusts based on task complexity. Higher effort uses more tokens and takes more time but produces more careful, thorough output.

**Effort levels explained:**

| Level | Thinking Time | Use Case | Cost |
|---|---|---|---|
| `low` | Minimal | Simple tasks, quick answers | Lowest |
| `medium` | Standard | Typical development tasks | Standard |
| `high` | Extended | Complex debugging, architecture | High |
| `max` | Maximum | Security reviews, difficult designs | Highest |
| `auto` | Adaptive | Default; adjusts per task | Variable |

### Using Effort with the Keyboard

On supported platforms, use `Option+T` (macOS) or `Alt+T` (Windows/Linux) to toggle through effort levels without typing. This is faster than `/effort` for frequent adjustments.

**Keyboard cycling:**

```
Option+T: auto → low → medium → high → max → auto
```

Your current level displays in the status bar.

### Thinking Tokens and Output Quality

Effort directly affects **thinking tokens** — tokens Claude allocates to internal reasoning. More thinking tokens mean:

- Better problem analysis
- More thorough consideration of edge cases
- More careful code review
- Better design decisions

**Real-world example:**

```
Refactor this 500-line parser into smaller functions.

low effort:     200 tokens output, no thinking
medium effort:  400 tokens output + 500 thinking tokens
high effort:    500 tokens output + 2000 thinking tokens
max effort:     600 tokens output + 5000+ thinking tokens
```

Higher effort produces more detailed refactoring suggestions, better test cases, and more thorough documentation.

### Effort and Model Selection

Effort and model selection are independent:

- **Sonnet with max effort:** Fast model, thorough reasoning. Good for routine tasks that need care.
- **Opus with low effort:** Slow model, minimal reasoning. Overkill for simple tasks.
- **Sonnet with auto effort:** Balanced — great default for most work.
- **Opus with max effort:** Maximum power. Reserve for architecture decisions or security reviews.

**Cost-conscious pattern:**

Use Sonnet (fast, cheap) with `auto` effort for 90% of work. Switch to Opus with `high` effort only for architecture decisions.

```text
/model sonnet
/effort auto
# Normal development

/model opus
/effort max
# Before shipping critical code
```

### Effort in Agent Configuration

Set effort per-agent to encode task complexity:

```json
{
  "agents": [
    {
      "name": "code-reviewer",
      "model": "opus",
      "effort": "high",
      "instructions": "Review code for correctness and performance"
    },
    {
      "name": "quick-fixer",
      "model": "sonnet",
      "effort": "low",
      "instructions": "Apply linting and formatting fixes quickly"
    }
  ]
}
```

The code reviewer gets maximum attention per task. The quick fixer completes routine work fast.

### Adaptive Thinking

`auto` effort is the recommended default. Claude adapts effort based on detected task complexity:

**Claude automatically increases effort when it detects:**
- Security-related code
- Complex algorithmic problems
- Architectural decisions
- Debugging unclear issues
- Writing tests for edge cases

**Claude automatically decreases effort for:**
- Formatting changes
- Variable renames
- Comment additions
- Routine file creation
- Simple copy-editing

You can always override adaptive behavior with explicit effort levels, but `auto` handles most cases well.

### Effort and Latency

Higher effort increases time-to-first-token (TTFT) and total response time:

| Effort | TTFT | Response Time |
|---|---|---|
| low | <1s | 3-5s |
| medium | 1-2s | 5-10s |
| high | 2-4s | 10-20s |
| max | 4-6s | 20-40s |

For interactive work, `low` and `medium` feel responsive. For non-interactive tasks (commit, review, overnight runs), `high` or `max` provides better quality.

---

## Model Selection Revisited

Effort levels change how to think about model selection:

**Traditional thinking (without effort levels):**
- Simple task → use Haiku
- Complex task → use Opus
- Medium task → use Sonnet

**New thinking (with effort levels):**
- Simple task + low effort → Haiku
- Medium task + auto effort → Sonnet
- Complex task + high effort → Sonnet or Opus
- Critical task + max effort → Opus
- Routine task with high effort → Sonnet (better value than Opus)

**Cost-optimal patterns:**

```text
# Pattern 1: Use Sonnet with adaptive effort
/model sonnet
/effort auto
# Works for 95% of tasks

# Pattern 2: Sonnet by default, Opus for critical decisions
/model sonnet
/effort auto
# Routine work

/model opus
/effort high
# Major refactoring, architecture

# Pattern 3: Haiku for simple, fast tasks
/model haiku
/effort low
# Quick answers, linting fixes, simple grepping
```

**When to use each model:**

- **Haiku:** Quick answers, simple utility scripts, first-pass exploration
- **Sonnet:** General development, default choice for most work
- **Opus:** Architecture decisions, complex debugging, security reviews

**When effort matters more than model:**

```text
Sonnet at high effort often outperforms Opus at low effort on complex tasks.
Use /model sonnet and /effort high before reaching for Opus.
```

---

## Quick Reference

| Feature | Command | Use Case |
|---|---|---|
| Enable voice | `/voice` | Hands-free input |
| Push-to-talk | Hold Space | Record dictation |
| Set language | `/voice [lang]` | Multi-language support |
| Toggle fast | `/fast on/off` | Reduce latency |
| Set effort | `/effort [level]` | Control reasoning depth |
| Cycle effort | `Option+T` / `Alt+T` | Quick adjustment |
| Effort + model | `/model sonnet`, `/effort high` | Cost-optimal configuration |

---

## Practical Workflow

**Typical session:**

```
1. Start with /model sonnet and /effort auto
2. For exploration and iteration, use /fast on
3. For quality-critical work, use /effort high or max
4. Use voice for high-level descriptions; type for code
5. Use Option+T to toggle effort if working interactively
```

**Example task: Add feature request validation API**

```text
/fast on
# Get the basic structure quickly

/fast off
/effort high
# Write validation logic carefully

/effort auto
# Routine endpoint setup

/voice
# Dictate: "Add integration tests for the new endpoint"
```

---

## References

- [Chapter 1: Built-in Slash Commands](./01-slash-commands.md) — Reference for `/model` and `/effort`
- [Chapter 16: Token Optimization](./16-token-optimization.md) — Understanding token costs
---

*For cost and pricing data, see Book 3: [Cost Reality](/en/book3-architect/09-cost-reality).*
