# Chapter 11: MCP Fundamentals

The Model Context Protocol is one of the most important ideas in AI tooling of the last few years. Understanding it is not optional for anyone who wants to use Claude Code at full capability — it is the foundation on which all external integrations are built.

---

## The Problem MCP Solves

Before MCP, every AI tool had its own proprietary integration system. Want Claude to query your database? You write a custom integration. Want GPT-4 to access your Jira? A different custom integration. Want to switch AI providers? Rewrite all your integrations.

The result was an M×N problem: M AI models times N tools equals M×N custom integrations to build and maintain. Every tool provider had to write separate code for every AI provider, and vice versa.

MCP is the solution. It defines a standard interface that any AI model can speak and any tool can implement. Write your tool once, and any MCP-compatible AI can use it. Switch AI providers, and your tools still work.

This is similar to how HTTP solved the fragmentation of early network protocols, or how USB solved the proliferation of proprietary connectors. A standard interface creates an ecosystem.

---

## What MCP Actually Is

MCP is a client-server protocol with three layers:

**Protocol layer:** The message format (JSON-RPC 2.0) and the lifecycle events (initialization, capability negotiation, tool calls, responses).

**Transport layer:** How messages are physically sent. Currently: stdio (local processes communicating via stdin/stdout) and HTTP with streaming (remote servers communicating via HTTP).

**Capability layer:** The specific capabilities a server can expose — tools, resources, and prompts.

When Claude Code connects to an MCP server, it:
1. Establishes a connection via the transport (stdio or HTTP)
2. Negotiates capabilities (what tools/resources/prompts are available)
3. Loads the tool definitions into its context
4. Is now ready to call those tools when relevant

---

## MCP Architecture: Servers, Clients, and Transports

The terminology can be confusing. Here is the precise meaning:

**MCP Server:** A program that exposes tools, resources, or prompts. The "server" here means "service provider" — it serves Claude's requests for tool execution. Your database query tool is an MCP server.

**MCP Client:** The AI model side. Claude Code is an MCP client — it consumes the tools provided by servers. When Claude Code calls your database query tool, it is acting as the client.

**Host application:** The application running the MCP client. In Claude Code, the host is Claude Code itself.

This naming can feel backwards if you think of "server" as "the big machine" and "client" as "your laptop." In MCP, your custom tool runs as the "server" even if it is a small script on your local machine. Think of it as "server = the thing being served from" rather than "server = the big machine."

### Transport Types

**stdio transport:** Used for local tools that run as subprocesses. Claude Code starts the tool process, communicates via stdin/stdout, and terminates it when done.

```json
{
  "type": "stdio",
  "command": "node",
  "args": ["/path/to/tool/index.js"],
  "env": {
    "API_KEY": "your-key"
  }
}
```

**HTTP transport (Streamable HTTP):** Used for remote servers. Claude Code connects to a URL and communicates via HTTP POST with streaming responses.

```json
{
  "type": "http",
  "url": "https://mcp.notion.com/mcp",
  "headers": {
    "Authorization": "Bearer ${NOTION_API_KEY}"
  }
}
```

The older SSE (Server-Sent Events) transport is deprecated in favor of Streamable HTTP. If you encounter SSE URLs, they still work but you should migrate to HTTP when possible.

---

## What Claude Code Exposes Through MCP

Claude Code is both an MCP client (it uses MCP servers) and an MCP server (other applications can use it via MCP).

Running Claude Code as an MCP server:

```bash
claude mcp serve
```

This exposes Claude Code's built-in tools to any MCP client. You can then use Claude Code's file editing, bash execution, and search capabilities from other applications.

This is particularly useful for building custom workflows that need Claude Code's codebase manipulation capabilities as a component within a larger system.

---

## The Three MCP Capabilities

### Tools

Tools are functions Claude can call. This is the primary capability. Each tool has:

- **Name:** Unique identifier (e.g., `create_issue`, `query_database`)
- **Description:** What Claude reads to decide when to use the tool
- **Input schema:** JSON Schema defining parameters and their types
- **Implementation:** The function that executes when called

Claude Code displays all available tools from all connected servers. When you ask Claude to "create a Jira ticket," Claude sees the `create_jira_issue` tool from your Jira MCP server and uses it.

### Resources

Resources are data sources with URI-based identifiers. Unlike tools (which Claude actively calls), resources are data that Claude can read.

Examples:
- `file:///home/user/notes/meeting-notes.md`
- `db://production/users/12345`
- `github://anthropics/claude-code/issues/456`

In Claude Code, you reference resources with `@` notation:

```text
Can you analyze the schema at @postgres:schema://users and compare it to the API contract at @github:issue://123?
```

Resources can be anything a server exposes. A documentation MCP server might expose every docs page as a resource. A database server might expose every table as a resource.

### Prompts

Prompts are pre-defined templates that MCP servers expose as `/` commands. When a server defines a prompt named `review_pr`, it appears in Claude Code as `/mcp__servername__review_pr`.

```text
/mcp__github__review_pr 456
/mcp__jira__create_issue "Bug: login fails on mobile" high
```

This is useful for standardizing how teams interact with common workflows. The GitHub MCP server's `review_pr` prompt always uses the same review criteria, regardless of who is running it.

---

## Installing MCP Servers

### Method 1: Remote HTTP Servers (Recommended)

For cloud services and team-shared tools:

```bash
# Basic HTTP server
claude mcp add --transport http notion https://mcp.notion.com/mcp

# With authentication header
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# With explicit scope (project = stored in .mcp.json, shared with team)
claude mcp add --transport http github --scope project https://api.githubcopilot.com/mcp/
```

### Method 2: Local stdio Servers

For tools that run on your machine and need local system access:

```bash
# The -- separates the server name from the command to run
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem /home/user/projects

# With environment variables
claude mcp add --transport stdio postgres --env PGPASSWORD=secret -- npx -y @bytebase/dbhub --dsn "postgresql://user@localhost/mydb"
```

### Method 3: Import from Claude Desktop

If you have already configured MCP servers in the Claude desktop app:

```bash
claude mcp add-from-claude-desktop
```

An interactive picker lets you choose which servers to import.

### Managing Servers

```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get github

# Remove a server
claude mcp remove github

# Check status from within a session
/mcp
```

---

## Scoping and Configuration Files

MCP servers can be configured at multiple scopes. Understanding the scopes is important for team collaboration.

The full scope priority from highest to lowest is:

| Scope | How specified | Storage location |
|---|---|---|
| CLI flag | `--mcp-config <path>` | Specified JSON file |
| Local | default | `~/.claude.json` under your project's path |
| Project | `.claude/.mcp.json` | Nested in the `.claude` directory |
| Project (root) | `.mcp.json` | Project root |
| User | `--scope user` | `~/.claude.json` global entry |
| Plugin | Plugin definition | Plugin's config |

**Local scope (default):** Stored in `~/.claude.json` under your project's path. Only you can see this server when working in this project. Use for personal credentials or experimental servers.

```bash
claude mcp add --transport http my-test-server https://localhost:8080/mcp
# Stored in ~/.claude.json, private to you
```

**Project scope:** Stored in `.mcp.json` in the project root (or `.claude/.mcp.json`). Committed to version control. Everyone on the team gets this server when they work on this project.

```bash
claude mcp add --transport http shared-tool --scope project https://tools.company.com/mcp
# Creates/updates .mcp.json, committed to git
```

**User scope:** Stored in `~/.claude.json` as a global entry, not tied to a project. Available in all projects.

```bash
claude mcp add --transport http my-utility --scope user https://my-personal-mcp.dev/mcp
# Available in every project you work on
```

### Precedence

When the same server name appears at multiple scopes, higher-priority scopes win. The CLI `--mcp-config` flag takes highest precedence, allowing you to completely override all other MCP configuration for a single invocation.

### The `.mcp.json` Format

When you use `--scope project`, Claude Code creates or updates `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"]
    }
  }
}
```

Note the `${DATABASE_URL}` — Claude Code supports environment variable expansion in `.mcp.json`. Sensitive values stay in environment variables; the config file can be safely committed.

---

## Authentication

Many remote MCP servers require authentication. Claude Code supports several mechanisms:

**Bearer tokens in headers:**

```bash
claude mcp add --transport http api-server https://api.example.com/mcp \
  --header "Authorization: Bearer ${API_TOKEN}"
```

**OAuth 2.0 (for services like GitHub, Notion):**

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
# Then authenticate:
/mcp
# Select "Authenticate" next to github, follow browser flow
```

OAuth tokens are stored securely (macOS Keychain or equivalent) and refreshed automatically.

**Fixed OAuth callback port (for pre-registered redirect URIs):**

```bash
claude mcp add --transport http my-oauth-server --callback-port 8080 \
  https://auth.example.com/mcp
```

---

## MCP Tool Search

When you have many MCP servers configured, their tool descriptions can consume a significant portion of your context window. Claude Code automatically handles this with MCP Tool Search.

When MCP tools would consume more than 10% of the context window, Claude Code switches to on-demand loading: instead of loading all tool descriptions upfront, Claude uses a search tool to find relevant MCP tools when needed.

From your perspective, this is invisible — Claude still uses MCP tools correctly. But it means you can have dozens of MCP servers configured without degrading context quality for large tasks.

Control this behavior with the `ENABLE_TOOL_SEARCH` environment variable:

```bash
# Always use tool search
ENABLE_TOOL_SEARCH=true claude

# Use tool search at a custom threshold (5% instead of 10%)
ENABLE_TOOL_SEARCH=auto:5 claude

# Disable tool search, always load all tools
ENABLE_TOOL_SEARCH=false claude
```

---

## MCP Elicitation

MCP Elicitation is a protocol feature that allows MCP servers to request structured input from the user mid-task. Instead of hardcoding configuration or failing when it lacks information, a server can pause and ask Claude Code to collect a specific piece of data.

When an MCP server sends an elicitation request, Claude Code shows a dialog asking the user for the required input. Common uses include:

- Asking for database credentials on first use
- Requesting confirmation before a destructive operation
- Collecting parameters that the server cannot infer from context

From your perspective, this looks like a normal permission or input prompt. The difference is that it is the MCP server requesting it, not Claude Code itself.

You can automate elicitation responses using the `Elicitation` hook event (see Chapter 8). For example, to auto-provide a database password stored in an environment variable:

```bash
#!/bin/bash
# .claude/hooks/auto-elicit.sh
INPUT=$(cat)
FIELD=$(echo "$INPUT" | jq -r '.elicitation.field // empty')

if [ "$FIELD" = "db_password" ]; then
  jq -n --arg val "$DB_PASSWORD" '{
    hookSpecificOutput: {
      hookEventName: "Elicitation",
      response: { "db_password": $val }
    }
  }'
fi
exit 0
```

---

## MCP Channels (Research Preview)

MCP Channels is a research preview feature that enables MCP servers to push messages to Claude proactively, rather than only responding to Claude's requests. This inverts the normal request-response flow.

With Channels, an MCP server can:
- Alert Claude when a monitored condition occurs (a CI build fails, an error rate spikes)
- Stream real-time data into the conversation (live log tailing, market data feeds)
- Initiate a new task on Claude's behalf

Channels are configured per-server and require the server to implement the channels capability in its MCP implementation. This feature is currently in research preview and the API may change.

---

## Popular MCP Servers Worth Installing

Here is a selection of high-quality MCP servers that cover common developer needs:

| Server | What it provides | Install command |
|---|---|---|
| GitHub | Repos, PRs, issues, code review | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` |
| Notion | Pages, databases, search | `claude mcp add --transport http notion https://mcp.notion.com/mcp` |
| Sentry | Error tracking, stack traces | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` |
| PostgreSQL | SQL queries, schema | `claude mcp add --transport stdio postgres -- npx -y @bytebase/dbhub --dsn "...conn..."` |
| Playwright | Browser automation | `claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest` |
| Filesystem | Extended file access | `claude mcp add --transport stdio files -- npx -y @modelcontextprotocol/server-filesystem /path` |
| Memory | Cross-session knowledge graph | `claude mcp add --transport stdio memory -- npx -y @modelcontextprotocol/server-memory` |

Find hundreds more at [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) and through the Anthropic MCP registry.

---

## MCP for Team and Enterprise Use

For organizations needing standardized tool access:

**Managed MCP configuration** lets IT administrators deploy MCP servers to all employees' machines system-wide. Users cannot add or remove servers — the admin controls the complete configuration:

```json
// /Library/Application Support/ClaudeCode/managed-mcp.json (macOS)
// /etc/claude-code/managed-mcp.json (Linux)
{
  "mcpServers": {
    "company-jira": {
      "type": "http",
      "url": "https://jira.company.com/mcp"
    },
    "company-github": {
      "type": "http",
      "url": "https://github.company.com/api/mcp"
    }
  }
}
```

**Policy-based allowlists** let users add their own servers but restrict which ones are permitted:

```json
{
  "allowedMcpServers": [
    { "serverUrl": "https://*.company.com/*" },
    { "serverCommand": ["npx", "-y", "@approved/server"] }
  ]
}
```

This approach gives teams flexibility while preventing employees from connecting to unauthorized or potentially malicious MCP servers.

---

## Understanding MCP's Role in Claude Code

MCP is not a feature of Claude Code — it is the integration architecture that makes Claude Code extensible. Every external tool Claude Code can use, every database it can query, every third-party service it can interact with — all of these are MCP connections.

The built-in tools (Read, Edit, Bash, Glob, Grep) are Claude Code's core capabilities for working with local files and commands. MCP is how you extend Claude into your broader technical ecosystem.

A well-configured Claude Code setup with the right MCP servers is qualitatively more capable than Claude Code with only its built-in tools. The difference between "Claude can read files" and "Claude can read files, query your database, check your error tracker, update your task tracker, and search your documentation" is entirely in MCP configuration.

---

**This concludes Part IV of the book.** The chapters ahead cover context management, token optimization, memory architecture, and real-world team workflows.

---

**Coming up:** [Chapter 12 — Browser MCP](./12-browser-mcp.md) — Web browsing, automation with Playwright, and scraping patterns.
