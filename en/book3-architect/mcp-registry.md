# Appendix B: MCP Server Registry

A curated reference of popular MCP servers for Claude Code. For the full live registry, run `claude mcp add` and browse, or visit the [MCP server registry](https://github.com/modelcontextprotocol/servers).

---

## Development Tools

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **GitHub** | Read/write issues, PRs, repos, code reviews. | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | Automate PR creation, issue triage, code review |
| **GitLab** | Manage GitLab issues, MRs, pipelines. | `claude mcp add --transport stdio gitlab -- npx -y @gitbeaker/mcp` | GitLab-based teams; CI/CD integration |
| **Sentry** | Query error events, stack traces, releases. | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | Debug production errors; trace error origins |
| **Playwright** | Browser automation, screenshots, forms, JS execution. | `claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest` | E2E testing, UI verification, visual regression |
| **Browserbase** | Cloud browser automation with session management. | See [browserbase.com/docs](https://docs.browserbase.com) | Scraping, automated browser testing at scale |
| **Nx** | Monorepo graph analysis, affected project detection. | `claude mcp add --transport stdio nx -- npx -y @nx/mcp` | Large monorepo workflows, dependency analysis |

---

## Databases

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **DBHub (PostgreSQL/MySQL/SQLite)** | Query any SQL database, explore schema, analyze data. | `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://user:pass@host/db"` | General SQL database access |
| **Postgres (official)** | PostgreSQL-specific, exposes schema as resources. | `claude mcp add --transport stdio postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://user:pass@host/db` | PostgreSQL schema exploration |
| **MongoDB** | MongoDB query, aggregation, collection management. | `claude mcp add --transport stdio mongo -- npx -y @mongodb-js/mcp-server-mongodb` | Document database access |
| **Supabase** | Supabase database, auth, storage, edge functions. | `claude mcp add --transport http supabase https://mcp.supabase.com` | Supabase projects |
| **Neon** | Neon serverless Postgres with branching. | See [neon.tech/docs](https://neon.tech/docs/ai/mcp) | Serverless Postgres development |
| **Turso** | LibSQL/SQLite at the edge. | See [turso.tech](https://turso.tech) | Edge database access |

---

## Cloud Providers

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **AWS** | Query AWS services, manage resources, read CloudWatch logs. | `claude mcp add --transport stdio aws -- npx -y @aws/mcp-server-aws` | AWS infrastructure management |
| **Cloudflare** | Manage Workers, KV, R2, D1, Pages. | `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/sse` | Cloudflare-based deployments |
| **Vercel** | Deploy, manage projects, read logs, environment variables. | `claude mcp add --transport http vercel https://mcp.vercel.com/sse` | Vercel deployment management |
| **Fly.io** | Manage apps, secrets, deployments on Fly. | See [fly.io/docs](https://fly.io/docs) | Fly.io deployment |
| **GCP** | Google Cloud resource management. | `claude mcp add --transport stdio gcp -- npx -y @google-cloud/mcp-server` | GCP infrastructure |

---

## Project Management

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Linear** | Read/write Linear issues, projects, cycles. | `claude mcp add --transport http linear https://mcp.linear.app/mcp` | Linear-based team workflows |
| **Jira** | Read/write Jira issues, sprints, boards. | `claude mcp add --transport http jira https://mcp.atlassian.com/rest/mcp/sse` | Atlassian Jira workflows |
| **Asana** | Read/write Asana tasks, projects, teams. | `claude mcp add --transport sse asana https://mcp.asana.com/sse` | Asana task management |
| **Notion** | Read/write Notion pages, databases, blocks. | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | Notion-based documentation/PM |
| **GitHub Projects** | GitHub project boards and issues (via GitHub MCP). | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | GitHub Projects-based workflows |
| **Shortcut** | Read/write Shortcut stories, epics, sprints. | See [shortcut.com](https://shortcut.com) | Shortcut-based teams |

---

## Communication

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Slack** | Read channels, post messages, search conversations. | `claude mcp add --transport http slack https://mcp.slack.com/mcp` | Slack-based team communication |
| **Gmail** | Read, send, and manage Gmail email. | `claude mcp add --transport http gmail https://mcp.gmail.com` | Email automation, digest creation |
| **Google Calendar** | Read/write calendar events, check availability. | See [Google MCP docs](https://developers.google.com/workspace/mcp) | Scheduling automation |
| **SendGrid** | Send transactional email, manage templates. | `claude mcp add --transport stdio sendgrid -- npx -y @sendgrid/mcp` | Email integration in apps |

---

## Productivity and Knowledge

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Google Drive** | Read/write Google Docs, Sheets, Slides, Drive files. | `claude mcp add --transport stdio gdrive -- npx -y @modelcontextprotocol/server-gdrive` | Document and spec access |
| **Obsidian** | Read/write Obsidian vault notes. | `claude mcp add --transport stdio obsidian -- npx -y mcp-obsidian --vault /path/to/vault` | Personal knowledge base access |
| **Confluence** | Read/write Confluence pages and spaces. | `claude mcp add --transport http confluence https://mcp.atlassian.com/rest/mcp/sse` | Atlassian documentation |
| **Figma** | Access Figma designs, components, comments. | `claude mcp add --transport http figma https://mcp.figma.com/sse` | Design-to-code workflows |

---

## Payments and Business

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Stripe** | Query transactions, customers, invoices, subscriptions. | `claude mcp add --transport http stripe https://mcp.stripe.com` | Payment and billing integration |
| **PayPal** | Query orders, payments, subscriptions. | `claude mcp add --transport http paypal https://mcp.paypal.com/mcp` | PayPal integration |
| **HubSpot** | CRM contacts, deals, companies, activities. | `claude mcp add --transport http hubspot https://mcp.hubspot.com/anthropic` | CRM-driven development |
| **Salesforce** | Query SFDC objects, reports, custom objects. | See [Salesforce MCP](https://developer.salesforce.com/mcp) | Salesforce integration |

---

## File Systems and Storage

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Filesystem** | Read/write files with configurable scope. | `claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem /path/to/dir` | Controlled file access beyond working dir |
| **AWS S3** | Read/write S3 buckets and objects. | `claude mcp add --transport stdio s3 -- npx -y @aws/mcp-server-aws-s3` | S3 object management |
| **Google Cloud Storage** | Read/write GCS buckets and objects. | See [GCP MCP docs](https://cloud.google.com/mcp) | GCS storage integration |

---

## Observability and Monitoring

| Server | What It Does | Install Command | Use Case |
|--------|-------------|-----------------|----------|
| **Sentry** | Error events, stack traces, release tracking. | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | Production error investigation |
| **Datadog** | Metrics, logs, traces, monitors, dashboards. | See [Datadog MCP](https://docs.datadoghq.com/integrations/mcp/) | Full observability stack |
| **Grafana** | Query dashboards, explore metrics and logs. | `claude mcp add --transport http grafana https://mcp.grafana.com` | Metrics-driven debugging |
| **PagerDuty** | Read incidents, escalations, on-call schedules. | See [PagerDuty MCP](https://developer.pagerduty.com/mcp) | Incident response workflows |

---

## Scope Selection Quick Reference

```bash
# Local (default) — private to you in this project
claude mcp add --scope local ...

# Project — shared with team via .mcp.json (never include credentials)
claude mcp add --scope project ...

# User — available across all your projects
claude mcp add --scope user ...
```

**Rule of thumb:**
- Anything with credentials → `local`
- Shared tools your whole team uses → `project` (store credentials in env vars, not in the config)
- Personal utilities you use everywhere → `user`

---

## Security Checklist for MCP Servers

Before adding any MCP server to your workflow:

```
Before installing:
☐ Server is from a known organization or has verifiable open-source code
☐ You understand what data the server can read or modify
☐ Production/sensitive connections use read-only credentials

When configuring:
☐ Credentials passed via --env flags, not hardcoded in commands
☐ Database connections use a dedicated, least-privilege user
☐ Project-scope .mcp.json reviewed by team before committing

Ongoing maintenance:
☐ Update MCP server packages regularly
☐ Remove servers no longer in use: `claude mcp remove <name>`
☐ Rotate API keys used by MCP servers quarterly
```

---

## Installing from Claude Desktop

If you have already configured MCP servers in Claude Desktop, import them to Claude Code:

```bash
claude mcp add-from-claude-desktop
```

Select which servers to import interactively. Works on macOS and WSL.

---

## Building Your Own

When no existing server meets your needs, build a custom MCP server. See [Chapter 14 — Building Custom MCP Servers](/en/book2-advanced/14-custom-mcp) in Book 2.

**Quick-start template:**

```bash
# 1. Initialize project
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod

# 2. Create server.js
cat > server.js << 'EOF'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool(
  "my_tool",
  "Description of what this tool does",
  { input: z.string().describe("The input parameter") },
  async ({ input }) => ({
    content: [{ type: "text", text: `Processed: ${input}` }]
  })
);

await server.connect(new StdioServerTransport());
EOF

# 3. Register with Claude Code
claude mcp add --transport stdio my-server -- node server.js
```

Community MCP servers: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
