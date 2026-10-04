# Portability: Many Tools, Many Models

> Verified on 2026-10-04 with Claude Code 2.1.289.

Few teams run a single agent any more. One engineer prefers Claude Code, another lives in Cursor, a third uses Codex, and the best model this month may not be the best next month. The work you put into an agent setup (instructions, skills, tool servers, checks) is the durable part. The agent and the model are the parts most likely to change.

This chapter covers what moves cleanly between tools, what must be rewritten per tool, how to route between models without losing features, and where routers in front of Claude Code break things, terms of service included.

The short version: open formats now cover instructions, skills and tool servers. Hooks, subagents, permissions and plugins are still per tool. Checks that live in the repository (tests, linters, CI) are the most portable thing you own, so put anything that must always hold there.

## The portability map

| Asset | Shared format | Claude Code | OpenAI Codex | Cursor | Verdict |
| :- | :- | :- | :- | :- | :- |
| Instructions | `AGENTS.md` | Reads it when no `CLAUDE.md` applies (v2.1.277+; v2.1.281+ on Bedrock, Agent Platform, Foundry, gateways and telemetry-off sessions) | Reads it | Reads it | Transfers; nesting rules differ |
| Skills | [Agent Skills](https://agentskills.io) (`SKILL.md`) | `.claude/skills/` | `.agents/skills/` | `.agents/skills/`, `.cursor/skills/`, also `.claude/skills/` and `.codex/skills/` | Transfers within the spec; folders differ |
| Tool servers | MCP protocol | `.mcp.json` (JSON) | `config.toml`, `[mcp_servers.<name>]` | `.cursor/mcp.json` (JSON) | Server transfers; config must be translated |
| Hooks | None | `hooks` in settings files | `hooks.json` or `config.toml` | Tool-specific | Scripts partly; registration does not |
| Subagents | None | Markdown with YAML frontmatter in `.claude/agents/` | TOML in `.codex/agents/` | Tool-specific | Prompt text transfers; files do not |
| Permissions, sandbox, plugins | None | Settings files, plugins | `config.toml`, own plugins | Tool-specific | Rewrite per tool |
| Tests, linters, CI | Your build | Runs them | Runs them | Runs them | Fully portable |

The rest of the chapter works down this table.

## Instructions: one file, written for the strictest reader

[CLAUDE.md and Agent-File Patterns](/en/book3-architect/03-claude-md-patterns) covers this in full: what Claude Code reads by default, the three ways to share one file, and how Codex, Cursor and Claude Code read nested files differently. Two points matter most on a mixed team:

- **Use a `CLAUDE.md` that imports `@AGENTS.md`.** It works on every Claude Code version, and it leaves room for Claude-only lines below the import.
- **Watch for `CLAUDE.local.md`.** It counts as a `CLAUDE.md`, so a developer who adds one for private notes silently stops Claude Code from reading a shared `AGENTS.md` (unless the project relies on the import, or the **Project instructions** setting is changed).

## Skills: one source, linked into each tool's folder

Claude Code skills follow the Agent Skills open standard, and so do Codex and Cursor skills. The Codex docs say its skills "build on the open agent skills standard". The format transfers. The folders do not: Claude Code reads skills from `.claude/skills/` (and plugins), not from `.agents/skills/`. Codex scans `.agents/skills` "in every directory from your current working directory up to the repository root" and does not mention `.claude/skills`. Cursor reads both.

A layout that works for all three keeps one copy of each shared skill in `.agents/skills/` and links it into `.claude/skills/`. Claude Code supports this directly: a skill folder in the project location can be a symlink, and Claude Code reads `SKILL.md` from the target.

```bash
mkdir -p .claude/skills
for dir in .agents/skills/*/; do
  name=$(basename "$dir")
  ln -s "../../.agents/skills/$name" ".claude/skills/$name"
done
git add .agents/skills .claude/skills
```

Skills that only make sense in Claude Code (ones that fork a subagent or register hooks, for example) can live directly in `.claude/skills/` without a link.

Three rules keep a shared skill portable:

1. **Stay inside the spec's six frontmatter fields:** `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools`. The spec requires `name` and `description`. `name` must be lowercase letters, numbers and hyphens, and it must match the folder name. Claude Code is more lenient (it treats `name` as optional), so a skill that loads in Claude Code can still be invalid elsewhere. Claude Code extensions such as `context: fork`, `disable-model-invocation`, `paths`, `hooks`, `model` and `effort` are not in the spec. Claude Code's own docs say claude.ai and the Skills API reject unknown keys with a hard error. Other agents may ignore those keys or reject the file, so keep them out of shared skills.
2. **No Claude-only substitutions in the body.** `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}` and `` !`command` `` injection are Claude Code features. The spec's convention is relative paths from the skill root, such as `scripts/extract.py`.
3. **Treat `allowed-tools` as advisory.** The spec marks it experimental and space-separated, and tool names differ between agents. A pre-approval written for Claude Code's `Bash(...)` rules means nothing to another agent.

Windows clones without `core.symlinks` turn each link into a small text file. If anyone on the team works on Windows without symlink support, copy the folders in a setup script instead of linking them.

### Check that it worked

- In Claude Code, run `/skills` and confirm each shared skill is listed. Type `/` plus the skill name to invoke it.
- Validate the shared copies against the spec with the [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) reference library (its README calls it a demonstration library): `skills-ref validate .agents/skills/<name>`.
- In Codex and Cursor, ask for a task the skill's description covers and confirm the agent picks it up. Cursor's docs list both `.agents/skills/` and `.claude/skills/`, so check that a linked skill does not appear twice in its skill list.

## Tool servers: one MCP server, three config files

MCP is the most portable piece of the stack: the same server process works with every agent that speaks the protocol. Only the configuration differs. Here is one stdio server, configured for each tool at project scope.

Claude Code writes `.mcp.json` at the project root:

```bash
claude mcp add --scope project context7 -- npx -y @upstash/context7-mcp
```

```json
{
  "mcpServers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] }
  }
}
```

Cursor reads `.cursor/mcp.json` with the same `mcpServers` shape. Codex uses TOML, in `~/.codex/config.toml` or a project `.codex/config.toml` for trusted projects:

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

The translation is mostly mechanical, with a few traps:

- **Remote servers need a `type` in Claude Code.** Cursor's docs show remote entries with only a `url`. Claude Code reads an entry with no `type` as a stdio server, so a copied `url` entry fails until you add `"type": "http"` (or `"sse"` or `"ws"`).
- **Credentials are expressed differently.** Claude Code expands `${VAR}` in `.mcp.json`. Codex uses keys such as `env` and `bearer_token_env_var`. Cursor has its own interpolation syntax. Keep secrets in environment variables in all three, never in the committed file.
- **Sign-ins do not carry over.** OAuth for a remote server is stored by each tool, so every developer signs in once per tool.
- **Approval is per tool.** Claude Code does not connect a project's `.mcp.json` servers until the developer trusts the workspace and approves them.

Going one way, from Codex, Gemini CLI or Cursor into Claude Code, is automated. `/import codex` (or `claude import codex --dry-run` from the shell to preview) brings over instruction files, MCP servers, commands, subagents and skills. It needs version 2.1.213 or later, and 2.1.265 or later for Cursor. It is not available on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, Claude Platform on AWS, or through a Claude apps gateway. The CLI has no matching export command, so going from Claude Code to another tool is the manual work this chapter describes.

### Check that it worked

Run `claude mcp list` (approve the server with `claude` first if it shows `Pending approval`), then `codex mcp list`, then open Cursor's MCP settings. The same server should appear as connected in all three. In each tool, ask for something only that server can answer.

## Hooks, subagents and permissions: write them per tool

**Hooks.** Codex now has hooks with event names that will look familiar (`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SessionStart` and others), a JSON object on stdin, and exit code 2 to block. A well-written script can therefore serve both tools. The registration files, the tool names that matchers refer to, and the output fields each tool honors are different, so expect a thin per-tool wrapper. Better still, ask whether the rule belongs in a hook at all. A formatting rule or a protected-path rule that must hold for every agent, and every human, belongs in a git pre-commit hook or a CI check, where it applies whichever tool made the change. Keep agent hooks for things only an agent needs, such as feeding failures back into the conversation. [Hooks](/en/book2-advanced/09-hooks) covers Claude Code's hook model.

**Subagents.** Claude Code defines them as Markdown files with YAML frontmatter in `.claude/agents/`. Codex uses one TOML file per agent in `.codex/agents/`, with required `name`, `description` and `developer_instructions` fields. The instructions are plain text and move easily. The files do not, and neither do tool lists or model names. If you keep reviewer agents in both tools, keep the prompt text in one place and generate both files from it with a short script.

**Permissions and sandboxing.** Each tool has its own model: Claude Code's permission rules and sandbox settings, Codex's `sandbox_mode` and approval settings, Cursor's own controls. None of them translate. If you need a boundary that holds no matter which agent runs, put it below the agent: a container, a VM, or a credential gateway. [Containment and Security](/en/book3-architect/09-containment-and-security) covers those options.

## Models: route inside the harness, not in front of it

### Routing Claude Code already supports

Claude Code can route between Claude models without any outside tooling, and every route keeps all its features:

| Mechanism | What it routes |
| :- | :- |
| `/model`, `--model`, the `model` setting | The main session |
| `opusplan` | Opus in plan mode, Sonnet for execution |
| A subagent's `model` field, or `CLAUDE_CODE_SUBAGENT_MODEL` | Delegated tasks; see [Subagents](/en/book2-advanced/05-subagents) |
| A skill's `model` and `effort` fields | The rest of the turn that invoked the skill |
| `fallbackModel` setting, or `--fallback-model sonnet,haiku` | Availability failures only: overload or an unavailable model. Up to three models, for the current turn |
| The [advisor tool](https://code.claude.com/docs/en/advisor) | Claude consults a second model mid-task |

Each model has its own prompt cache. A switch in the middle of a conversation re-reads the whole history uncached, and so does every plan-mode toggle under `opusplan`. Route at task boundaries (a new session, a subagent, a skill) rather than mid-conversation. [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort) covers effort, the other big cost lever.

### What a measured router looks like

LangChain's October 2026 write-up on Open SWE, its coding agent, is a useful reference because it reports outcomes, not just cost. The router classified each thread from its first message and picked one of three model tiers for the whole thread. Across 973 threads, median cost per thread fell 64% ($0.94 against $2.61), while 29.2% of routed threads ended in a merged pull request against 27.3% for the control group (a difference LangChain reports as not significant, p = 0.49). Most threads went to the middle tier (56%), 34% to the cheapest and only 10% to the most capable. The authors argue that "an effective model router belongs in the harness, not a generic gateway," because choosing a model needs the task context that only the harness has. They name mid-thread rerouting as an open question, and the price of rerouting is the prompt cache.

Three lessons carry over to any setup:

1. **Decide at the start of a task, then stay put.** In Claude Code that means a subagent or skill `model`, not mid-session `/model` switches.
2. **Measure on your outcome, not a benchmark.** Merged pull requests, passing checks, or your own eval set ([Verification and Evals at Scale](/en/book3-architect/02-verification-and-evals)).
3. **Look at the cost spread before building anything.** LangChain's cheapest and most expensive tiers differed 30 times in median thread cost. If your spread is small, a router is not worth its complexity.

### Routers in front of Claude Code

A second kind of router sits outside the agent. Tools such as claude-code-router (MIT-licensed, about 37,500 GitHub stars as of 2026-10-04) run a local gateway that Claude Code, Codex and other agents point at. The gateway translates requests to other providers' APIs, including OpenAI, Gemini, DeepSeek, Moonshot and others, and applies routing rules, retries and fallbacks. LM Studio and Ollama go further and expose Anthropic-compatible endpoints on your machine. LM Studio's January 2026 guide sets `ANTHROPIC_BASE_URL=http://localhost:1234` and runs `claude --model openai/gpt-oss-20b`.

These work, and they are useful for experiments such as trying a local model offline or comparing models on your own tasks. Know what you are giving up.

**Support.** Anthropic's gateway docs state that Anthropic "doesn't support routing Claude Code to non-Claude models through any gateway."

**Features, often silently.** Anthropic's gateway compatibility guide lists what breaks when a gateway does not pass Claude Code's requests through intact:

- Prompt caching can disappear without any error. The guide's symptom: "the conversation bills as uncached input on every turn."
- Capabilities that pair a beta header with a request field, such as effort, structured outputs and context management, fail with hard `400` errors when the gateway forwards one half without the other or translates the body to another schema.
- For a model ID it does not recognize, Claude Code assumes a 200K context window and sends request fields that current Claude models accept, which another backend may reject.
- Without the token-counting endpoint, `/context` shows character-based estimates.

**Fit.** Claude Code's prompts and tools are built around Claude models. An empirical study of harness design (Fan et al., September 2026, four models, 176 matched settings) found that the same harness components help one model and not another. Planning acted as an accuracy aid for weaker models and as a cost saver for stronger ones, and bash-only tool sets suited bash-capable models but not others. A harness tuned for one model family is not neutral ground for another. If you want a GPT model, its own agent is usually the better harness, which is why portable assets matter more than a portable model.

**Terms of service.** Anthropic's legal and compliance page says subscription OAuth "is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications." Third-party developers may not "route requests through Free, Pro, or Max plan credentials on behalf of their users," and may not "collect, store, or intermediate Claude.ai credentials or session tokens." Anthropic "reserves the right to take measures to enforce these restrictions and may do so without prior notice." Some routers advertise importing local logins and pooling credentials. Before you put a subscription login behind any router, read what it does with that credential. With API keys, usage is billed to the key owner under that owner's agreement, and the other provider's terms apply to whatever the router sends there.

**Data.** A router sees every prompt, every file the agent reads, and every tool result. Treat it as part of your trust boundary.

**For administrators.** On v2.1.285 or later, managed settings can pin the endpoint. Set `allowedProviders` to `["customEndpoint"]` and put your approved gateway's `ANTHROPIC_BASE_URL` in the same file's `env` block. Claude Code then refuses sessions pointed anywhere else, including a developer's own proxy. [Team Workflows](/en/book3-architect/12-team-workflows) covers the other model controls.

### Check that it worked

For any router or gateway setup:

- Run `/status` in Claude Code and confirm the model and connection are what you intended.
- Open the router's request log and confirm the resolved provider and model for a request you just sent.
- Send two turns in a row, then check the second response's usage in the log for cache reads (`cache_read_input_tokens` on Anthropic-format responses). Zero cache reads on a follow-up turn means caching is lost and you are paying full input price every turn.

## What breaks: a checklist

Run through this list when you add a tool, switch a default model, or put anything between Claude Code and the API:

- [ ] A `CLAUDE.local.md` somewhere stops Claude Code reading `AGENTS.md`.
- [ ] A nested instruction file overrides its parent in one tool and adds to it in another.
- [ ] A shared skill uses Claude-only frontmatter or `${CLAUDE_SKILL_DIR}`, or sits only in `.claude/skills/` where Codex never looks.
- [ ] A copied MCP entry has a `url` but no `type`.
- [ ] A rule that must always hold is enforced by one agent's hook rather than by CI.
- [ ] A router or gateway strips caching, beta headers or token counting, or holds credentials it should not.
- [ ] A new model became the default before anyone ran your eval set on it. `availableModelsMatch: "exact"` or `deniedModels` in managed settings stops new releases arriving unannounced.
- [ ] A feature that needs a claude.ai account (cloud sessions, routines, Code Review, Remote Control, the Chrome extension) was assumed to work for developers on API keys or a cloud provider.

### Check that it worked

Pick one repository and one non-trivial task. Run it in each tool your team uses, with the shared instructions, skills and MCP servers in place. Each run should name the same build and test commands from the shared file, use the shared skill where it applies, reach the same MCP server, and pass the same CI checks. Any difference is a portability gap. Fix it in the shared asset, not in one tool's private config.

<!-- AUTHOR-DATA: optional, which tools and models the author's team actually runs side by side, and one portability gap found in practice -->

## Key takeaways

- Instructions (`AGENTS.md`), skills (Agent Skills) and tool servers (MCP) now have shared formats. Keep one source for each and adapt only the location or config syntax per tool.
- Hooks, subagents, permissions and plugins are per tool. Anything that must hold for every agent and every human belongs in CI or git hooks.
- Route between models at task boundaries inside the harness. Mid-conversation switches cost you the cache.
- Routers in front of Claude Code cost you Anthropic support and can silently drop caching and features. With a subscription login, they can also put you in breach of the terms. Use them for experiments, not as your team's foundation.
- Before switching tools or models, run the same task and checks in each, and treat any difference as a bug in your shared setup.

## Sources

- Anthropic, Claude Code docs, accessed 2026-10-04: "How Claude remembers your project" (AGENTS.md support) https://code.claude.com/docs/en/memory ; "Skills" https://code.claude.com/docs/en/skills ; "Connect Claude Code to tools via MCP" https://code.claude.com/docs/en/mcp ; "Commands" (`/import`, `/skills`) https://code.claude.com/docs/en/commands ; "Model configuration" https://code.claude.com/docs/en/model-config ; "Prompt caching" https://code.claude.com/docs/en/prompt-caching ; "Run Claude Code through a gateway" https://code.claude.com/docs/en/gateways ; "Other LLM gateways" https://code.claude.com/docs/en/llm-gateway ; "Claude Code gateway compatibility guide" https://code.claude.com/docs/en/llm-gateway-protocol ; "Legal and compliance" https://code.claude.com/docs/en/legal-and-compliance ; "Set up Claude Code for your organization" https://code.claude.com/docs/en/admin-setup ; "Hooks reference" https://code.claude.com/docs/en/hooks
- Anthropic, Claude Code changelog, 2.1.277 (2026-09-18, AGENTS.md support), 2.1.281 (2026-09-23), 2.1.283 (`deniedModels`, `availableModelsMatch`), 2.1.285 (`allowedProviders`). https://code.claude.com/docs/en/changelog
- Claude Code 2.1.289 CLI help (`claude --help`, `claude import --help`, `claude mcp --help`), 2026-10-04.
- Agent Skills, "Specification", accessed 2026-10-04. https://agentskills.io/specification
- OpenAI, Codex docs, accessed 2026-10-04: "Build skills" https://learn.chatgpt.com/docs/build-skills ; "MCP" https://learn.chatgpt.com/docs/extend/mcp?surface=cli ; "Hooks" https://learn.chatgpt.com/docs/hooks ; "Subagents" https://learn.chatgpt.com/docs/agent-configuration/subagents
- Cursor docs, accessed 2026-10-04: "Agent Skills" https://cursor.com/docs/context/skills ; "Model Context Protocol" https://cursor.com/docs/context/mcp ; "Rules" https://cursor.com/docs/context/rules
- Sydney Runkle and Eugene Yurtsev, "How to Build a Model Router in the Harness", LangChain, 2026-10-01. https://www.langchain.com/blog/how-to-build-a-model-router-in-the-harness
- Ollama, "Anthropic compatibility", accessed 2026-10-04. https://docs.ollama.com/api/anthropic-compatibility
- musistudio, claude-code-router README and repository metadata (GitHub API), accessed 2026-10-04. https://github.com/musistudio/claude-code-router
- LM Studio, "Use your LM Studio Models in Claude Code", 2026-01-30. https://lmstudio.ai/blog/claudecode
- Run-Ze Fan et al., "An Empirical Study of Harness Design for Coding Agents", arXiv:2609.20804, 2026-09-17. https://arxiv.org/abs/2609.20804
