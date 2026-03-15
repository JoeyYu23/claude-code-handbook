# Chapter 14: Building Custom MCP Servers

## When to Build Your Own

The MCP registry contains hundreds of servers for common tools: GitHub, Slack, Jira, Notion, Stripe, databases, and more. For most integrations, the right move is to use an existing server.

Build a custom MCP server when:

- Your company has internal APIs or services that no public server covers
- You need to wrap proprietary tooling or a private data store
- You want to encapsulate complex business logic as a tool Claude can call
- An existing server exists but does not expose the specific operations you need
- You want to give Claude access to a command-line tool with a specific interface

Custom MCP servers are also the right solution when you want to package reusable capabilities for your team — a server that connects to your internal monitoring system, queries your feature flag service, or wraps your deployment pipeline.

---

## MCP Architecture Overview

Every MCP server, regardless of what it does, has the same basic structure:

- It listens for requests over a **transport** (stdio or HTTP)
- It responds to an `initialize` handshake that declares its capabilities
- It exposes **tools** (callable functions), **resources** (readable data), and/or **prompts** (reusable instruction templates)
- Claude Code discovers and calls these through the MCP protocol

The simplest mental model: an MCP server is a local or remote service that Claude treats like a programmable API. You define what tools it has, what parameters those tools accept, and what they return. Claude decides when to use them.

---

## TypeScript SDK Walkthrough

The official MCP SDK for TypeScript (`@modelcontextprotocol/sdk`) is the most ergonomic way to build a server. Start with a minimal working example and expand from there.

**Setup:**

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install --save-dev typescript @types/node tsx
npx tsc --init
```

**Minimal server (`src/index.ts`):**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-company-tools",
  version: "1.0.0",
});

// Define a tool
server.tool(
  "get_deploy_status",
  "Get the current deployment status of a service",
  {
    service: z.string().describe("The service name to check"),
    environment: z.enum(["dev", "staging", "prod"]).describe("The target environment"),
  },
  async ({ service, environment }) => {
    // Your actual implementation here
    const status = await checkDeployStatus(service, environment);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }
);

// Connect to stdio transport and start listening
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Add a script to `package.json`:**

```json
{
  "scripts": {
    "start": "tsx src/index.ts"
  }
}
```

**Register the server with Claude Code:**

```bash
claude mcp add --transport stdio my-tools -- npm --prefix /absolute/path/to/my-mcp-server run start
```

---

## Defining Tools, Resources, and Prompts

### Tools

Tools are callable functions — the most common MCP primitive. Each tool has a name, description, input schema, and handler function.

The description is critical: it tells Claude when to use the tool. Write it as you would write documentation for a human developer.

```typescript
server.tool(
  "search_internal_docs",
  "Search the company's internal documentation and knowledge base. " +
  "Use this when the user asks questions about internal processes, " +
  "company policies, or internal APIs.",
  {
    query: z.string().describe("The search query"),
    category: z.enum(["engineering", "product", "hr", "all"])
      .optional()
      .describe("Limit results to a specific category"),
    limit: z.number().min(1).max(20).default(5)
      .describe("Number of results to return"),
  },
  async ({ query, category, limit }) => {
    const results = await searchDocs(query, { category, limit });
    return {
      content: [
        {
          type: "text",
          text: results.map(r => `**${r.title}**\n${r.excerpt}\n${r.url}`).join("\n\n"),
        },
      ],
    };
  }
);
```

### Resources

Resources expose readable data that Claude can reference, similar to how files work. They are identified by URIs and can be static or dynamic.

```typescript
server.resource(
  "deployment-runbook",
  "runbook://deployments/standard",
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: await fetchRunbook("deployments/standard"),
        },
      ],
    };
  }
);

// Resource with dynamic listing
server.resourceTemplate(
  "service-runbook",
  new ResourceTemplate("runbook://{service}", { list: undefined }),
  async (uri, { service }) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: await fetchRunbook(`services/${service}`),
        },
      ],
    };
  }
);
```

### Prompts

Prompts are reusable instruction templates that become slash commands in Claude Code, prefixed as `/mcp__servername__promptname`.

```typescript
server.prompt(
  "incident_response",
  "Start an incident response workflow for a production issue",
  {
    service: z.string().describe("The affected service"),
    severity: z.enum(["sev1", "sev2", "sev3"]),
  },
  async ({ service, severity }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are the on-call engineer responding to a ${severity} incident affecting ${service}.

Start by checking the service status, recent deployments, and error rates.
Then guide me through the standard incident response checklist.`,
          },
        },
      ],
    };
  }
);
```

Users invoke this in Claude Code as `/mcp__my-company-tools__incident_response`.

---

## Transport Options: stdio vs HTTP

**stdio (standard input/output):**
The server runs as a child process. Claude Code spawns it, communicates over stdin/stdout, and terminates it when done. This is the right choice for:
- Local tools that need filesystem or local network access
- Tools wrapping command-line utilities
- Tools that should not be accessible over the network

```bash
# stdio registration
claude mcp add --transport stdio my-tools -- node /path/to/server/dist/index.js
```

**HTTP (Streamable HTTP):**
The server runs as a persistent HTTP service. This is the right choice for:
- Tools that need to serve multiple Claude Code instances
- Tools deployed on remote infrastructure
- Tools that need to maintain persistent state between calls
- Team-shared tools running on internal company servers

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
const transport = new StreamableHTTPServerTransport({ path: "/mcp" });

app.use("/mcp", transport.handler());

server.connect(transport);

app.listen(3001, () => {
  console.log("MCP server running on http://localhost:3001/mcp");
});
```

```bash
# HTTP registration
claude mcp add --transport http my-remote-tools http://localhost:3001/mcp
```

For team-deployed HTTP servers, add authentication:

```bash
claude mcp add --transport http my-remote-tools https://internal.company.com/mcp \
  --header "Authorization: Bearer ${INTERNAL_MCP_TOKEN}"
```

---

## Testing and Debugging MCP Servers

**Local testing with the MCP Inspector:**

```bash
npx @modelcontextprotocol/inspector tsx src/index.ts
```

This opens a browser-based interface where you can browse your server's tools, call them with test inputs, and inspect responses — without needing Claude Code running.

**Within Claude Code:**

```text
/mcp
# Shows all connected servers and their tools

# Test a specific tool
Use the get_deploy_status tool to check the "api-gateway" service in "staging".
```

**Enable verbose logging:**

```bash
MCP_TIMEOUT=30000 claude --mcp-debug
```

This shows MCP communication details: what tools Claude is calling, what parameters it passes, and what responses come back.

**Common debugging patterns:**

Add structured logging in your tool handlers:

```typescript
server.tool("my_tool", "Description", { param: z.string() }, async ({ param }) => {
  console.error(`[my_tool] Called with param: ${param}`); // stderr goes to MCP logs

  try {
    const result = await doWork(param);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (error) {
    // Return errors as tool results, not thrown exceptions
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});
```

Use `console.error` (not `console.log`) for debug output in stdio servers — stdout is reserved for MCP protocol messages.

---

## Deployment and Distribution

**For personal use:**
Keep the server source in a local directory and register it with local scope. No special deployment needed.

**For team use (stdio):**
- Check the server code into a shared repository
- Have team members clone it and register it locally
- Or package it as an npm package and install via `npx`

**For team use (HTTP):**
- Deploy to your internal infrastructure (same options as any Node.js service)
- Use project scope and commit the `.mcp.json` with the HTTP URL (not credentials)
- Store auth tokens in environment variables on each developer's machine

**As an npm package:**
If you want others to use your server via `npx`, publish it to npm:

```json
{
  "name": "@yourcompany/mcp-internal-tools",
  "version": "1.0.0",
  "bin": {
    "mcp-internal-tools": "dist/index.js"
  }
}
```

Then team members install with:
```bash
claude mcp add --transport stdio company-tools -- npx -y @yourcompany/mcp-internal-tools
```

**Plugin bundling:**
For the tightest integration, bundle your MCP server with a Claude Code plugin (`.mcp.json` at the plugin root). This way, enabling the plugin automatically starts the server — no per-developer registration required.

---

## A Complete Working Example

Here is a minimal but complete MCP server that wraps an internal feature flag service:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "feature-flags",
  version: "1.0.0",
});

const FLAGS_API = process.env.FLAGS_API_URL ?? "http://localhost:8080";
const FLAGS_TOKEN = process.env.FLAGS_API_TOKEN;

server.tool(
  "list_flags",
  "List all feature flags and their current enabled/disabled status",
  { environment: z.enum(["dev", "staging", "prod"]) },
  async ({ environment }) => {
    const response = await fetch(`${FLAGS_API}/flags?env=${environment}`, {
      headers: { Authorization: `Bearer ${FLAGS_TOKEN}` },
    });
    const flags = await response.json();
    const lines = flags.map((f: any) => `${f.enabled ? "ON " : "OFF"} ${f.name}: ${f.description}`);
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "get_flag",
  "Check whether a specific feature flag is enabled",
  {
    flag_name: z.string(),
    environment: z.enum(["dev", "staging", "prod"]),
  },
  async ({ flag_name, environment }) => {
    const response = await fetch(`${FLAGS_API}/flags/${flag_name}?env=${environment}`, {
      headers: { Authorization: `Bearer ${FLAGS_TOKEN}` },
    });
    if (!response.ok) {
      return { content: [{ type: "text", text: `Flag not found: ${flag_name}` }], isError: true };
    }
    const flag = await response.json();
    return {
      content: [{ type: "text", text: `Flag "${flag_name}" is ${flag.enabled ? "ENABLED" : "DISABLED"} in ${environment}` }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

Register it:
```bash
claude mcp add --transport stdio --scope project feature-flags \
  --env FLAGS_API_URL=http://flags.internal.company.com \
  --env FLAGS_API_TOKEN=your_token_here \
  -- npx tsx /path/to/feature-flags/src/index.ts
```

Now any developer on the team can ask:
```text
Which feature flags are currently enabled in staging?
Is the "new-checkout-flow" flag enabled in production?
```

---

**Next up:** [Chapter 15 — Context Window Management](./15-context-management.md) — Understanding and managing the context window for long sessions.
