# MCP, CLI or Skill?

> Verified on 2026-10-04 with Claude Code 2.1.289.

There are three common ways to give Claude Code a new capability:

- **An MCP server**: a separate process or remote service that offers typed tools over the Model Context Protocol. Claude calls `mcp__orders__run_query` the way it calls `Read`.
- **A CLI the agent calls**: Claude runs `gh`, `psql`, `kubectl` or your own script through the Bash tool and reads the output.
- **A skill**: a `SKILL.md` file of instructions, optionally with scripts beside it, that Claude loads when the task matches.

In 2025 the default answer was "add an MCP server". By mid-2026 a loud part of the community said the opposite: delete your MCP servers, the agent has a shell. Then the protocol changed and some of the loudest critics came back. This chapter gives you a way to choose on the merits: context cost, reliability and security. It ends with the debate itself, dated, so you can weigh the arguments rather than the volume.

## The short answer

| Situation | Usually pick |
| :- | :- |
| A well-known CLI already does the job (`git`, `gh`, `psql`, cloud CLIs) and Claude has a shell | **CLI**, plus a skill if your team has conventions for it |
| A remote service with OAuth, per-user credentials, or many users sharing one endpoint | **MCP** |
| Claude must not get a general shell (locked-down CI, an untrusted repo, a chat surface without Bash) | **MCP** with a small set of narrow tools |
| You want an auditable list of exactly what the agent can do, enforced by permission rules per tool | **MCP** |
| The missing piece is know-how: which command, which flags, what order, what "done" means | **Skill** |
| A repeatable procedure with a script at its core | **Skill** that runs the script |

Most good setups combine them. A skill that says "query reporting data through the `orders` MCP server, never the primary database, and always include a date filter" is a skill and an MCP server working together. A skill that documents your deploy script is a skill and a CLI.

The three are not substitutes in one respect: a skill only informs. If something must happen every time, such as a formatter, a blocked path or a test gate, that is a [hook](/en/book2-advanced/09-hooks), not any of these.

## One task, three ways

Say Claude needs to answer questions about an orders database.

**As a CLI**, you tell Claude (in `CLAUDE.md` or a skill) that it may run `psql` against a read-only replica, and allow it with a permission rule such as `Bash(psql *)`. Claude writes SQL, runs it, and reads the text output. Setup takes a minute. Claude already knows `psql` well.

**As an MCP server**, you register a database server, such as DBHub or the small server built in [MCP in Practice](/en/book2-advanced/12-mcp-in-practice). Claude sees tools like `list_tables` and `run_query` with typed inputs and gets structured results back. You allow `mcp__orders` and nothing else. Claude never touches a shell for this task.

**As a skill**, you write `.claude/skills/orders-data/SKILL.md` with the schema notes, the business definitions ("revenue excludes refunded orders"), the query patterns your analysts trust, and the command to run. The skill can point at either of the other two.

All three will answer "what was revenue last week?". They differ in what they cost per session, how often they go wrong, and what else they let Claude do.

## Context cost

Every capability costs some context: either a standing cost paid on every request, or a cost paid when it is used.

**MCP servers.** Tool search is on by default in Claude Code. At session start only tool names and server instructions load; a tool's full JSON schema loads when Claude looks it up. That removed most of the "ten servers ate my context window" complaint from 2025, but not all of it:

- Each tool description and each server's instructions can run to 2,048 characters before Claude Code truncates them, and servers marked `alwaysLoad` put every schema in context up front.
- Tool search is off in some setups, for example when `ANTHROPIC_BASE_URL` points at a third-party proxy, and then every schema loads at start.
- Results count too. Claude Code warns when one MCP result passes 10,000 tokens and, by default, moves anything over 25,000 tokens (`MAX_MCP_OUTPUT_TOKENS`) to a file and gives Claude the path.

**CLIs.** A tool the model already knows costs nothing until it is used. The cost moves to the output: a CLI that prints verbose JSON or a 2,000-line table spends tokens on every call unless Claude, or your skill, pipes it through `jq`, `head` or a `--format` flag. An unfamiliar CLI also costs a round of `--help` exploration in every new session, unless a skill writes the useful commands down once.

**Skills.** Each model-invocable skill puts its description in every request. The description and `when_to_use` text together are cut at 1,536 characters, and when you have many skills Claude Code drops some descriptions to fit a budget. The body loads only when the skill is used. A skill with `disable-model-invocation: true` costs nothing until you type its `/name`.

Measure rather than guess. `/context` shows a breakdown by category, including MCP tools and skills, and `/context all` shows per-tool and per-skill numbers. For a plugin, `claude plugin details <name>` prints its components and projected token cost. [Context Engineering](/en/book2-advanced/15-context-engineering) covers keeping that baseline small.

## Reliability

**MCP** gives the model a schema: required fields, enums, number ranges, and structured results it does not have to parse. When a server is well made, that removes a whole class of mistakes. Many are not well made. In July 2026 Teng Li ran a linter over 36 popular servers and graded a third of them D or F; the dominant problem was parameters with no description at all, typically because schemas were generated from code and nobody added `.describe()`. A server is also one more process or endpoint that can be down, slow to connect, or signed out. `/mcp` and `claude mcp list` show its status.

**CLIs** are where models are strongest: they have seen enormous amounts of shell usage, and pipes let them compose several tools in one step. Earendil, the company behind the Pi coding harness, put the attraction in a phrase: CLIs work because "the agent and model just wire stuff together with efficient bashisms." The failure modes are mundane but real: a different version on the CI image, an interactive prompt or pager that hangs the command, output format changes between releases, and text that has to be parsed.

**Skills** are only as reliable as Claude's decision to load them. If the description is vague or overlaps with another skill, Claude may pick the wrong one or none. Invoking it by name (`/orders-data`) removes the guesswork.

## Security

This is where the choice matters most once agents run without you watching.

**A CLI means a shell.** Granting Bash for `psql` grants Bash, and the boundary becomes your permission rules (`Bash(psql *)` rather than `Bash`), the auto-mode classifier and any sandbox you run in. Simon Willison, who had drifted from MCP towards skills, wrote in July 2026 that "giving an agent a shell environment with the ability to access the internet is fraught with risk, and requires a strong model". His counterpoint was that MCP tools "are easier to audit and control".

**An MCP server is a narrow, listable capability.** You can allow `mcp__orders__run_query` and nothing else, mark a dangerous tool with `requiresUserInteraction` so every call asks a person, and let an administrator restrict which servers may be added at all. It is still third-party code or a remote service, though. Tool results flow straight into Claude's context and can carry prompt injection, and a server that combines private data access with a way to send data out is exactly the "lethal trifecta" Willison has warned about. Claude Code helps on the credential side: in a remote server's URL and headers it reads its own and your cloud credentials (such as `ANTHROPIC_API_KEY`) as empty, so a project's `.mcp.json` cannot quietly forward them.

**A skill is text that steers the agent,** plus whatever scripts it ships. A malicious skill is prompt injection with a friendly name. Its `allowed-tools` frontmatter can pre-approve commands for the turn it runs in. Read third-party skills before installing them, as you would read a shell script.

One more difference: in an interactive session Claude Code asks before connecting a project's `.mcp.json` servers, but a `claude -p` run connects them without asking. [Containment and Security](/en/book3-architect/09-containment-and-security) covers the wider picture.

## The 2026 debate, in order

**2026-07-28: the stateless spec.** The MCP maintainers shipped the biggest revision since launch. The `initialize` handshake and the `Mcp-Session-Id` header are gone; each request carries its protocol version, client identity and capabilities, so any request can hit any server instance behind a plain load balancer. Method and tool names travel in `Mcp-Method` and `Mcp-Name` headers that gateways can route on, list results carry cache hints, and server-to-client requests such as elicitation now use Multi Round-Trip Requests instead of a held-open stream. Dynamic Client Registration was deprecated in favour of Client ID Metadata Documents, and Roots, Sampling and Logging started a twelve-month deprecation. The TypeScript, Python, Go and C# SDKs shipped support the same day. Claude Code speaks the new revision through its v2 MCP runtime; [MCP in Practice](/en/book2-advanced/12-mcp-in-practice) covers what that means for you.

**2026-07-31: Willison comes back.** In "Stateless MCP has recaptured my interest", Simon Willison described MCP as having been "somewhat eclipsed by Skills" once it was clear "an agent harness with access to a terminal and curl could do most of what MCP did in a more flexible way". The stateless spec made servers simple enough that he built three that week, and he argued that "it's much easier to reason about agent capabilities and what might go wrong than with arbitrary command execution in an open network environment". His plan: lean on MCP for sensitive applications.

**2026-09-14: "Why MCP Was Always a Bad Idea".** Maharshi Patel argued the opposite. MCP was "built for a time when LLMs weren't that smart"; models now discover CLIs with `--help`, write scripts and call documented APIs directly, and most remote MCP servers "ultimately wrap APIs that already exist". His advice: delete most MCP servers and standardize how agents use plain HTTP APIs, for example with `Accept: text/markdown`.

**2026-09-29: "You Said No MCP!".** Earendil, makers of the minimal Pi harness, had publicly refused to support MCP. They added it to Pi's core. Their reasons: MCP had changed, and pairing it with "Codemode", a JavaScript sandbox that runs on the harness side and lets the model combine tool calls in code, fixes much of what they disliked. They are candid about what is still wrong: the biggest issue with MCP, they write, "continues to be that it's hard to compose", which they now blame more on servers built for harnesses that "dump tools into the context". MCP, in their view, should be "much closer to OpenAPI with intelligent tool discovery", with tools returning structured data.

Read together, the camps agree on more than the headlines suggest. Nobody defends dumping fifty schemas into every request. Everybody wants composition in code rather than one tool call per model turn. The live disagreement is about trust: whether a general shell with good permission rules is an acceptable boundary, or whether capabilities should arrive as a narrow, typed, auditable list. That is a question about your threat model, not about the protocol.

## A checklist

Before adding a capability, answer:

1. **Does Claude already know a tool for this?** If a mainstream CLI does it and Claude has a shell in this context, start there.
2. **Who holds the credentials?** Per-user OAuth or a shared remote endpoint points to MCP. A local token in your environment works with either.
3. **Will this run unattended or in a repo you do not control?** Prefer narrow MCP tools and explicit allow rules over a broad shell.
4. **Is the gap a capability or know-how?** If Claude can already do it but does it wrong, write a skill.
5. **What does it cost per session?** Check `/context` before and after.
6. **How will you notice when it breaks?** A server that fails to connect, a CLI that changed its output, and a skill that stopped triggering all fail quietly.

<!-- AUTHOR-DATA: one before/after /context measurement from replacing an MCP server with a CLI plus skill (or the reverse) in a real project -->

### Check that it worked

After choosing, test the choice on a real task, not a demo:

1. Start a fresh session and run `/context`. Note the MCP tools and skills totals.
2. Give Claude a representative task. Watch which tool it reaches for; if it ignores your skill or picks the shell over your MCP tool, the description or the permission rules need work.
3. For a scripted comparison, run the same prompt both ways with `claude -p --output-format json` and compare `num_turns` and `total_cost_usd`.
4. Try one thing it should not be able to do, such as a write through a read-only tool or a command outside your allow rules, and confirm it is refused.

## Sources

- Connect Claude Code to tools via MCP (tool search, output limits, credentials, `requiresUserInteraction`), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/mcp
- Extend Claude Code: context cost by feature, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/features-overview
- Skills (description limits, `disable-model-invocation`, `allowed-tools`), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/skills
- Commands reference (`/context`), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- "The 2026-07-28 Specification", David Soria Parra and Den Delimarsky, Model Context Protocol Blog, 2026-07-28. https://blog.modelcontextprotocol.io/posts/2026-07-28/
- "The New MCP Roadmap", David Soria Parra and Den Delimarsky, Model Context Protocol Blog, 2026-08-22. https://blog.modelcontextprotocol.io/posts/mcp-roadmap/
- "Stateless MCP has recaptured my interest (and inspired mcp-explorer and datasette-mcp)", Simon Willison, 2026-07-31. https://simonwillison.net/2026/Jul/31/stateless-mcp/
- "Why MCP Was Always a Bad Idea", Maharshi Patel, 2026-09-14. https://maharship.com/blog/why-mcp-was-always-a-bad-idea/
- "You Said No MCP!", Earendil Engineering, 2026-09-29. https://earendil.com/posts/you-said-no-mcp/
- "I lint-scanned 36 popular MCP servers. A third of them are failing your agent.", Teng Li, 2026-07-21. https://tengli.dev/posts/mcp-servers-failing-agents.html
