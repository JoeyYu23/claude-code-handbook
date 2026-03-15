# Chapter 13: Database MCP

## The Problem Database MCP Solves

Normally, when you want Claude to help with a data problem, you have to bridge a gap manually: run a query yourself, copy the results, paste them into the conversation, then ask Claude to analyze them. For schema questions, you export the schema definition and paste it in. For debugging a data issue, you run a dozen exploratory queries, paste the relevant ones, and describe what you found.

Database MCP collapses this workflow. Claude connects directly to your database, runs its own queries, explores schemas, and analyzes data — all as a natural part of your conversation. You stop being the relay between your AI assistant and your data.

This chapter covers setup for PostgreSQL, MySQL, and SQLite, plus patterns for data analysis workflows and the security considerations that matter most when granting any tool direct database access.

---

## Connecting to PostgreSQL

The recommended PostgreSQL MCP server is `@bytebase/dbhub`, which supports multiple database types through a unified interface.

```bash
# Add a PostgreSQL connection (read-only recommended for production)
claude mcp add --transport stdio --scope local db-prod \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly_user:password@prod.db.example.com:5432/myapp"
```

For local development databases, you might use a connection with write access:

```bash
claude mcp add --transport stdio --scope local db-dev \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://app_user:devpassword@localhost:5432/myapp_dev"
```

Always use `--scope local` for database connections. Never add them with project scope — you do not want connection strings with credentials stored in `.mcp.json` and committed to version control.

Store connection strings in environment variables and reference them via shell expansion:

```bash
# Set in your .env or shell profile (never in .mcp.json or CLAUDE.md)
export DB_PROD_DSN="postgresql://readonly:pass@prod.db.example.com:5432/myapp"

# Reference the variable when adding the MCP server
claude mcp add --transport stdio --scope local db-prod \
  -- npx -y @bytebase/dbhub --dsn "$DB_PROD_DSN"
```

---

## Connecting to MySQL and SQLite

The same `@bytebase/dbhub` server handles MySQL with a different connection string format:

```bash
claude mcp add --transport stdio --scope local db-mysql \
  -- npx -y @bytebase/dbhub \
  --dsn "mysql://readonly:password@mysql.example.com:3306/myapp"
```

For SQLite, which is common in development, testing, and embedded applications:

```bash
claude mcp add --transport stdio --scope local db-sqlite \
  -- npx -y @bytebase/dbhub \
  --dsn "sqlite:///absolute/path/to/database.db"
```

Multiple databases can be connected simultaneously under different names:

```bash
claude mcp add --transport stdio --scope local db-analytics \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://ro_user:pass@analytics-db.example.com:5432/analytics"

claude mcp add --transport stdio --scope local db-main \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://ro_user:pass@main-db.example.com:5432/app"
```

You can then ask Claude to query across both:

```text
Compare user counts between db-main (users table) and db-analytics
(user_events table). Are there users appearing in analytics events
who don't exist in the main users table?
```

---

## Running Queries Through Claude

Once connected, natural-language queries work intuitively:

```text
What's our total revenue this month compared to last month?
```

```text
Find the top 10 customers by order count in the last 90 days,
including their email and total spend.
```

```text
Are there any orders that have been in "processing" status for
more than 48 hours?
```

Claude will construct and execute the appropriate SQL, show you the query it used, and interpret the results. This is useful even for experienced SQL writers — the explanation layer catches mistakes faster.

For more complex analysis:

```text
We've been seeing increased checkout abandonment this week.
Query the orders table to find:
1. The conversion rate (orders completed / orders started) by day for the past 2 weeks
2. Whether abandonment is concentrated in specific product categories
3. Whether it correlates with any geographic regions

Summarize what the data suggests and what to investigate next.
```

Claude handles multi-step analysis naturally, running several queries and synthesizing the results into an explanation.

---

## Schema Exploration

Schema understanding is one of the most valuable capabilities database MCP adds to code-writing tasks. When Claude can query your actual schema — rather than working from a description you provide — the code it generates is far more accurate.

```text
Describe the structure of the orders table, including all columns,
their types, nullable status, and any indexes.
```

```text
Show me all tables that reference the users table via foreign keys.
Draw a text diagram of these relationships.
```

For onboarding or documentation:

```text
Explore the entire database schema. Identify the main entity tables,
their relationships, and any junction/mapping tables.
Write a summary of the data model suitable for a new developer joining the team.
```

When generating code, point Claude at the schema directly:

```text
Using the actual schema of the orders, order_items, and products tables,
write a TypeScript service function that retrieves a complete order
with all its line items and product details.
Generate the exact SQL query and the TypeScript interface types based
on the real column names and types.
```

The difference between Claude guessing column names and Claude querying the actual schema is enormous in practice — you stop getting code that uses `user_id` when your column is named `userId` or `account_id`.

---

## Data Analysis Workflows

Database MCP enables a class of data analysis workflows that previously required switching between multiple tools.

**Debugging data integrity issues:**
```text
We're seeing duplicate email addresses in the users table despite a
unique constraint. Query for any duplicates that exist, find when they
were created, and check if there's a pattern (same IP, same time window,
same referral source).
```

**Performance investigation:**
```text
The slow query log shows this query taking >2 seconds:
SELECT * FROM orders WHERE status = 'pending' AND created_at > NOW() - INTERVAL '7 days'

Run EXPLAIN ANALYZE on this query in db-dev. Suggest index changes
that would improve performance and show me the predicted improvement.
```

**Migration validation:**
```text
We just ran migration 20250312_add_user_segments.sql.
Verify:
1. The user_segments table was created with the expected columns
2. All existing users have been assigned a segment (no NULLs in segment_id)
3. The foreign key constraint to users is in place
4. Row count looks reasonable (should be close to users count)
```

**Reporting and dashboards:**
```text
Write a SQL query that produces our weekly business metrics:
- New signups this week vs last week
- Revenue this week vs last week
- Active users (made at least one action in last 7 days)
- Churn (users active 2 weeks ago but not this week)

Format the output so it could be used in a weekly email report.
```

---

## Security: Read-Only vs Write Access

This is the most important section in this chapter. Database access is one of the highest-risk capabilities you can grant Claude Code, and the access level you choose has significant consequences.

**Default to read-only for everything except local development:**

```bash
# Production: always read-only
claude mcp add --transport stdio --scope local db-prod \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly_user:pass@prod.db.example.com:5432/app"

# Staging: read-only unless actively testing migrations
claude mcp add --transport stdio --scope local db-staging \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly_user:pass@staging-db.example.com:5432/app"

# Local dev: write access acceptable
claude mcp add --transport stdio --scope local db-local \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://app_user:devpass@localhost:5432/app_dev"
```

Create a dedicated read-only database user for MCP access:

```sql
-- PostgreSQL: create a read-only user for Claude Code
CREATE ROLE claude_readonly WITH LOGIN PASSWORD 'strong_random_password';
GRANT CONNECT ON DATABASE myapp TO claude_readonly;
GRANT USAGE ON SCHEMA public TO claude_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO claude_readonly;
```

**Never store credentials in tracked files.** Database DSNs belong in environment variables or a secrets manager, not in CLAUDE.md, `.mcp.json`, or any file that could be committed to version control.

**Review queries before production impact.** Even with read-only access, a poorly formed analytical query can cause performance problems on a production database (full table scans, missing indexes). Ask Claude to `EXPLAIN` queries before running them on production data at scale.

**Be aware of data exposure in context.** When Claude runs a query that returns rows with PII (names, emails, payment data), that data enters the conversation context, which may be sent to Anthropic as part of the model API call. For data subject to regulatory requirements, run sensitive queries only against anonymized development data.

---

## Troubleshooting Common Issues

**Connection refused on localhost:**
Verify the database is running and accepting connections on the specified port. For Docker-based databases, ensure the container is up: `docker compose ps`.

**Authentication failure:**
Check that the username and password in the DSN are correct. For PostgreSQL, confirm the user has `CONNECT` privilege on the database.

**MCP server not found:**
Run `claude mcp list` to verify the server was added. If it does not appear, re-run the `claude mcp add` command and check for typos in the package name.

**Query results empty when data exists:**
Check that the MCP user has `SELECT` permission on the specific table. Run `\dp tablename` in `psql` to inspect permissions.

---

**Next up:** [Chapter 14 — Building Custom MCP Servers](./14-custom-mcp.md) — When existing MCP servers do not cover your workflow, build your own.
