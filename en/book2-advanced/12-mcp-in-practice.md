# MCP in Practice

> Verified on 2026-10-04 with Claude Code 2.1.289.

The Model Context Protocol (MCP) is how Claude Code talks to tools that live outside it: a database, an issue tracker, a browser, your company's internal API. An **MCP server** offers tools (functions Claude can call), resources (data you reference with `@server:protocol://path`) and prompts (which appear in the `/` menu as `/server:prompt (MCP)`). Claude Code is the **client**. The server can be a local process that Claude Code starts and talks to over stdin/stdout (**stdio**), or a remote service it reaches over **HTTP**.

If you are still deciding whether a capability should be an MCP server at all, read [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill) first. This chapter assumes you have decided, and covers what changed in the protocol this year, adding and managing servers, a database example, and writing a small server of your own.

## What the 2026-07-28 spec changed

On 2026-07-28 the MCP maintainers released the largest revision since launch. The headline is a stateless core:

- **No handshake, no session.** The `initialize`/`initialized` exchange and the `Mcp-Session-Id` header are gone. Every request carries its protocol version, client identity and client capabilities in `_meta`. A client that wants capabilities up front can call a new, optional `server/discover`.
- **Routable headers.** HTTP requests carry `Mcp-Method` and `Mcp-Name`, so a gateway, rate limiter or firewall can route and meter without parsing JSON.
- **Cacheable lists.** `tools/list` and friends return `ttlMs` and `cacheScope`, in a deterministic order, so clients can cache tool catalogs.
- **Multi Round-Trip Requests.** A tool that needs something from the user mid-call returns `resultType: "input_required"`; the client retries with the answers. This replaces server-initiated requests that needed a held-open stream.
- **Auth hardening.** Issuer validation (RFC 9207), credentials bound to their issuer, and Dynamic Client Registration deprecated in favour of Client ID Metadata Documents.
- **Deprecations.** Roots, Sampling, Logging and the old HTTP+SSE transport, each with at least twelve months' notice.

For a server author, the practical gain is that any request can land on any instance behind a plain load balancer. If your server needs state across calls, the maintainers suggest minting an explicit handle from one tool and having the model pass it back as an argument, rather than hiding state in the transport.

For a Claude Code user, most of this is invisible. Claude Code ships two MCP client runtimes: v1 on the 1.x TypeScript SDK, and v2 on SDK 2.0, which adds the new revision. Current versions pick v2 in most setups (the docs list exactly which) and ask each HTTP server whether it speaks 2026-07-28, falling back to the older handshake when it does not. You only need to care in a few cases:

- **Channels** (servers that push messages into a session) cannot run over the new revision, so a channel server that negotiates it is not registered as a channel.
- **OAuth** on v2 sends credentials only to HTTPS token endpoints (or `localhost`), so a server on your LAN with a plain-`http://` token endpoint fails to sign in.
- To force a runtime while debugging, set `MCP_SDK_GENERATION=v1` or `v2`.

## Add a server

Run `claude mcp` commands in your shell, not inside a session. Start with a server that needs no account, the hosted search over Claude Code's own docs:

```bash
claude mcp add --transport http claude-code-docs https://code.claude.com/docs/mcp
claude mcp get claude-code-docs
```

`claude mcp get` health-checks the server; you should see `Status: ✔ Connected`.

### Remote HTTP servers

HTTP is the recommended transport for anything remote:

```bash
# A server that signs in with OAuth
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude mcp login sentry          # or run /mcp in a session and pick Authenticate

# A server that takes a token header
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

OAuth tokens are stored securely and refreshed automatically. `claude mcp login` works over SSH too: it prints the authorization URL when no browser is available. `claude mcp add` does not validate credentials, so a bad token only shows up later as a failed connection; `/mcp` then shows the HTTP status the server returned.

SSE is deprecated. Recent versions try HTTP first and fall back to SSE on their own, so `--transport http` works for most old SSE URLs. WebSocket servers (`"type": "ws"`) are added with `claude mcp add-json`.

### Local stdio servers

Everything after `--` is the command Claude Code runs:

```bash
claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable \
  -- npx -y airtable-mcp-server
```

Two traps. Without the `--`, Claude Code tries to parse the server's own flags as its own. And `--env` takes several `KEY=value` pairs, so if the server name comes right after it, the name is read as another pair; put another option, such as `--transport stdio`, in between.

Claude Code sets `CLAUDE_PROJECT_DIR` in the server's environment, so a local server can find the project root without depending on its working directory.

### Scopes

| Scope | Flag | Loads in | Stored in |
| :- | :- | :- | :- |
| Local (default) | `--scope local` | This project, just you | `~/.claude.json`, under the project's path |
| Project | `--scope project` | This project, everyone who clones it | `.mcp.json` at the repo root |
| User | `--scope user` | All your projects | `~/.claude.json` |

When the same name is defined in more than one place, local beats project beats user, then plugin servers, then claude.ai connectors; the winning entry is used whole, never merged.

A committed `.mcp.json` should hold no secrets. Use environment-variable expansion instead, with `${VAR}` or `${VAR:-default}`:

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": { "Authorization": "Bearer ${API_KEY}" }
    }
  }
}
```

Any JSON entry with a `url` also needs a `type`; without one, Claude Code treats it as a stdio server and skips it with an error. For safety, Claude Code reads its own and your cloud credentials (such as `ANTHROPIC_API_KEY`) as empty in a remote server's `url` and `headers`, so copy a credential into a variable with your own name if a server really needs it.

In an interactive session, Claude Code asks before connecting servers from a project's `.mcp.json` (`claude mcp reset-project-choices` forgets your answers). A `claude -p` run does not ask; it connects them. Use `--strict-mcp-config` with `--mcp-config` in scripts to load only the servers you name.

### Managing servers

```bash
claude mcp list                 # every server, with a health check
claude mcp get <name>           # details and status for one
claude mcp remove <name>        # add -s local|project|user if the name exists in several scopes
```

Inside a session, `/mcp` lists servers, their status and auth state; `/mcp reconnect all` reconnects everything after a network blip. `/context` shows how much context the MCP tools are using.

Two defaults keep MCP from flooding the context window. **Tool search** loads only tool names and server instructions at startup and fetches a tool's schema when Claude needs it (`ENABLE_TOOL_SEARCH=false` turns it off; `"alwaysLoad": true` on a server exempts it). **Output limits** warn when a single result passes 10,000 tokens and move results over 25,000 tokens to a file (`MAX_MCP_OUTPUT_TOKENS` changes the limit).

## A database example

Letting Claude query a database directly removes the copy-paste relay between you, your SQL client and the conversation. It is also one of the riskiest things you can connect, so the setup matters more than the server.

[DBHub](https://github.com/bytebase/dbhub) (`@bytebase/dbhub`) connects to PostgreSQL, MySQL and SQLite through a connection string:

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.example.com:5432/analytics"
```

Then ask questions in plain language:

```text
Show me the schema of the orders table, including indexes.
```

```text
Find customers who haven't ordered in 90 days. Show the SQL you ran.
```

```text
We just ran migration 0042. Check that every user now has a segment_id and the foreign key to users exists.
```

Claude reading the real schema instead of guessing column names is often the biggest win: the code it writes afterwards uses `account_id` when your column is `account_id`.

### Make it safe

1. **Use a read-only database user.** This is the control that holds even when the model, the prompt or the server misbehaves. In PostgreSQL:

   ```sql
   CREATE ROLE claude_readonly WITH LOGIN PASSWORD 'use-a-long-random-password';
   GRANT CONNECT ON DATABASE analytics TO claude_readonly;
   GRANT USAGE ON SCHEMA public TO claude_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO claude_readonly;
   ```

2. **Keep credentials out of git.** Add database servers at local scope, or reference `${DATABASE_URL}` from `.mcp.json` and keep the value in your environment.
3. **Point at a replica or a dev copy,** not the primary. A read-only user can still run a query that scans a billion rows; ask Claude to `EXPLAIN` before anything heavy.
4. **Remember where the rows go.** Query results enter the conversation and are sent to the model. For regulated data, use an anonymized copy.
5. **Allow only what you mean.** `mcp__db` in your allow rules approves every tool on that server; `mcp__db__<tool>` approves one.

## Write a small server

Build your own server when nothing existing covers your system, or when you want a narrower, safer interface than a general one. This example wraps one SQLite file with three read-only tools, using version 2 of the official Python SDK (the `mcp` package, 2.3.0 at the time of writing). It runs with `uv`, which reads the dependencies from the comment block at the top, so the whole server is one file.

```python
# /// script
# requires-python = ">=3.10"
# dependencies = ["mcp>=2.3,<3"]
# ///
"""A small read-only MCP server over one SQLite file."""
import os
import sqlite3
from typing import Annotated

from pydantic import Field
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations

DB_PATH = os.environ["SHOP_DB"]  # absolute path, set when you register the server
READ_ONLY = ToolAnnotations(readOnlyHint=True)

mcp = MCPServer(
    "shop-db",
    instructions="Read-only access to the shop database (customers, orders). "
    "Use it for questions about customers, orders and revenue.",
)


def connect() -> sqlite3.Connection:
    # mode=ro: SQLite itself refuses writes, whatever SQL the model sends.
    return sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)


def table_names(conn: sqlite3.Connection) -> list[str]:
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    return [r[0] for r in rows]


@mcp.tool(annotations=READ_ONLY)
def list_tables() -> list[str]:
    """List the tables in the shop database. Call this first if you don't know the schema."""
    with connect() as conn:
        return table_names(conn)


@mcp.tool(annotations=READ_ONLY)
def describe_table(
    table: Annotated[str, Field(description="Exact table name, as returned by list_tables")],
) -> list[dict]:
    """Return each column of a table with its type and whether it can be NULL."""
    with connect() as conn:
        if table not in table_names(conn):
            raise ToolError(f"Unknown table {table!r}. Call list_tables to see valid names.")
        rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    return [{"column": r[1], "type": r[2], "nullable": not r[3]} for r in rows]


@mcp.tool(annotations=READ_ONLY)
def run_query(
    sql: Annotated[str, Field(description="One SQLite SELECT statement. Writes are rejected.")],
    max_rows: Annotated[int, Field(ge=1, le=500, description="Maximum rows to return")] = 100,
) -> dict:
    """Run a read-only SQL query and return column names and up to max_rows rows."""
    try:
        with connect() as conn:
            cur = conn.execute(sql)
            rows = cur.fetchmany(max_rows + 1)
    except sqlite3.Error as exc:
        # A ToolError's message reaches the model, so it can fix its SQL and retry.
        raise ToolError(f"SQLite error: {exc}") from exc
    return {
        "columns": [d[0] for d in cur.description or []],
        "rows": [list(r) for r in rows[:max_rows]],
        "truncated": len(rows) > max_rows,
    }


if __name__ == "__main__":
    mcp.run()  # stdio transport by default
```

What each part is doing:

- **Type hints are the schema.** `max_rows: Annotated[int, Field(ge=1, le=500, ...)]` becomes a JSON Schema integer with bounds and a description. The SDK rejects out-of-range arguments before your function runs.
- **Every parameter has a description.** Claude reads these to fill in arguments. A missing description is the most common defect in published servers.
- **The safety lives below the model.** `mode=ro` makes SQLite refuse writes, so it does not matter what SQL arrives. The table name in `describe_table` is checked against the real list before it goes near a query string.
- **`ToolError` versus a crash.** Raise `ToolError` for failures you expect, and the model sees your message (`SQLite error: attempt to write a readonly database`) and can try again. Any other exception is treated as a crash: the model sees only `Error executing tool run_query`.
- **`readOnlyHint`** tells clients the tool does not change anything. It is a hint for clients and reviewers, not an enforcement mechanism.
- **Results are capped** and say when they were cut, so one careless `SELECT *` cannot flood the context.

Register it with absolute paths:

```bash
claude mcp add --env SHOP_DB=/abs/path/shop.db --transport stdio shop-db \
  -- uv run /abs/path/shop_db.py
```

When we registered it this way, `claude mcp list` showed `shop-db ... ✔ Connected`, and a headless session allowed only `mcp__shop-db` answered "what is the total of paid orders?" by calling the tools. A `delete from orders` sent to `run_query` came back as an error the model could read, and the table was untouched.

### Serve it over HTTP

To share one server with a team, run it over Streamable HTTP instead: change the last line to `mcp.run(transport="streamable-http")`, which serves `http://localhost:8000/mcp` by default, deploy it behind your usual authentication, and register it with `claude mcp add --transport http shop-db https://your-host/mcp`.

The stateless protocol is easy to see with `curl`. One request, no session:

```bash
curl -s -X POST http://localhost:8000/mcp \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "MCP-Protocol-Version: 2026-07-28" -H "Mcp-Method: tools/call" -H "Mcp-Name: list_tables" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_tables","arguments":{},
       "_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28",
                "io.modelcontextprotocol/clientCapabilities":{},
                "io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0"}}}}'
```

Against the server above this returns `"structuredContent":{"result":["customers","orders"]}`. Under the old protocol the same call needed an `initialize` request first and a session ID on every call after it.

The TypeScript SDK's 2.x line is published as separate packages (`@modelcontextprotocol/server`, `@modelcontextprotocol/client` and others) rather than the single 1.x `@modelcontextprotocol/sdk`. The SDK documentation and migration notes linked from the spec announcement cover the port. [Custom Tools](/en/book2-advanced/13-custom-tools) covers designing the tools themselves: names, descriptions, result shapes and testing.

## Sharing servers with a team

- **Per repository:** `--scope project` writes `.mcp.json`; commit it, with secrets as `${VAR}` references.
- **Across repositories:** package the server in a plugin. See [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods).
- **Across an organization:** administrators can deploy a fixed set with `managed-mcp.json` (`/Library/Application Support/ClaudeCode/` on macOS, `/etc/claude-code/` on Linux and WSL), provide remote servers alongside users' own with the `managedMcpServers` setting, or filter what users add:

  ```json
  {
    "allowedMcpServers": [
      { "serverUrl": "https://mcp.sentry.dev/*" },
      { "serverUrl": "https://*.internal.example.com/*" }
    ],
    "deniedMcpServers": [
      { "serverName": "dangerous-server" }
    ],
    "allowManagedMcpServersOnly": true
  }
  ```

  Without `allowManagedMcpServersOnly`, users can broaden the allowlist in their own settings. Denylists always apply.

Claude Code can also be a server: `claude mcp serve` exposes its tools to another MCP client over stdio. It prints nothing when it starts; a silent terminal means it is waiting for a client.

## Troubleshooting

| Symptom | Likely cause |
| :- | :- |
| `has a "url" but no "type"` | Add `"type": "http"` to the JSON entry |
| A stdio server rejects its own flags | Missing `--` before the server command |
| The server name shows up as an env var | Put another option between `--env` and the name |
| `401` with a `${ANTHROPIC_API_KEY}` header | Claude Code reads that variable as empty for remote servers; use your own variable name |
| Project server never connects | It is waiting for approval; open a session and accept it, or check `claude mcp list` for `Pending approval` |
| Tools missing in a script | Check `mcp_servers` and `mcp_server_errors` in the `system/init` event of `--output-format stream-json` |

### Check that it worked

1. `claude mcp list` shows each server as `✔ Connected`. A failed server shows the reason in `claude mcp get <name>`.
2. In a session, `/mcp` shows the server and its tools, and `/context` shows the MCP tools row.
3. Ask a question only the server can answer, such as "list the tables in shop-db", and confirm the transcript shows a call to `mcp__<server>__<tool>`.
4. For a database server, try one write through it. It should fail with a read-only error, and the data should be unchanged.

## Sources

- Connect Claude Code to tools via MCP, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/mcp
- Connect to MCP servers (quickstart), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/mcp-quickstart
- Control MCP server access for your organization, Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/managed-mcp
- `claude mcp --help` and `claude mcp add --help`, Claude Code 2.1.289, run 2026-10-04.
- "The 2026-07-28 Specification", David Soria Parra and Den Delimarsky, Model Context Protocol Blog, 2026-07-28. https://blog.modelcontextprotocol.io/posts/2026-07-28/
- "Stateless MCP has recaptured my interest", Simon Willison, 2026-07-31. https://simonwillison.net/2026/Jul/31/stateless-mcp/
- MCP Python SDK (`mcp` 2.3.0) README and source, Model Context Protocol, accessed 2026-10-04. https://github.com/modelcontextprotocol/python-sdk and https://py.sdk.modelcontextprotocol.io/
- DBHub, Bytebase, accessed 2026-10-04. https://github.com/bytebase/dbhub
