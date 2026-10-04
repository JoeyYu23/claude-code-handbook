# MCP Server Registry

> Verified on 2026-10-04 with Claude Code 2.1.289.

A short, checked list of MCP servers that exist today. Each remote URL below was read from the vendor's own documentation on 2026-10-04. This is not a ranking and not an endorsement. Before you decide whether you need a server at all, read [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill); for setup in practice, read [MCP in Practice](/en/book2-advanced/12-mcp-in-practice).

## Where to look first

- The official MCP Registry at https://registry.modelcontextprotocol.io/ is the discovery index for published servers.
- The `modelcontextprotocol/servers` repository now maintains seven reference servers (Everything, Fetch, Filesystem, Git, Memory, Sequential Thinking, Time). Thirteen others were moved to a `servers-archived` repository, including GitHub, GitLab, Google Drive, PostgreSQL, Puppeteer, Redis, Sentry, Slack and SQLite. The first edition of this appendix listed the archived PostgreSQL server; do not install it for new work.
- Claude Code reference: https://code.claude.com/docs/en/mcp

## The spec changed in July 2026

The MCP specification dated 2026-07-28 turns the protocol from a stateful session into stateless request/response, according to the [MCP project's release post](https://blog.modelcontextprotocol.io/posts/2026-07-28/). What it says changed:

- The `initialize` handshake and the `Mcp-Session-Id` header are retired. Each request carries the protocol version, client identity and capabilities itself, so any request can go to any server instance behind a load balancer.
- Server-initiated asks (elicitation, sampling, roots) are replaced by a multi-round-trip pattern: the server returns an `input_required` result and the client retries with the answers.
- New `Mcp-Method` and `Mcp-Name` HTTP headers let gateways route and authorize without parsing JSON; list responses can carry cache hints (`ttlMs`, `cacheScope`).
- Authorization tightens (issuer validation per RFC 9207) and Dynamic Client Registration is deprecated in favor of Client ID Metadata Documents. Roots, Sampling, Logging and the legacy HTTP+SSE transport are deprecated with a 12-month window.

What this means for you: remote servers are getting easier to host and scale, and servers you already use will migrate on their own schedule. Vercel, for example, has announced support in its changelog. I could not confirm from Claude Code's documentation which spec revisions your installed version speaks, so if a server stops connecting after an update, check both sides' versions first. Simon Willison's post [Stateless MCP has recaptured my interest](https://simonwillison.net/2026/Jul/31/stateless-mcp/) (2026-07-31) is a readable take on why the change matters.

## Adding a server

```bash
# Remote (recommended): HTTP transport
claude mcp add --transport http <name> <url>

# Local process: everything after -- is the server command
claude mcp add --transport stdio <name> -- <command> [args...]

claude mcp list
claude mcp get <name>
claude mcp remove <name>
```

Authenticate OAuth servers by running `/mcp` inside Claude Code, or `claude mcp login <name>`. SSE (`--transport sse`) is deprecated in Claude Code's docs; use HTTP where the vendor offers it. Scopes are `local` (default, private to you in this project), `project` (shared through `.mcp.json`) and `user` (all your projects). Put secrets in environment variables; `.mcp.json` supports `${VAR}` expansion.

## Servers checked on 2026-10-04

All remote servers use OAuth unless noted. "Docs say" means the command is quoted from the vendor page.

### Code, issues and projects

| Server | Endpoint or command | Notes |
| --- | --- | --- |
| GitHub | `https://api.githubcopilot.com/mcp/` | OAuth (recommended) or a personal access token in an `Authorization: Bearer` header. Maintained at github.com/github/github-mcp-server. |
| Linear | `claude mcp add --transport http linear-server https://mcp.linear.app/mcp` | Docs say. |
| Atlassian (Jira, Confluence) | `https://mcp.atlassian.com/v2/mcp` | The docs describe a v2 endpoint and say that on 2027-03-01 existing v1 usage will start to expose v2 tools. Old `/sse` URLs from the first edition are not confirmed; use v2. |
| Asana | `https://mcp.asana.com/v2/mcp` | The beta `/sse` server is documented as shut down on 2026-05-11, so first-edition configs pointing at it no longer work. |
| Notion | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | Docs say. Authenticate with `/mcp`. |
| Sentry | `https://mcp.sentry.dev/mcp` | Docs show an organization- and project-scoped form: `https://mcp.sentry.dev/mcp/{organizationSlug}/{projectSlug}`. |
| Slack | `https://mcp.slack.com/mcp` | Only apps published in the Slack Marketplace or internal apps may use MCP, so an unlisted client may be refused. |

### Browsers and design

| Server | Endpoint or command | Notes |
| --- | --- | --- |
| Playwright | `npx @playwright/mcp@latest` (docs show `claude mcp add playwright npx @playwright/mcp@latest`) | Local browser automation, from Microsoft. The stdio form from the section above, `claude mcp add --transport stdio playwright -- npx @playwright/mcp@latest`, follows the syntax in Claude Code's docs. |
| Figma | `claude mcp add --transport http figma https://mcp.figma.com/mcp` | Docs say. Figma states that only clients in its MCP catalog can connect. |

### Data and infrastructure

| Server | Endpoint or command | Notes |
| --- | --- | --- |
| Supabase | `claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp"` | Supabase's own page warns about prompt injection from database content and recommends project scoping and read-only mode; avoid pointing it at production data. |
| Neon | `https://mcp.neon.tech/mcp` | Neon's page also offers `npx neon@latest mcp` for setup. |
| DBHub | `npx @bytebase/dbhub@latest --dsn "<connection string>"` | Open source, from Bytebase. Supports PostgreSQL, MySQL, SQL Server, MariaDB, Oracle and SQLite, with read-only mode, row limits and query timeouts. Use a least-privilege database user. |
| Cloudflare | `https://mcp.cloudflare.com/mcp` (whole API) and per-product servers such as `https://docs.mcp.cloudflare.com/mcp`, `https://observability.mcp.cloudflare.com/mcp`, `https://bindings.mcp.cloudflare.com/mcp` | Cloudflare publishes a catalog of managed servers; see its page. |
| Vercel | `claude mcp add --transport http vercel https://mcp.vercel.com` | Docs say. Vercel allows only clients it has reviewed; Claude Code is on its list. |
| Grafana | `uvx mcp-grafana` (also Docker and binary) | Runs locally against your Grafana instance; open source at github.com/grafana/mcp-grafana. |

### Payments

| Server | Endpoint or command | Notes |
| --- | --- | --- |
| Stripe | `claude mcp add --transport http stripe https://mcp.stripe.com/` | OAuth, or an Agent API key in a bearer header. Stripe says that from 2026-10-31 it stops accepting full-access or untagged restricted keys, and it requires human confirmation for actions such as refunds. |

## Left out on purpose

I did not re-verify these first-edition entries, so they are dropped rather than carried over: GitLab, AWS, GCP, MongoDB, Turso, Nx, Browserbase, Fly.io, PayPal, HubSpot, Salesforce, Datadog, PagerDuty, Shortcut, S3 and Google Cloud Storage. Check the MCP Registry or the vendor before relying on any of them.

## Security checklist

- Read what the server can read and change before you connect it. A connected MCP server acts with your account's permissions.
- Prefer OAuth and read-only credentials; give databases a dedicated least-privilege user.
- Treat any text a server returns (rows, tickets, web pages) as untrusted input. Prompt injection through tool results is the main risk vendors themselves warn about.
- Review a project's `.mcp.json` before approving it; project servers require workspace trust.
- Remove what you no longer use: `claude mcp remove <name>`.

## Build your own

Use the official SDKs (TypeScript, Python, Go and C# were updated for the 2026-07-28 spec, per the release post), then register the result with `claude mcp add`. The walkthrough is in [MCP in Practice](/en/book2-advanced/12-mcp-in-practice).

### Check that it worked

Run `claude mcp list`. A healthy server shows as connected. Inside a session, `/mcp` lists each server with its tools and lets you authenticate; ask Claude to call one tool from the server and confirm the answer matches what you see in the vendor's own UI.

## Sources

- Model Context Protocol servers repository, modelcontextprotocol (accessed 2026-10-04): https://github.com/modelcontextprotocol/servers
- Official MCP Registry (accessed 2026-10-04): https://registry.modelcontextprotocol.io/
- MCP 2026-07-28 specification release, MCP blog, 2026-07-28: https://blog.modelcontextprotocol.io/posts/2026-07-28/
- Simon Willison, "Stateless MCP has recaptured my interest", 2026-07-31: https://simonwillison.net/2026/Jul/31/stateless-mcp/
- Connect Claude Code to tools via MCP, Anthropic: https://code.claude.com/docs/en/mcp
- GitHub MCP server: https://github.com/github/github-mcp-server
- Linear MCP: https://linear.app/docs/mcp
- Atlassian Rovo MCP server getting started: https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/
- Asana MCP server: https://developers.asana.com/docs/using-asanas-mcp-server
- Notion MCP: https://developers.notion.com/guides/mcp/get-started-with-mcp
- Sentry MCP: https://mcp.sentry.dev/
- Slack MCP server: https://docs.slack.dev/ai/mcp-server
- Playwright MCP: https://github.com/microsoft/playwright-mcp
- Figma MCP server: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Supabase MCP: https://supabase.com/docs/guides/getting-started/mcp
- Neon MCP server: https://neon.com/docs/ai/neon-mcp-server
- DBHub: https://github.com/bytebase/dbhub
- Cloudflare managed MCP servers: https://developers.cloudflare.com/agents/model-context-protocol/mcp-servers-for-cloudflare/
- Vercel MCP (page last updated 2026-09-15): https://vercel.com/docs/agent-resources/vercel-mcp
- Grafana MCP: https://github.com/grafana/mcp-grafana
- Stripe MCP: https://docs.stripe.com/mcp
