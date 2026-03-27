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

Bedrock requires you to request model access in the AWS Console. Navigate to **Bedrock > Model Access**, then check which Claude models are available in your region. Once enabled, configure Claude Code:

```bash
claude config set provider bedrock
claude config set bedrock-region us-east-1
claude config set bedrock-model claude-3-5-sonnet  # or opus, haiku
```

Verify the connection:

```bash
claude status --provider bedrock
```

Output:
```
Provider: Amazon Bedrock
Region: us-east-1
Model: claude-3-5-sonnet
Status: Connected
```

### Model IDs and Region Availability

Bedrock model identifiers follow a specific format. The most common are:

| Model | Model ID | Regions | Best For |
|---|---|---|---|
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | us-east-1, eu-west-1 | Default choice: fast, accurate |
| Claude Opus 4.6 | `claude-opus-4-6` | us-east-1, us-west-2 | Complex reasoning, large contexts |
| Claude Haiku 4.5 | `claude-haiku-4-5` | us-east-1, us-west-2, ap-southeast-1 | Cost optimization |

Bedrock routes requests to the nearest regional endpoint, reducing latency. If your primary region is unavailable, you can configure a failover:

```bash
claude config set bedrock-failover-region us-west-2
```

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

Configuration is similar to Bedrock:

```bash
claude config set provider vertex-ai
claude config set gcp-project "my-gcp-project-123"
claude config set gcp-location us-central1
```

Claude Code uses Application Default Credentials. Set them up once:

```bash
gcloud auth application-default login
```

This creates `~/.config/gcloud/application_default_credentials.json`. You can also use service account keys:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
claude status --provider vertex-ai
```

Vertex AI uses the same Claude models as Bedrock, but with GCP-native integrations. For example, you can directly read from BigQuery datasets:

```claude
Read the file data/customers.csv and load it into BigQuery dataset 'analytics.staging'.
```

Claude Code translates this into a `bq load` command, using your GCP credentials automatically.

---

## Microsoft Foundry

Microsoft's AI platform integrates with Azure ML and Copilot Studio. If your organization standardizes on Azure, Foundry gives you:

- Managed inference with GPU pools
- Enterprise compliance (ISO 27001, SOC2)
- Integration with Azure DevOps, GitHub, and Codespaces
- Cost governance through Azure Cost Management

Setup:

```bash
claude config set provider foundry
claude config set azure-subscription-id "12345678-..."
claude config set azure-resource-group "my-rg"
```

Authenticate using Azure CLI:

```bash
az login
az account set --subscription "12345678-..."
claude status --provider foundry
```

One powerful pattern: if your code deployment runs in Azure Container Instances or App Service, you can point Claude Code at it:

```bash
claude config set foundry-deployment-endpoint "https://my-app.azurewebsites.net"
```

Now Claude Code can execute in that environment, with full access to Azure Key Vault, Managed Identity, and networking policies.

---

## LiteLLM Gateway (Model Routing)

LiteLLM is an open-source proxy that unifies multiple AI providers behind a single API. Instead of switching between Bedrock, Vertex AI, and OpenAI, you define routes:

```yaml
# ~/.litellm/config.yaml
model_list:
  - model_name: claude-default
    litellm_params:
      model: bedrock/claude-3-5-sonnet
      region: us-east-1

  - model_name: claude-fallback
    litellm_params:
      model: vertex-ai/claude-3-opus
      project: my-gcp-project

  - model_name: claude-budget
    litellm_params:
      model: bedrock/claude-3-haiku
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

Point Claude Code at it:

```bash
claude config set provider litellm
claude config set litellm-base-url "http://localhost:8000"
claude config set litellm-model "claude-default"
```

Advantages:

- **Automatic failover**: If Bedrock is down, LiteLLM falls back to Vertex AI automatically
- **Cost optimization**: Route cheap tasks to Haiku, expensive ones to Opus
- **Provider abstraction**: Switch providers without code changes

Common scenario: you are developing locally with Haiku (cheap), but production uses Opus (accurate). LiteLLM routes based on the context:

```bash
# Dev environment
claude config set litellm-model "claude-budget"

# Production environment
claude config set litellm-model "claude-default"
```

---

## Remote Control

Sometimes you are not sitting at the machine. You are 3000 miles away, or you are helping a colleague debug their system. Remote control lets you control a distant Claude Code instance from your local terminal.

### Basic Command

```bash
claude remote-control --name production-server
```

This initiates a connection to a Claude Code instance named `production-server`. The remote machine must have:

1. Claude Code installed
2. A daemon running: `claude daemon start`
3. The same authentication token (or shared credential source)

Your terminal now acts as a proxy. You type commands, they execute remotely, and results stream back in real time. It is transparent — you cannot tell you are not local.

### Connecting Multiple Devices

Register multiple machines:

```bash
# On your development machine
claude remote-control register --name dev-laptop --host 192.168.1.100 --port 7843

# On a team server
claude remote-control register --name team-gpu --host gpu-server.internal --port 7843

# On a staging environment
claude remote-control register --name staging-canary --host staging-01.prod.internal --port 7843
```

List registered machines:

```bash
claude remote-control list
```

Output:
```
Name                  Host                        Port  Last Seen
dev-laptop            192.168.1.100               7843  2 minutes ago
team-gpu              gpu-server.internal         7843  1 hour ago
staging-canary        staging-01.prod.internal    7843  offline
```

Connect to any:

```bash
claude remote-control --name team-gpu
```

### Cross-Device Operation

You can open files on one machine and edit them on another:

```bash
# On your laptop, controlling a remote server
claude remote-control --name team-gpu
> Read /home/ml/models/llm-config.yaml
> Modify the batch size from 32 to 64
> Test the config by running /home/ml/test_config.sh
```

The flow:

1. `Read` executes on the remote machine
2. Claude Code receives the file contents
3. You see it in your local terminal
4. `Modify` writes the changes back to the remote machine
5. `Test` runs on the remote machine
6. Output streams to your local terminal

All credentials, SSH keys, and API keys stay on the remote machine. Your laptop never sees them.

### Connecting from claude.ai

You can also start a remote control session from claude.ai web interface:

1. Visit https://claude.ai/code
2. Click "Connect to Remote"
3. Enter the machine name or hostname
4. Authorize the connection (you will be prompted on the remote machine)
5. Start typing commands in the web interface

This is useful when:
- You are using a tablet or Chromebook (no terminal available)
- You want to share a view with a team member (they see your cursor in the web UI)
- You need persistence across browser sessions

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
curl https://install.anthropic.com/claude-code | bash
claude daemon start
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

### Connectors

For teams, use connectors to register shared environments:

```bash
# Admin sets up the connector (one time)
claude connector create --name prod-cluster \
  --type kubernetes \
  --context prod-us-east \
  --credentials /path/to/kubeconfig
```

Team members then access it:

```bash
# On claude.ai/code
Select "Production Cluster" from the Environment dropdown
```

Connectors abstract away SSH, port forwarding, and credential management. Everyone on the team can connect to shared infrastructure without needing individual credentials.

### Network Policy

By default, Claude Code connections are encrypted and authenticated. But you can enforce stricter policies:

```yaml
# ~/.claude/network-policy.yaml
allowed_origins:
  - claude.ai
  - internal-claude.mycompany.com

network_restrictions:
  outbound:
    - deny: external-apis
      allow: approved-list.txt
  inbound:
    - require_mfa: true
    - require_vpn: true

audit:
  log_all_commands: true
  log_file_access: true
  retention_days: 90
```

Load it:

```bash
claude config load-policy ~/.claude/network-policy.yaml
```

This is essential for regulated industries (finance, healthcare) where you must prove that code execution was authorized and audited.

---

## Practical Architecture

Here is a real-world example: a data science team using Claude Code across three environments.

**Setup:**

```yaml
# ~/.claude/multi-env.yaml
environments:
  local-dev:
    provider: local
    name: development-laptop

  shared-gpu:
    provider: bedrock
    region: us-east-1
    name: team-gpu-cluster

  production:
    provider: vertex-ai
    gcp_project: company-prod-123
    name: prod-serving

  web-control:
    provider: litellm
    base_url: http://localhost:8000
    fallbacks:
      - team-gpu-cluster
      - local-dev
```

**Workflow:**

1. **Develop locally**: `claude` (uses local-dev)
2. **Test on shared GPU**: `claude --env shared-gpu` (uses Bedrock)
3. **Deploy to production**: `claude --env production` (uses Vertex AI, with MFA required)
4. **Pair debug with teammate**: `claude --teleport` (opens web session)

This architecture separates concerns: local experimentation, team resources, and production systems, but keeps the interface consistent.

---

## References

- AWS Bedrock CLI: `aws bedrock-runtime invoke-model --help`
- Google Vertex AI Documentation: https://cloud.google.com/vertex-ai/docs
- Microsoft Azure ML: https://learn.microsoft.com/en-us/azure/machine-learning/
- LiteLLM GitHub: https://github.com/BerriAI/litellm
- Claude Code Remote Control Guide: run `claude docs remote-control` in your terminal for details
- Network Policy Specification: run `claude docs network-policy` in your terminal for details

---

**Next up:** [Chapter 5 — CLAUDE.md Patterns](./05-claude-md-patterns.md) — Battle-tested configurations for every project type.
