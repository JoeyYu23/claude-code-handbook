# Chapter 4: Cloud Providers & Remote Control

## Running Claude Code Everywhere

Claude Code was built to work with your local machine. But what if your work spans multiple environments? What if you need to:

- Run code on a production GPU cluster in AWS, but control it from your laptop's terminal?
- Debug a pipeline running on Google Cloud while sitting in a coffee shop?
- Execute code on a remote Windows machine from your Mac?
- Let multiple team members contribute to the same codebase simultaneously via a web interface?

These scenarios are not edge cases anymore. They are increasingly the default. Cloud-based workflows, distributed teams, and heterogeneous infrastructure are now standard practice. Claude Code handles all of them through three integrated systems:

1. **Cloud provider integrations** — route Claude Code to Bedrock, Vertex AI, or Azure Foundry
2. **Remote control** — access and modify code on distant machines from your terminal
3. **Web sessions** — use claude.ai/code as a bridge to cloud VMs and collaborative environments

This chapter covers how to architect Claude Code deployments that span your entire infrastructure — from local development to global scale.

---

## Amazon Bedrock Integration

Bedrock is AWS's managed API for using foundation models. It handles authentication, rate limiting, and multi-region failover, so you do not have to. The advantage is huge: your Claude Code sessions can now use AWS infrastructure, regional latency-optimized endpoints, and enterprise compliance frameworks (SOC2, HIPAA, FedRAMP).

### Setup and Configuration

First, ensure your AWS credentials are in place. Claude Code reads the standard locations:

```bash
# ~/.aws/credentials
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

# OR environment variables
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Bedrock requires you to request model access in the AWS Console. Navigate to **Bedrock > Model Access**, then check which Claude models are available in your region. Once enabled, configure Claude Code using environment variables:

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_DEFAULT_SONNET_MODEL="us.anthropic.claude-sonnet-4-6-20260320-v1:0"
export AWS_REGION="us-east-1"
```

You can add these to your shell profile (`~/.zshrc`, `~/.bashrc`) for persistence, or set them in your CI/CD environment.

### Model IDs and Region Availability

Bedrock model identifiers follow a specific format. The most common are:

| Model | Model ID | Regions | Best For |
|---|---|---|---|
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | us-east-1, eu-west-1 | Default choice: fast, accurate |
| Claude Opus 4.6 | `claude-opus-4-6` | us-east-1, us-west-2 | Complex reasoning, large contexts |
| Claude Haiku 4.5 | `claude-haiku-4-5` | us-east-1, us-west-2, ap-southeast-1 | Cost optimization |

Bedrock routes requests to the nearest regional endpoint, reducing latency. If your primary region is unavailable, you can configure a failover by setting `AWS_REGION` to your backup region.

When accessing Bedrock, Claude Code checks:
1. Credentials in `~/.aws/credentials` or env vars
2. IAM role (if running on EC2, ECS, or Lambda)
3. STS temporary credentials (for assumed roles)

Common issues and fixes:

| Error | Cause | Fix |
|---|---|---|
| `AccessDenied` | IAM policy lacks Bedrock permissions | Add `bedrock:InvokeModel` to IAM policy |
| `ModelNotAccessible` | Model not requested in console | Enable in AWS Console > Bedrock > Model Access |
| `ThrottlingException` | Exceeded provisioned throughput | Use on-demand pricing or request higher limits |

---

## Google Vertex AI

Vertex AI is Google Cloud's unified ML platform. It integrates with BigQuery, Dataflow, and Pub/Sub, making it ideal if your data pipeline already lives in GCP.

Configuration uses environment variables, similar to Bedrock:

```bash
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="my-gcp-project-123"
```

Claude Code uses Application Default Credentials. Set them up once:

```bash
gcloud auth application-default login
```

This creates `~/.config/gcloud/application_default_credentials.json`. You can also use service account keys:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

Vertex AI uses the same Claude models as Bedrock, but with GCP-native integrations. For example, you can directly read from BigQuery datasets:

```text
Read the file data/customers.csv and load it into BigQuery dataset 'analytics.staging'.
```

Claude Code translates this into a `bq load` command, using your GCP credentials automatically.

---

## Microsoft Foundry

Azure AI Foundry (formerly Azure AI Studio) provides the hosting environment for Claude models on Azure. If your organization standardizes on Azure, Foundry gives you:

- Managed inference with GPU pools
- Enterprise compliance (ISO 27001, SOC2)
- Integration with Azure DevOps, GitHub, and Codespaces
- Cost governance through Azure Cost Management

Setup uses environment variables:

```bash
export CLAUDE_CODE_USE_FOUNDRY=1
```

Authenticate using Azure CLI:

```bash
az login
az account set --subscription "12345678-..."
```

Once authenticated, Claude Code uses your Azure credentials to access Foundry endpoints.

---

## LiteLLM Gateway (Third-Party Proxy)

LiteLLM is a third-party open-source proxy (not a native Claude Code provider) that unifies multiple AI providers behind a single API. Instead of switching between Bedrock, Vertex AI, and OpenAI, you define routes:

```yaml
# ~/.litellm/config.yaml
model_list:
  - model_name: claude-default
    litellm_params:
      model: bedrock/claude-sonnet-4-6
      region: us-east-1

  - model_name: claude-fallback
    litellm_params:
      model: vertex-ai/claude-opus-4-6
      project: my-gcp-project

  - model_name: claude-budget
    litellm_params:
      model: bedrock/claude-haiku-4-5
      region: us-west-2

fallbacks:
  - claude-default
  - claude-fallback
  - claude-budget
```

Then run the LiteLLM server locally:

```bash
litellm --config ~/.litellm/config.yaml --port 8000
```

Point Claude Code at it by setting `ANTHROPIC_BASE_URL` to your LiteLLM proxy:

```bash
export ANTHROPIC_BASE_URL="http://localhost:8000"
```

Advantages:

- **Automatic failover**: If Bedrock is down, LiteLLM falls back to Vertex AI automatically
- **Cost optimization**: Route cheap tasks to Haiku, expensive ones to Opus
- **Provider abstraction**: Switch providers without code changes

Common scenario: you are developing locally with Haiku (cheap), but production uses Opus (accurate). LiteLLM routes based on the context:

```bash
# Dev environment — route through LiteLLM to cheaper models
export ANTHROPIC_BASE_URL="http://localhost:8000"

# Production environment — use direct Bedrock connection
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_DEFAULT_SONNET_MODEL="us.anthropic.claude-sonnet-4-6-20260320-v1:0"
```

---

## Remote Control

Sometimes you are not sitting at the machine. You are 3000 miles away, or you are helping a colleague debug their system. Remote control lets you control a distant Claude Code instance from your local terminal.

### How Remote Control Works

Remote control allows you to operate a Claude Code session from another device or share your session with teammates. There are two primary ways to access it:

1. **From the CLI:** Use `claude --remote` to start a cloud-hosted session that you can access from any device.
2. **Within a session:** Use the `/remote-control` (or `/rc`) slash command to enable remote control of your current session. This generates a QR code or share link that another device can use to connect.
3. **From the Desktop App:** The Claude Desktop App can generate a QR code for sharing your session with a mobile device or another computer.

The remote machine must have Claude Code installed. Install it with:

```bash
npm install -g @anthropic-ai/claude-code
```

### Sharing a Session

When you run `/remote-control` or `/rc` inside a Claude Code session, you get a shareable link or QR code. Another person (or your other device) can open that link to view and interact with your session in real time.

This is useful when:
- You are pair debugging with a colleague and want them to see your terminal
- You want to control a session from a tablet or phone
- You need to hand off an in-progress session to a teammate

All credentials and API keys stay on the host machine. The remote viewer interacts through the Claude Code interface, not through direct shell access.

### Connecting from claude.ai

You can also work with remote sessions through the claude.ai/code web interface, which provides a browser-based view of your Claude Code session with file tree navigation, syntax highlighting, and visual diffs.

---

## Teleport (Web ↔ CLI)

Teleport is a feature that bridges web sessions and CLI sessions. You start work in one, pause, switch to the other, and resume. Think of it as a context checkpoint.

### `--teleport` Flag

Start a teleport-enabled session:

```bash
claude --teleport
```

Output:
```
Session ID: tp_7f3a8c4b5d2e9a1f
Share link: https://claude.ai/code/tp_7f3a8c4b5d2e9a1f
```

Copy the link, paste it into your browser. You now have the same session in two places: your terminal and the web. Any file you read, any edits you make, any commands you run — they sync in real time.

Common workflow:

1. **Start locally**: `claude --teleport` in your terminal
2. **Context building**: Read files, run tests, gather context
3. **Switch to web**: Click the share link to move the session to claude.ai
4. **Explain to colleague**: "Here is what I found" — they see your files and commands in their browser
5. **Get help**: They suggest a change via the web UI
6. **Go back to terminal**: Switch back to your terminal (your machine keeps running)
7. **Finish work**: Execute the final commands locally

### `--remote` Flag

The `--remote` flag extends this to actual remote machines:

```bash
claude --remote staging-env-01 --teleport
```

This:
1. Connects to the remote machine `staging-env-01`
2. Opens a teleport session
3. Shows a share link

Now anyone can access your session via the web link, watching in real time as you debug the staging environment. This is invaluable for:

- **Incident response**: "Everyone, watch my terminal as I trace this bug in prod"
- **Pair debugging**: No screen sharing needed — just send a link
- **Async collaboration**: A teammate can review what you did and add comments later

Revoke access anytime:

```bash
claude teleport revoke tp_7f3a8c4b5d2e9a1f
```

---

## Web Sessions (claude.ai/code)

The web interface at claude.ai/code provides a different control model: you interact through a browser instead of a terminal. For cloud-based workflows, this enables entirely new patterns.

### Cloud VMs

If your code runs on a cloud VM (EC2, GCE, Azure VM), you can point Claude Code at it from the web:

1. Ensure the VM has Claude Code installed and the daemon running:

```bash
# On the VM
npm install -g @anthropic-ai/claude-code
```

2. From claude.ai/code, click "Connect to Environment"
3. Select "Cloud VM" and choose your provider (AWS, GCP, Azure)
4. Authenticate with your cloud credentials
5. Claude Code auto-discovers your running instances
6. Select the instance you want to control
7. Start working

The browser acts as a GUI layer over the CLI. You can still run any command, but you also get:

- File tree on the left (click to open)
- Syntax highlighting
- Terminal output with clickable links
- Visual diff viewer for changes

### Shared Environments

For teams, cloud-based sessions on claude.ai/code can be configured to connect to shared infrastructure. Integration with services like GitHub, Slack, and Linear is managed through the claude.ai web interface when creating cloud tasks or sessions. The specific connector setup depends on your organization's deployment; refer to the [Claude Code official documentation](https://code.claude.com/docs) for current integration options.

### Network Policy

By default, Claude Code connections are encrypted and authenticated. For enterprise network policy configuration (restricting origins, enforcing VPN/MFA, audit logging), contact your Anthropic account team or refer to the [enterprise deployment documentation](https://docs.anthropic.com/en/docs/claude-code/enterprise). Network policies are especially important for regulated industries (finance, healthcare) where you must prove that code execution was authorized and audited.

---

## Practical Architecture

Here is a real-world example: a data science team using Claude Code across three environments. Each environment uses different environment variables — you can manage these with shell profiles, direnv, or wrapper scripts.

**Environment setup (conceptual):**

```bash
# Development (default — uses Anthropic API directly)
# No special env vars needed

# Shared GPU cluster (uses Bedrock)
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION="us-east-1"
export ANTHROPIC_DEFAULT_SONNET_MODEL="us.anthropic.claude-sonnet-4-6-20260320-v1:0"

# Production (uses Vertex AI)
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="company-prod-123"

# Cost-optimized dev (uses LiteLLM proxy)
export ANTHROPIC_BASE_URL="http://localhost:8000"
```

**Workflow:**

1. **Develop locally**: `claude` (uses default Anthropic API)
2. **Test on shared GPU**: Source Bedrock env vars, then `claude` (uses Bedrock)
3. **Deploy to production**: Source Vertex AI env vars, then `claude` (uses Vertex AI)
4. **Pair debug with teammate**: `claude --teleport` (opens web session)

This architecture separates concerns: local experimentation, team resources, and production systems. You switch between them by changing environment variables, not CLI flags.

---

## References

- AWS Bedrock CLI: `aws bedrock-runtime invoke-model --help`
- Google Vertex AI Documentation: https://cloud.google.com/vertex-ai/docs
- Microsoft Azure ML: https://learn.microsoft.com/en-us/azure/machine-learning/
- LiteLLM GitHub: https://github.com/BerriAI/litellm
- Claude Code Documentation: https://code.claude.com/docs

---

**Next up:** [Chapter 5 — CLAUDE.md Patterns](./05-claude-md-patterns.md) — Battle-tested configurations for every project type.
