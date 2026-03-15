# Chapter 10: Custom Tool Creation

Claude Code's built-in tools — Read, Edit, Bash, Glob, Grep — cover most development tasks. But what about your Jira tickets? Your internal API? Your custom deployment system? The Model Context Protocol (MCP) is how you give Claude access to any tool or data source you can build an interface for.

This chapter covers building MCP tools from scratch, defining their schemas, testing them, and deploying them for team use.

---

## MCP as the Tool Extension Layer

MCP (Model Context Protocol) is an open standard that defines how AI models communicate with external tools and data sources. When you build an MCP server, you expose a set of tools that Claude can call just like it calls its built-in tools.

From Claude's perspective, an MCP tool is indistinguishable from a built-in tool. Claude sees the tool name, description, and parameter schema, calls it with arguments, and receives a result. The implementation — whether a Node.js server, a Python script, or a remote API — is invisible to Claude.

---

## MCP Server Architecture

An MCP server exposes three types of capabilities:

**Tools** — Functions Claude can call. These are the primary extension mechanism. A tool has a name, description, and parameter schema. When Claude calls a tool, the server executes the corresponding function and returns the result.

**Resources** — Data sources that Claude can read. Resources have URIs (like `file://path` or `db://table/row`) and can be referenced with `@` notation.

**Prompts** — Pre-defined prompt templates that appear as `/` commands in Claude Code.

For building custom tools, you will primarily work with the Tools capability.

---

## Building a Simple MCP Server

The MCP SDK is available for TypeScript/JavaScript and Python. Here is a complete working example in TypeScript — a server that wraps your internal task management system.

**Prerequisites:**

```bash
npm install @modelcontextprotocol/sdk
```

**Basic server structure:**

```typescript
// task-manager-mcp/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "task-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_task",
        description:
          "Create a new task in the task management system. Use when the user wants to track work items, bugs, or feature requests.",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Task title, max 200 characters",
              maxLength: 200,
            },
            description: {
              type: "string",
              description: "Detailed task description",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Task priority level",
            },
            assignee: {
              type: "string",
              description: "Username of the person to assign the task to",
            },
          },
          required: ["title", "priority"],
        },
      },
      {
        name: "list_tasks",
        description:
          "List tasks with optional filtering. Use to find tasks assigned to someone, tasks in a specific status, or tasks by priority.",
        inputSchema: {
          type: "object",
          properties: {
            assignee: {
              type: "string",
              description: "Filter by assignee username",
            },
            status: {
              type: "string",
              enum: ["open", "in_progress", "review", "done"],
              description: "Filter by task status",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "critical"],
              description: "Filter by priority",
            },
          },
          required: [],
        },
      },
      {
        name: "update_task_status",
        description:
          "Update the status of an existing task. Use after completing work or moving a task through the workflow.",
        inputSchema: {
          type: "object",
          properties: {
            task_id: {
              type: "string",
              description: "The task ID to update",
            },
            status: {
              type: "string",
              enum: ["open", "in_progress", "review", "done"],
              description: "New status for the task",
            },
          },
          required: ["task_id", "status"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "create_task": {
      // Replace with your actual API call
      const task = await createTask(args);
      return {
        content: [
          {
            type: "text",
            text: `Created task ${task.id}: "${task.title}"\nURL: https://tasks.company.com/t/${task.id}`,
          },
        ],
      };
    }

    case "list_tasks": {
      const tasks = await listTasks(args);
      const formatted = tasks
        .map(
          (t) =>
            `[${t.id}] ${t.priority.toUpperCase()} - ${t.title} (${t.status})`
        )
        .join("\n");
      return {
        content: [
          {
            type: "text",
            text: tasks.length > 0 ? formatted : "No tasks found matching criteria",
          },
        ],
      };
    }

    case "update_task_status": {
      await updateTaskStatus(args.task_id, args.status);
      return {
        content: [
          {
            type: "text",
            text: `Task ${args.task_id} updated to status: ${args.status}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Task Manager MCP server running");
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});

// Stub implementations — replace with real API calls
async function createTask(args: any) {
  return { id: "TASK-001", title: args.title };
}

async function listTasks(args: any) {
  return [];
}

async function updateTaskStatus(taskId: string, status: string) {}
```

**Build and test:**

```bash
npx tsc
node dist/index.js
```

The server communicates over stdio (stdin/stdout), which is the transport Claude Code uses for local MCP servers.

---

## Tool Schema Best Practices

A well-designed tool schema is the difference between Claude using your tool correctly and struggling with it. These rules make a significant difference:

**Write descriptions for Claude, not for humans.** The description is what Claude reads to decide when to use the tool. Make it explicit about trigger conditions:

```typescript
// Weak description
description: "Creates a Jira ticket"

// Strong description — tells Claude when to use it
description: "Creates a Jira issue for bug reports, feature requests, or tasks. Use whenever the user mentions creating a ticket, filing a bug, or tracking work in Jira. Returns the ticket URL."
```

**Enumerate valid values.** Use `enum` types wherever possible. This prevents Claude from guessing at values:

```typescript
// Without enum — Claude might guess wrong values
priority: { type: "string", description: "Priority level" }

// With enum — Claude always passes valid values
priority: {
  type: "string",
  enum: ["P0", "P1", "P2", "P3"],
  description: "Priority: P0=emergency, P1=high, P2=medium, P3=low"
}
```

**Add bounds to all numeric and string fields.** User-facing input always needs limits:

```typescript
title: {
  type: "string",
  maxLength: 200,
  description: "Task title, required"
}

limit: {
  type: "integer",
  minimum: 1,
  maximum: 100,
  default: 20,
  description: "Maximum number of results to return"
}
```

**Mark required fields explicitly.** Only list fields in `required` that truly must be present:

```typescript
{
  type: "object",
  properties: {
    task_id: { type: "string", description: "Required task ID" },
    comment: { type: "string", description: "Optional comment to add" }
  },
  required: ["task_id"]
  // comment is optional — not in required
}
```

**Return structured, parseable output.** Claude reads your tool output as text. Make it easy to parse:

```typescript
// Hard to parse
return { content: [{ type: "text", text: "Done" }] };

// Easy to parse
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      success: true,
      task_id: "TASK-001",
      url: "https://tasks.company.com/t/TASK-001",
      created_at: new Date().toISOString()
    }, null, 2)
  }]
};
```

---

## Adding the Server to Claude Code

Once your server is built:

```bash
# Register it for your personal use
claude mcp add --transport stdio task-manager -- node /path/to/task-manager-mcp/dist/index.js

# Register it for the project (stored in .mcp.json, committed to git)
claude mcp add --transport stdio task-manager --scope project -- node /path/to/task-manager-mcp/dist/index.js

# With environment variables
claude mcp add --transport stdio task-manager \
  --env TASKS_API_KEY=your-key-here \
  -- node /path/to/task-manager-mcp/dist/index.js
```

After adding, verify it is running:

```text
/mcp
```

You should see `task-manager` in the list with a status indicator.

---

## Testing Custom Tools

Before sharing your MCP server, test it thoroughly.

**Unit test the handler functions directly.** Your tool handlers are plain functions — test them without the MCP layer:

```typescript
// task-manager.test.ts
import { handleCreateTask, handleListTasks } from './handlers';

test('createTask returns id and url', async () => {
  const result = await handleCreateTask({
    title: "Test task",
    priority: "medium"
  });
  expect(result.content[0].text).toContain("TASK-");
  expect(result.content[0].text).toContain("tasks.company.com");
});

test('listTasks with no filters returns all tasks', async () => {
  const result = await handleListTasks({});
  // Should not throw and should return content
  expect(result.content).toBeDefined();
});
```

**Integration test with Claude.** The most valuable test is using the tool in a real Claude Code session and verifying it behaves as expected:

```text
Create a task titled "Test MCP integration" with priority high.
Then list all high priority tasks to confirm it appears.
Then mark it as done.
```

**Test edge cases explicitly.** Missing required fields, invalid enum values, and large inputs should all return helpful errors, not crash the server.

---

## Building an HTTP MCP Server

For tools that multiple team members will use, an HTTP server is better than a local stdio server. Everyone points to the same URL rather than running a local process.

```typescript
// task-manager-http/server.ts
import express from 'express';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => Math.random().toString(36),
  });

  // Mount your server here
  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(3000, () => {
  console.log('MCP server on http://localhost:3000/mcp');
});
```

Register it as HTTP:

```bash
claude mcp add --transport http task-manager --scope project \
  https://internal-tools.company.com/mcp
```

---

## Team Distribution Patterns

**Project scope via `.mcp.json`:** The most common approach for teams. Run:

```bash
claude mcp add --transport http task-manager --scope project https://mcp.company.com/task-manager
```

This creates `.mcp.json` in the project root. Commit it:

```json
{
  "mcpServers": {
    "task-manager": {
      "type": "http",
      "url": "https://mcp.company.com/task-manager"
    }
  }
}
```

Every team member who checks out the repo gets the tool automatically.

**Plugin distribution:** Package your MCP server as a Claude Code plugin to distribute it across all projects for all users. See the plugins documentation for the plugin format.

**Managed MCP for enterprises:** For organization-wide deployment, system administrators can deploy `managed-mcp.json` to all machines:

```json
// /Library/Application Support/ClaudeCode/managed-mcp.json (macOS)
{
  "mcpServers": {
    "company-tools": {
      "type": "http",
      "url": "https://internal.company.com/mcp"
    }
  }
}
```

All employees get the tool. They cannot add unauthorized servers or remove the managed ones.

---

## Advanced: Dynamic Tools

MCP servers can send `list_changed` notifications to Claude Code, allowing the available tools to change dynamically without reconnecting. This is useful for tools that depend on context — like a tool that only shows staging deployment options if you are in the staging branch, or a tool that loads project-specific commands from a config file.

Claude Code handles `list_changed` automatically when your server sends it. Claude will re-fetch the tool list and update its available tools in real time.

---

## Security for Custom Tools

Tools with broad access need careful security:

**Authenticate all tool calls.** Even tools running on localhost should verify the caller:

```typescript
const API_KEY = process.env.MCP_API_KEY;

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Verify API key from environment, not from request
  if (!API_KEY) {
    throw new Error("Server not configured with API key");
  }
  // ... handle tool call
});
```

**Validate all inputs before using them.** Schema validation catches wrong types, but your handler should still validate values:

```typescript
case "delete_record": {
  const { table, id } = args;
  // Whitelist allowed tables — never let the schema reach raw SQL
  const allowedTables = ['tasks', 'comments', 'attachments'];
  if (!allowedTables.includes(table)) {
    throw new Error(`Table '${table}' is not accessible via this tool`);
  }
  // ... proceed with validated input
}
```

**Log all destructive tool calls.** Writes, deletes, and mutations should be logged with timestamp, caller context, and parameters for auditability.

**Use read-only credentials for read-only tools.** A tool that only queries data should connect with a read-only database user, not an admin user.

---

**Next up:** [Chapter 11 — MCP Fundamentals](./11-mcp-basics.md) — What the Model Context Protocol is, why it matters, and how Claude Code uses it as a universal integration layer.
