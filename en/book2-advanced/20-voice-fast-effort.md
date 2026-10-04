# Voice, Fast Mode and Effort

> Verified on 2026-10-04 with Claude Code 2.1.289.

Three settings shape how a session feels, and they are independent of each other:

- **Effort** sets how much the model thinks before it answers.
- **Fast mode** makes supported Opus models respond faster, at a higher price per token.
- **Voice** changes how you give input.

Effort is the one that matters for cost and quality, so most of this chapter is about it, including how to change it in the middle of a session without paying for a cache rebuild.

## Effort

Effort controls adaptive reasoning: on each step the model decides whether and how much to think, guided by the level you set. Lower effort is faster and cheaper on simple work. Higher effort buys deeper reasoning on hard problems. It is separate from model choice, and the same level name is calibrated per model, so `high` on one model is not the same amount of thinking as `high` on another.

### Levels and defaults

As of Claude Code 2.1.289 the levels depend on the model:

| Model | Levels |
| :- | :- |
| Fable 5.1, Fable 5 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 5.5, Sonnet 5.5, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 4.6, Sonnet 4.6 | `low`, `medium`, `high`, `max` |

If you ask for a level the model lacks, Claude Code uses the highest supported level at or below it (`xhigh` runs as `high` on Opus 4.6). The default is `high` on every model that supports effort, except Opus 5.5 and Sonnet 5.5 (`medium`) and Opus 4.7 (`xhigh`).

The docs give this guidance for choosing:

| Level | Use it for |
| :- | :- |
| `low` | Quick exchanges where you review each result: brainstorming, a first sketch, a rename |
| `medium` | Day-to-day engineering with a clear scope, such as implementing a feature |
| `high` | Work where verification matters or edge cases are likely, such as a bug in existing code |
| `xhigh` | Deeper reasoning at higher token spend |
| `max` | Hard problems you want worked through without you, such as hunting vulnerabilities. May show diminishing returns and overthink, so test before adopting it widely |

Anthropic's tests on Opus 5.5 and Fable 5.1 found that at a higher level Claude tests more edge cases, verifies more of its own work, and makes more decisions on its own. At a lower level it returns a starting point sooner, which suits work where you steer step by step. When you move from Opus 5 to Opus 5.5, the docs advise starting at `medium` instead of carrying your old level over; they say Opus 5.5 at `medium` matches or beats Opus 5 at `high` on Anthropic's coding and knowledge-work evaluations. That is the vendor's claim, so run your own tasks before standardizing.

### Setting it

| How | Scope |
| :- | :- |
| `/effort` (slider), `/effort high`, `/effort auto` | Saved as your default for that model, unless you press `s` in the slider (this session only, v2.1.257+) |
| `claude --effort high` | This session |
| `CLAUDE_CODE_EFFORT_LEVEL` environment variable | Wins over everything else |
| `modelSettings` or `effortLevel` in settings | Saved default; `max` is not accepted here |
| `effort:` in skill or subagent frontmatter | Overrides the session level while that skill or subagent runs |
| Remote Control device (phone, browser) | This session only (v2.1.234+) |

`max` is session-only unless you set it through the environment variable. `/effort status` prints the current level; the session header shows it next to the model name. Administrators can cap levels with the `maxEffortLevel` managed setting.

Per-agent effort is a frontmatter field, not a JSON block. For example, a review subagent that should think harder than your session:

```markdown
---
name: security-reviewer
description: Reviews diffs for security issues
effort: high
---
Review the diff for injection, auth and secrets handling. Report findings with file and line.
```

See [Subagents](/en/book2-advanced/05-subagents) for the other fields and [Custom Skills](/en/book2-advanced/02-custom-skills) for skills.

Two related controls, easy to confuse with effort:

- **`ultrathink`.** Put the word anywhere in a prompt to request deeper reasoning on that one turn. It adds an in-context instruction and leaves the effort level sent to the API unchanged. Phrases like "think hard" are plain text and do nothing special.
- **Ultracode.** A Claude Code setting, not an effort level. With it on, Claude plans a dynamic workflow for each substantive task, at whatever effort the session uses. Toggle with `/effort ultracode on|off` or press `Tab` in the `/effort` slider (v2.1.284+).

Thinking itself is separate again: `Option+T` (macOS) or `Alt+T` toggles extended thinking, and has no effect on Opus 5.5, Sonnet 5.5 and the Fable models, which always think. On those models, effort is the control.

### Changing effort mid-session without a cache reset

Prompt caching keeps the long, unchanging front of your conversation cheap to re-read. Anything that changes that front forces the next request to re-read the whole history uncached, which is slower and costlier. See [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) for the full picture.

How effort interacts with the cache depends on the model:

- **Opus 5.5, Sonnet 5.5, Fable 5.1**, signed in with an API key or a Claude subscription: changing effort keeps the cache. Claude Code applies the new level without asking. Anthropic's 2026-09-24 post on Opus 5.5 lists this as one of the changes behind a more-than-50% drop in input that misses the cache.
- **Most other models**: changing effort means the next request reads the entire history with no cache hits. While the cache is still warm, Claude Code asks you to confirm first. After the cache time-to-live has passed, there is little left to lose.
- **Exceptions**: the cache-preserving behavior does not apply on Amazon Bedrock, Google Cloud's Agent Platform or a Claude apps gateway, when `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` is set, or under a HIPAA organization configuration. Before v2.1.260, Fable 5.1 also lost its cache on an effort change.

The same property makes this a sensible pattern: start a long session at `medium`, drop to `low` for the mechanical cleanup, and raise to `high` for the tricky step, all in one conversation. You can run `/effort` while Claude is working; once you confirm any cache warning, the change applies to the next request in that turn. Model switches are different. Each model has its own cache, so `/model` mid-session rebuilds it (the same is true of turning on fast mode for the first time in a conversation, below).

### Check that it worked

1. Run `/effort status`, or look at the session header, to see the active level.
2. After at least one response, run `/usage`. The session block carries a `Prompt cache (main)` line with hit ratio and miss count (v2.1.251+). Change effort with `/effort low`, send a prompt, and run `/usage` again. On Opus 5.5, Sonnet 5.5 or Fable 5.1 the miss count should not jump. On other models, expect one expensive turn.
3. If a miss does occur, the same line names a likely cause when it can identify one (v2.1.260+).

## Fast mode

Fast mode is not a different model and not a "think less" switch. It is a configuration of Claude Opus that makes responses up to 2.5 times faster at a higher cost per token, with the same quality. It is a research preview, so features, pricing and availability can change.

- **Models:** Opus 5.5 (the default since v2.1.280), Opus 5 and Opus 4.8. Not Sonnet, Haiku or Opus 4.7. If you turn it on while on an unsupported model, Claude Code switches you to Opus; switching to an unsupported model turns it off.
- **Price per million tokens (input/output):** $8/$40 on Opus 5.5, $10/$50 on Opus 5 and Opus 4.8. Flat across the 1M-token context window.
- **Billing:** on Pro, Max, Team and Enterprise, fast mode is available through usage credits only, not included in your plan limits. Turn usage credits on first (`/usage-credits` opens the page on Pro and Max). Team and Enterprise need an Owner to enable fast mode for the organization. It is not available on Bedrock, Google Cloud's Agent Platform, Microsoft Foundry or Claude Platform on AWS.
- **Toggle:** `/fast` (then Space and Enter), `/fast on`, `/fast off`, `"fastMode": true` in user settings, or `Option+O` / `Alt+O`. A `↯` icon shows while it is on. It persists across sessions by default; set `fastModePerSessionOptIn: true` to start every session with it off.
- **Cost trap:** the first time you turn it on in a conversation, the whole context is billed once at the uncached fast-mode input price. Turn it on at the start, not deep into a long session. The charge happens once per conversation; toggling off and on later keeps the cache.
- **Rate limits:** fast mode has its own pool shared across the supported Opus models. When you hit it, Claude Code falls back to standard speed (the icon turns gray) and re-enables fast mode after the cooldown. If usage credits run out, it retries at standard speed and turns fast mode off for the session.

Fast mode and effort are different knobs. Fast mode shortens latency at the same quality for more money. Lower effort shortens latency by thinking less, for less money, with possibly lower quality on hard tasks. You can combine them: fast mode at `low` effort for maximum speed on simple edits.

Use fast mode for interactive work where you are waiting on the answer: live debugging, rapid iteration on a UI. Leave it off for long autonomous runs, batch work and CI, where latency does not matter and the premium adds up.

### Check that it worked

Run `/fast on`. You should see "Fast mode ON" and the `↯` icon. Run `/fast` with no argument at any time to see the status. If it reports "Fast mode requires usage credits", turn them on; if it says your organization disabled it, an Owner or managed settings (`fastMode: false`) is the cause.

## Voice dictation

Voice dictation transcribes speech into the prompt box, live. You can mix speaking and typing in one message.

Requirements, per the docs: you must be signed in with a claude.ai account (not an API key, Bedrock, Google Cloud's Agent Platform or Foundry), and you need a local microphone. Audio is streamed to Anthropic's servers for transcription; nothing is processed locally. Transcription does not use Claude messages or tokens and does not count toward `/usage` limits. It does not work in cloud or SSH sessions. The VS Code extension supports it too, but not in VS Code Remote sessions.

Enable it with `/voice`:

| Command | Effect |
| :- | :- |
| `/voice` | Toggle on or off, keeping the current mode |
| `/voice hold` | Push-to-talk (default): hold `Space`, speak, release |
| `/voice tap` | Tap `Space` to start (on an empty prompt), tap again to send |
| `/voice off` | Disable |

On macOS the first run triggers a microphone permission prompt for your terminal. The setting persists:

```json
{
  "voice": {
    "enabled": true,
    "mode": "tap"
  }
}
```

Details that save you trouble:

- **Hold mode** needs your terminal to send key-repeat events, so there is a short warmup, and it fails if key-repeat is disabled at the OS level. If holding `Space` just types spaces, run `/voice hold` to check it is on, or switch to tap mode.
- **After release**, hold mode inserts the transcript and waits for `Enter`. Set `"autoSubmit": true` in the `voice` object to send automatically (for transcripts of at least three words). **Tap mode** submits automatically at three words or more, so a stray tap does not send junk. Recording stops after 15 seconds of silence or two minutes total.
- **Cancel** a recording with `Esc` or `Ctrl+C`; the prompt is restored to what it held before.
- **Language** follows your `language` setting (empty means English). Set it in `/config` or settings, by code or name, for example `"language": "japanese"`. There is no `/voice <language>` form. The docs list 20 supported languages: Czech, Danish, Dutch, English, French, German, Greek, Hindi, Indonesian, Italian, Japanese, Korean, Norwegian, Polish, Portuguese, Russian, Spanish, Swedish, Turkish, Ukrainian. An unsupported value falls back to English dictation with a warning; Claude's replies are unaffected.
- **Vocabulary** is tuned for code: terms such as `regex`, `OAuth`, `JSON` and `localhost` are recognized, and your project name and git branch are added as hints.
- **Rebind** the key with the `voice:pushToTalk` action in `~/.claude/keybindings.json`. A modifier combination such as `meta+k` skips hold-mode warmup. Avoid bare letters in hold mode.
- **Agent view:** dictation also works in the dispatch input and peek-reply boxes, so you can talk to a background session. See [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions).

Voice suits prose: a feature description, review feedback, a bug report. For exact syntax, such as regexes, file paths and JSON, type it.

### Check that it worked

Run `/voice`. It should print "Voice mode enabled (hold). Hold space to record." followed by the dictation language. Hold `Space`, say a sentence, and release. The text should appear in the prompt. If you see `Microphone access is denied`, grant your terminal microphone permission in system settings and run `/voice` again.

## Putting them together

| Situation | Setting |
| :- | :- |
| Long session, mixed work | Start on the default level for your model; move down for mechanical steps and up for hard ones using `/effort`, on a model that keeps the cache |
| Waiting on every answer (debugging, UI iteration) | Fast mode on at the start of the session, effort `low` or `medium` |
| Unattended hard problem | Standard speed, `high` or `xhigh`; reach for `max` only after testing it on your task |
| Subagent that must be careful or cheap | `effort:` in its frontmatter |
| Describing a feature or giving review feedback | Voice, tap mode, `autoSubmit` off if you want to edit before sending |

## Sources

- Model configuration (effort levels, defaults, `/effort`, ultrathink, ultracode). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- Speed up responses with fast mode. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/fast-mode
- Voice dictation. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/voice-dictation
- How Claude Code uses prompt caching (Changing effort level; Turning on fast mode; Check cache performance). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- Interactive mode (shortcuts; commands that run immediately). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/interactive-mode
- Commands reference (`/effort`, `/fast`, `/voice`). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Coding sessions are longer and use more context. Claude Opus 5.5 is built with that in mind. Michael Segner, claude.com blog, 2026-09-24. https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context
- `claude --help`, Claude Code 2.1.289 (`--effort` accepts low, medium, high, xhigh, max).
