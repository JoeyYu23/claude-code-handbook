# Chapter 20: Plugins & Marketplaces

## What Are Plugins?

A plugin is a bundle of extensions that add new capabilities to Claude Code. Plugins combine:

- **Skills**: Custom commands you create (e.g., `/my-command`)
- **Agents**: Specialized assistants that solve specific problems
- **Hooks**: Automation that runs on events (file saves, commits, etc.)
- **MCP servers**: External service integrations (GitHub, Slack, databases)
- **LSP servers**: Language intelligence (code navigation, diagnostics)

Instead of building each component separately, plugins package them together so you can share them with your team or community, or discover plugins built by others.

Think of plugins as "Claude Code packages" — similar to npm packages for Node.js.

---

## Official Marketplace

Anthropic maintains the official marketplace (`claude-plugins-official`), available automatically when you start Claude Code. Browse it with:

```bash
/plugin
```

This opens the plugin manager with four tabs: **Discover**, **Installed**, **Marketplaces**, and **Errors**.

### Categories in the official marketplace

**Code intelligence plugins** configure Language Server Protocol (LSP) connections for real-time code analysis. After installing, you get automatic diagnostics (type errors, missing imports, syntax issues) and code navigation (jump to definition, find references, list symbols).

| Language   | Plugin              | Requires                     |
| ---------- | ------------------- | ---------------------------- |
| Python     | `pyright-lsp`       | `pyright-langserver`         |
| TypeScript | `typescript-lsp`    | `typescript-language-server` |
| Go         | `gopls-lsp`         | `gopls`                      |
| Rust       | `rust-analyzer-lsp` | `rust-analyzer`              |
| Java       | `jdtls-lsp`         | `jdtls`                      |
| C/C++      | `clangd-lsp`        | `clangd`                     |

**External integrations** bundle pre-configured MCP servers for common tools:

- **GitHub**, **GitLab**: source control and PR workflows
- **Jira**, **Asana**, **Linear**, **Notion**: project management
- **Slack**, **Discord**: team communication
- **Vercel**, **Firebase**, **Supabase**: cloud deployment
- **Figma**: design collaboration

**Development workflows** add commands and agents for common tasks:

- `commit-commands`: git workflows (commit, push, PR creation)
- `pr-review-toolkit`: automated pull request review
- `agent-sdk-dev`: tools for building with the Agent SDK
- `plugin-dev`: toolkit for creating your own plugins

---

## Installing & Managing Plugins

### Install from the official marketplace

Install a plugin directly from the command line:

```bash
/plugin install github@claude-plugins-official
```

Or use the interactive UI: run `/plugin`, go to **Discover**, select a plugin, and choose your installation scope.

### Installation scopes

When installing, choose where the plugin should live:

- **User scope** (default): Available across all your projects
- **Project scope**: Added to `.claude/settings.json`, shared with team
- **Local scope**: Just this project, not shared
- **Managed scope** (read-only): Configured by administrators

For team plugins, use project scope so all collaborators get the same tools automatically.

### Manage installed plugins

List all installed plugins:

```bash
/plugin
→ Installed tab
```

Disable without uninstalling:

```bash
/plugin disable plugin-name@marketplace-name
```

Re-enable a disabled plugin:

```bash
/plugin enable plugin-name@marketplace-name
```

Remove completely:

```bash
/plugin uninstall plugin-name@marketplace-name
```

After making changes, reload plugins in your current session:

```bash
/reload-plugins
```

---

## Community Marketplaces

Beyond the official marketplace, anyone can create and share a marketplace. Add a community marketplace with:

```bash
/plugin marketplace add anthropics/claude-code
```

This registers the marketplace without installing any plugins — you still choose which ones to install individually.

### Add marketplaces from different sources

**GitHub repositories** (recommended for transparency):

```bash
/plugin marketplace add owner/repo
```

The repository must contain `.claude-plugin/marketplace.json` with plugin definitions.

**Git URLs** (GitLab, Bitbucket, self-hosted):

```bash
/plugin marketplace add https://gitlab.com/company/plugins.git
/plugin marketplace add git@github.com:org/plugins.git#v1.0.0
```

**Local paths** (development):

```bash
/plugin marketplace add ./my-marketplace
/plugin marketplace add ./path/to/marketplace.json
```

**Remote URLs** (simple hosting):

```bash
/plugin marketplace add https://example.com/marketplace.json
```

### Manage marketplaces

List all configured marketplaces:

```bash
/plugin marketplace list
```

Update marketplace listings to fetch new plugins:

```bash
/plugin marketplace update marketplace-name
```

Remove a marketplace (this uninstalls its plugins):

```bash
/plugin marketplace remove marketplace-name
```

### Auto-updates

Official Anthropic marketplaces auto-update by default. Toggle auto-updates in the UI:

```bash
/plugin
→ Marketplaces tab
→ Select marketplace
→ Enable/Disable auto-update
```

Or set environment variables:

```bash
export DISABLE_AUTOUPDATER=true
export FORCE_AUTOUPDATE_PLUGINS=true
```

This keeps plugin updates while managing Claude Code updates manually.

---

## Building Your Own Plugin

A plugin is a directory with a `PLUGIN.md` file and a `marketplace.json` manifest. To get started:

```bash
/plugin create my-awesome-plugin
```

This scaffolds:

```
my-awesome-plugin/
├── PLUGIN.md              # Plugin metadata and description
├── .claude-plugin/
│   ├── marketplace.json   # Plugin definition
│   ├── skills/            # Custom commands (optional)
│   ├── agents/            # Specialized assistants (optional)
│   └── hooks/             # Automation triggers (optional)
└── README.md              # For your repository
```

**PLUGIN.md** describes what your plugin does:

```markdown
---
name: my-awesome-plugin
version: 1.0.0
description: Brief description of what this plugin does
author: Your Name
license: MIT
---

## What this plugin provides

- A `/my-command` skill
- A `my-agent` assistant for X task
- Integration with [service]

## Installation

Install from the marketplace:

/plugin install my-awesome-plugin@my-org

## Usage

Run `/my-command --help` for options.
```

**marketplace.json** tells Claude Code what components are in your plugin:

```json
{
  "plugins": [
    {
      "name": "my-awesome-plugin",
      "description": "What it does",
      "version": "1.0.0",
      "components": {
        "skills": ["skills/my-command/SKILL.md"],
        "agents": ["agents/my-agent/AGENT.md"],
        "mcp_servers": ["mcp/config.json"]
      }
    }
  ]
}
```

Once created, share it by publishing to a marketplace (GitHub recommended) and publicizing its `owner/repo`.

---

## Team Marketplace Setup

For team-specific plugins, configure them in `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "my-team-plugin@my-team-tools": {
      "enabled": true,
      "scope": "project"
    }
  }
}
```

When team members trust the repository, Claude Code prompts them to install team plugins automatically.

---

## Security Considerations

Plugins are highly trusted — they can execute arbitrary code on your machine. Only install plugins from sources you trust.

**Before installing:**

- Verify the plugin author
- Review the plugin's repository and recent commits
- Check what permissions it requests (file access, external services)
- Read the plugin's documentation

**For teams:**

- Require marketplace approval for new plugins
- Audit plugins before adding to `.claude/settings.json`
- Use managed settings to restrict which marketplaces developers can add
- Document why each plugin is required

**Red flags:**

- No public repository or source code
- Requests to run arbitrary shell commands on startup
- Unmaintained (no commits in 6+ months)
- No clear privacy policy for external integrations

Anthropic does not review or verify third-party plugins — you are responsible for what you install.

---

## Troubleshooting

**`/plugin` command not recognized**

Update Claude Code to version 1.0.33+:

```bash
brew upgrade claude-code     # macOS with Homebrew
npm update -g @anthropic-ai/claude-code  # npm
```

**Plugin skills don't appear after installation**

Clear the plugin cache and reinstall:

```bash
rm -rf ~/.claude/plugins/cache
/reload-plugins
/plugin install plugin-name@marketplace
```

**Language server not starting**

Install the required binary and verify it's in your PATH:

```bash
which pyright-langserver    # Python example
which typescript-language-server  # TypeScript example
```

Check the `/plugin` Errors tab for detailed diagnostics.

**High memory usage from code intelligence plugins**

Large language servers (rust-analyzer, pyright) consume significant memory. If needed, disable and rely on Claude's built-in search:

```bash
/plugin disable rust-analyzer-lsp@claude-plugins-official
```

---

## Next Steps

- **Use official plugins**: Run `/plugin` and install code intelligence plugins for your languages
- **Try the demo marketplace**: `anthropics/claude-code` has example plugins showing best practices
- **Build a skill**: Create your first custom skill before building a full plugin
- **Share with your team**: When you have a useful plugin, add it to a team marketplace
- **Read the plugin reference**: [Claude Code Plugin Docs](https://code.claude.com/docs/en/discover-plugins)

---

**Next up:** [Chapter 21 — Worktree & Isolation](./21-worktree.md)
