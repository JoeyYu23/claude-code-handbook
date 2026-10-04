# Custom Tools

> Verified on 2026-10-04 with Claude Code 2.1.289.

Claude Code's built-in tools (Read, Edit, Bash, Grep and the rest) cover most development work. For your issue tracker, your internal API or your deploy system, you add tools of your own, usually as an MCP server. [MCP in Practice](/en/book2-advanced/12-mcp-in-practice) shows how to build and register one. This chapter is about the part that decides whether Claude uses it well: the design of each tool.

From Claude's side, a tool is a name, a description, an input schema and whatever comes back. It never sees your code. Everything below is about making those four things easy for a model to use correctly.

## Write descriptions for the model

The description is how Claude decides whether to call a tool. Say what it does, when to use it, and what it returns:

```python
# Weak
"""Creates a ticket."""

# Strong
"""Create a Jira issue for a bug report, feature request or task.
Use when the user asks to file, track or log work in Jira. Returns the issue key and URL."""
```

Describe every parameter too. In July 2026 Teng Li linted 36 popular MCP servers and graded a third of them D or F; the single most common defect was parameters with no description, usually because the schema was generated from code and nobody added one. A model given only `url: string` has to guess which URL, in what format.

Keep it tight. Claude Code cuts each tool description and each server's `instructions` at 2,048 characters by default, so put what matters first. With tool search on (the default), Claude finds your tools partly through the server instructions, so state there what kind of task the server is for.

## Constrain the inputs

Every constraint in the schema is a mistake Claude cannot make:

- **Enums for fixed sets.** `priority: "P0" | "P1" | "P2" | "P3"`, with what each means in the description.
- **Bounds on numbers and strings.** `limit` between 1 and 100 with a default; a `title` with a maximum length.
- **Only truly required fields in `required`.** Optional fields get defaults.
- **Names that say what they act on.** `search_issues` and `create_invoice` beat `run` or `query`.

In the Python SDK, type hints become the schema:

```python
from typing import Annotated, Literal
from pydantic import BaseModel, Field

class Task(BaseModel):
    id: str
    title: str
    status: str

@mcp.tool()
def list_tasks(
    status: Annotated[Literal["open", "in_progress", "review", "done"] | None,
                      Field(description="Only tasks in this status; omit for all")] = None,
    limit: Annotated[int, Field(ge=1, le=100, description="Maximum tasks to return")] = 20,
) -> list[Task]:
    """List tasks, newest first. Use to find work in a given status."""
    ...
```

The `Literal` becomes an enum in the input schema, `ge`/`le` become bounds, and the SDK rejects arguments that break the schema before your function runs, returning a validation message the model can act on.

## Return results Claude can use

- **Return typed data.** JSON beats a sentence. In the Python SDK, a return type such as a pydantic model or `list[str]` also produces an output schema and `structuredContent`; a plain `dict` return is sent only as JSON text. In our tests with `mcp` 2.3.0 that was the difference between `structured_content` holding the data and being empty.
- **Cap what you return,** and say when you cut it (`"truncated": true`). Claude Code warns when one result passes 10,000 tokens and, by default, moves anything over 25,000 to a file. A tool that legitimately returns large results, such as a full schema, can raise its own limit with `_meta["anthropic/maxResultSizeChars"]` (up to 500,000 characters).
- **Make errors teach.** Raise the SDK's `ToolError` for failures you expect, with a message that says how to recover: `Unknown table 'order'. Call list_tables to see valid names.` Claude reads it and retries. Any other exception reaches the model only as `Error executing tool <name>`.

## Mark the tools that need a human

Two `_meta` keys in a tool's `tools/list` entry change how Claude Code treats it:

| Key | Effect |
| :- | :- |
| `"anthropic/requiresUserInteraction": true` | A person must approve every call, even in `acceptEdits`, `auto` and `bypassPermissions`, with no "don't ask again" and no allow rule that skips it (`dontAsk` mode denies the call instead). Use it for consent steps, money and anything irreversible. |
| `"anthropic/alwaysLoad": true` | The tool's schema loads at session start instead of waiting for tool search. Use it sparingly; each one costs context in every request. |

The standard `readOnlyHint` and `destructiveHint` annotations describe a tool's behaviour to clients and reviewers. They are hints, not enforcement.

## Test at three levels

1. **Unit-test the functions.** Your handlers are ordinary functions; test them without MCP in the way.
2. **Lint the server for agent usability.** Teng Li's `mcpgrade` (on npm) scores descriptions, naming, schema design and token cost:

   ```bash
   npx -y mcpgrade --stdio "uv run /abs/path/shop_db.py"
   ```

   Run against the server from [MCP in Practice](/en/book2-advanced/12-mcp-in-practice), version 0.4.0 gave it an A (98/100) and one warning: `run_query` is a generic verb that does not say what it operates on. That is the kind of finding that is cheap to fix and easy to miss.
3. **Test with Claude.** Give it a real task and watch which tools it picks and what arguments it sends. For a repeatable check, script it:

   ```bash
   claude -p "Create a task titled 'MCP smoke test' with priority high, list high-priority tasks, then mark it done." \
     --allowedTools "mcp__task-manager" --output-format json < /dev/null | jq '.is_error, .num_turns'
   ```

   Also try the edges: a missing required field, an invalid enum value, a huge input. Each should come back as a clear error, not a crash.

## Secure the tool, not the prompt

Assume the model will eventually send something you did not expect, whether by mistake or because a document it read told it to.

- **Enforce limits below the model.** A read-only database user, a filesystem path checked against an allowlist, an API token with only the scopes the tool needs. Prompt text is not a control.
- **Validate values, not just types.** Check a table name against the real list; never splice a raw argument into SQL or a shell command.
- **Authenticate remote servers,** and keep secrets in environment variables, never in tool arguments or `.mcp.json`.
- **Log every write,** with the arguments and a timestamp.
- **Split read and write tools,** so a permission rule can allow `mcp__tasks__list_tasks` without allowing `mcp__tasks__delete_task`.

## Changing tools at runtime

A server can change its tool list while connected and send a `list_changed` notification, for example to offer staging-only tools on a staging branch. An interactive session re-fetches the list; `claude -p` and the Agent SDK refresh only the tool list. If you are building your own agent rather than extending Claude Code, the Agent SDK can also define tools in-process, without a separate server.

### Check that it worked

- `claude mcp get <name>` shows `✔ Connected`, and `/mcp` lists every tool you defined.
- Every parameter has a description: check the schemas with your linter, or in `/mcp`.
- A scripted `claude -p` run of a representative task finishes with `is_error` false and calls the tools you expected.
- An invalid call returns your `ToolError` message, not `Error executing tool`.

## Sources

- Connect Claude Code to tools via MCP (output limits, `_meta` annotations, tool search, dynamic tool updates), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/mcp
- Give Claude custom tools (Agent SDK), Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/agent-sdk/custom-tools
- "I lint-scanned 36 popular MCP servers. A third of them are failing your agent.", Teng Li, 2026-07-21. https://tengli.dev/posts/mcp-servers-failing-agents.html
- `mcpgrade` 0.4.0, npm, run 2026-10-04. https://www.npmjs.com/package/mcpgrade
- MCP Python SDK (`mcp` 2.3.0), Model Context Protocol, accessed 2026-10-04. https://github.com/modelcontextprotocol/python-sdk
