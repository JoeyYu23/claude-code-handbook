# 第 4 章：云服务商与远程控制

## 在任何地方运行 Claude Code

Claude Code 最初是为本地机器设计的。但如果你的工作跨越多个环境，该怎么办？如果你需要：

- 在 AWS 的生产 GPU 集群上运行代码，同时从笔记本终端控制？
- 坐在咖啡馆里调试运行在 Google Cloud 上的数据管道？
- 从 Mac 向远程 Windows 机器执行代码？
- 让多个团队成员通过 Web 界面同时贡献同一代码库？

这些场景早已不是边缘情况，而是越来越成为默认工作方式。基于云的工作流、分布式团队和异构基础设施已是行业标准。Claude Code 通过三个集成系统处理所有这些场景：

1. **云服务商集成** — 将 Claude Code 路由到 Bedrock、Vertex AI 或 Azure Foundry
2. **远程控制** — 从你的终端访问和修改远程机器上的代码
3. **Web 会话** — 以 claude.ai/code 作为桥梁连接云端虚拟机和协作环境

本章介绍如何架构跨越整个基础设施的 Claude Code 部署——从本地开发到全球规模。

---

## Amazon Bedrock 集成

Bedrock 是 AWS 的基础模型托管 API，负责处理身份验证、速率限制和多区域故障转移，让你无需操心这些底层细节。优势显著：你的 Claude Code 会话可以利用 AWS 基础设施、区域延迟优化端点以及企业合规框架（SOC2、HIPAA、FedRAMP）。

### 设置与配置

首先确保 AWS 凭证已就位，Claude Code 会读取标准位置：

```bash
# ~/.aws/credentials
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

# 或使用环境变量
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Bedrock 要求你在 AWS 控制台申请模型访问权限。导航到 **Bedrock > Model Access**，查看你所在区域有哪些 Claude 模型可用。启用后，配置 Claude Code：

```bash
claude config set provider bedrock
claude config set bedrock-region us-east-1
claude config set bedrock-model claude-3-5-sonnet  # 或 opus、haiku
```

验证连接：

```bash
claude status --provider bedrock
```

输出：
```
Provider: Amazon Bedrock
Region: us-east-1
Model: claude-3-5-sonnet
Status: Connected
```

### 模型 ID 与区域可用性

Bedrock 模型标识符遵循特定格式，最常用的如下：

| 模型 | 模型 ID | 区域 | 最适合 |
|---|---|---|---|
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | us-east-1, eu-west-1 | 默认选择：速度与精度兼顾 |
| Claude Opus 4.6 | `claude-opus-4-6` | us-east-1, us-west-2 | 复杂推理、大上下文 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | us-east-1, us-west-2, ap-southeast-1 | 成本优化 |

Bedrock 会将请求路由到最近的区域端点以降低延迟。如果主区域不可用，可以配置故障转移区域：

```bash
claude config set bedrock-failover-region us-west-2
```

访问 Bedrock 时，Claude Code 按以下顺序检查凭证：
1. `~/.aws/credentials` 或环境变量中的凭证
2. IAM 角色（在 EC2、ECS 或 Lambda 上运行时）
3. STS 临时凭证（用于假设角色）

常见错误及解决方法：

| 错误 | 原因 | 解决方法 |
|---|---|---|
| `AccessDenied` | IAM 策略缺少 Bedrock 权限 | 向 IAM 策略添加 `bedrock:InvokeModel` |
| `ModelNotAccessible` | 模型未在控制台中申请 | 在 AWS Console > Bedrock > Model Access 中启用 |
| `ThrottlingException` | 超过预置吞吐量 | 使用按需定价或申请更高配额 |

---

## Google Vertex AI

Vertex AI 是 Google Cloud 的统一 ML 平台，与 BigQuery、Dataflow 和 Pub/Sub 深度集成。如果你的数据管道已经在 GCP 上，这是理想选择。

配置方式与 Bedrock 类似：

```bash
claude config set provider vertex-ai
claude config set gcp-project "my-gcp-project-123"
claude config set gcp-location us-central1
```

Claude Code 使用应用默认凭证（Application Default Credentials），一次性设置即可：

```bash
gcloud auth application-default login
```

这会创建 `~/.config/gcloud/application_default_credentials.json`。也可以使用服务账号密钥：

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
claude status --provider vertex-ai
```

Vertex AI 使用与 Bedrock 相同的 Claude 模型，但提供 GCP 原生集成。例如，你可以直接从 BigQuery 数据集读取数据：

```claude
Read the file data/customers.csv and load it into BigQuery dataset 'analytics.staging'.
```

Claude Code 会自动将其转换为 `bq load` 命令，并使用你的 GCP 凭证执行。

---

## Microsoft Foundry

微软的 AI 平台与 Azure ML 和 Copilot Studio 集成。如果你的组织以 Azure 为标准，Foundry 提供：

- 带 GPU 资源池的托管推理
- 企业合规（ISO 27001、SOC2）
- 与 Azure DevOps、GitHub 和 Codespaces 的集成
- 通过 Azure Cost Management 进行成本治理

设置：

```bash
claude config set provider foundry
claude config set azure-subscription-id "12345678-..."
claude config set azure-resource-group "my-rg"
```

使用 Azure CLI 进行身份验证：

```bash
az login
az account set --subscription "12345678-..."
claude status --provider foundry
```

一个强大的使用模式：如果你的代码部署在 Azure Container Instances 或 App Service 中，可以将 Claude Code 指向该环境：

```bash
claude config set foundry-deployment-endpoint "https://my-app.azurewebsites.net"
```

现在 Claude Code 可以在该环境中执行，完整访问 Azure Key Vault、Managed Identity 和网络策略。

---

## LiteLLM 网关（模型路由）

LiteLLM 是一个开源代理，将多个 AI 服务商统一在同一个 API 后面。无需在 Bedrock、Vertex AI 和 OpenAI 之间来回切换，而是定义路由规则：

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

在本地启动 LiteLLM 服务器：

```bash
litellm --config ~/.litellm/config.yaml --port 8000
```

将 Claude Code 指向它：

```bash
claude config set provider litellm
claude config set litellm-base-url "http://localhost:8000"
claude config set litellm-model "claude-default"
```

优势：

- **自动故障转移**：Bedrock 宕机时，LiteLLM 自动切换到 Vertex AI
- **成本优化**：廉价任务路由到 Haiku，高要求任务路由到 Opus
- **服务商抽象**：无需修改代码即可切换服务商

一个实用场景：本地开发使用 Haiku（便宜），生产环境使用 Opus（精准）。LiteLLM 根据上下文自动路由：

```bash
# 开发环境
claude config set litellm-model "claude-budget"

# 生产环境
claude config set litellm-model "claude-default"
```

---

## 远程控制

有时你不在机器旁边——可能相隔 3000 英里，或者正在帮助同事调试他们的系统。远程控制让你从本地终端控制远程的 Claude Code 实例。

### 基本命令

```bash
claude remote-control --name production-server
```

这会发起与名为 `production-server` 的 Claude Code 实例的连接。远程机器必须具备：

1. 已安装 Claude Code
2. 守护进程正在运行：`claude daemon start`
3. 相同的身份验证令牌（或共享的凭证来源）

你的终端此时充当代理。你输入命令，它们在远程执行，结果实时流回。这是透明的——你感觉不到自己不在本地。

### 连接多台设备

注册多台机器：

```bash
# 你的开发机器
claude remote-control register --name dev-laptop --host 192.168.1.100 --port 7843

# 团队服务器
claude remote-control register --name team-gpu --host gpu-server.internal --port 7843

# 预发布环境
claude remote-control register --name staging-canary --host staging-01.prod.internal --port 7843
```

列出已注册的机器：

```bash
claude remote-control list
```

输出：
```
Name                  Host                        Port  Last Seen
dev-laptop            192.168.1.100               7843  2 minutes ago
team-gpu              gpu-server.internal         7843  1 hour ago
staging-canary        staging-01.prod.internal    7843  offline
```

连接到任意一台：

```bash
claude remote-control --name team-gpu
```

### 跨设备操作

你可以在一台机器上打开文件，在另一台上编辑：

```bash
# 在你的笔记本上，控制远程服务器
claude remote-control --name team-gpu
> Read /home/ml/models/llm-config.yaml
> Modify the batch size from 32 to 64
> Test the config by running /home/ml/test_config.sh
```

操作流程：

1. `Read` 在远程机器上执行
2. Claude Code 接收文件内容
3. 你在本地终端看到它
4. `Modify` 将修改写回远程机器
5. `Test` 在远程机器上运行
6. 输出流式传输到你的本地终端

所有凭证、SSH 密钥和 API 密钥都留在远程机器上，你的笔记本始终看不到它们。

### 从 claude.ai 发起连接

你也可以从 claude.ai Web 界面启动远程控制会话：

1. 访问 https://claude.ai/code
2. 点击 "Connect to Remote"
3. 输入机器名称或主机名
4. 授权连接（远程机器上会收到提示）
5. 在 Web 界面中开始输入命令

以下情况特别适用：
- 你正在使用平板电脑或 Chromebook（没有终端）
- 你想与团队成员共享视图（他们能在 Web UI 中看到你的光标）
- 你需要跨浏览器会话保持状态

---

## Teleport（Web ↔ CLI 桥接）

Teleport 是一个桥接 Web 会话和 CLI 会话的功能。你在一端开始工作，暂停，切换到另一端，然后继续。把它想象成上下文检查点。

### `--teleport` 标志

启动支持 Teleport 的会话：

```bash
claude --teleport
```

输出：
```
Session ID: tp_7f3a8c4b5d2e9a1f
Share link: https://claude.ai/code/tp_7f3a8c4b5d2e9a1f
```

复制链接，粘贴到浏览器中。你现在在两个地方拥有同一个会话：终端和 Web。你读取的文件、做出的编辑、运行的命令——全部实时同步。

典型工作流：

1. **本地启动**：在终端运行 `claude --teleport`
2. **构建上下文**：读取文件、运行测试、收集信息
3. **切换到 Web**：点击分享链接，将会话移到 claude.ai
4. **向同事说明**："这是我发现的"——他们在浏览器中看到你的文件和命令
5. **获得帮助**：他们通过 Web UI 提出修改建议
6. **回到终端**：切换回终端（你的机器持续运行）
7. **完成工作**：在本地执行最终命令

### `--remote` 标志

`--remote` 标志将此功能扩展到真实的远程机器：

```bash
claude --remote staging-env-01 --teleport
```

这会：
1. 连接到远程机器 `staging-env-01`
2. 开启 Teleport 会话
3. 显示分享链接

现在任何人都可以通过 Web 链接访问你的会话，实时观看你调试预发布环境。这在以下情况极为有用：

- **事故响应**："所有人，看我的终端，我来追踪这个生产 Bug"
- **结对调试**：无需屏幕共享，直接发送链接
- **异步协作**：团队成员可以稍后查看你做了什么并添加评论

随时撤销访问权限：

```bash
claude teleport revoke tp_7f3a8c4b5d2e9a1f
```

---

## Web 会话（claude.ai/code）

claude.ai/code 的 Web 界面提供了不同的控制模式：通过浏览器而非终端进行交互。对于基于云的工作流，这开辟了全新的可能。

### 云端虚拟机

如果你的代码运行在云端虚拟机上（EC2、GCE、Azure VM），可以从 Web 界面指向 Claude Code：

1. 确保虚拟机已安装 Claude Code 且守护进程正在运行：

```bash
# 在虚拟机上
curl https://install.anthropic.com/claude-code | bash
claude daemon start
```

2. 在 claude.ai/code 中点击 "Connect to Environment"
3. 选择 "Cloud VM" 并选择你的服务商（AWS、GCP、Azure）
4. 使用你的云凭证进行身份验证
5. Claude Code 自动发现你正在运行的实例
6. 选择你想控制的实例
7. 开始工作

浏览器充当 CLI 的 GUI 层。你仍然可以运行任何命令，同时还获得：

- 左侧文件树（点击可打开）
- 语法高亮
- 带可点击链接的终端输出
- 可视化变更差异查看器

### 连接器

对于团队使用，可以使用连接器注册共享环境：

```bash
# 管理员一次性设置连接器
claude connector create --name prod-cluster \
  --type kubernetes \
  --context prod-us-east \
  --credentials /path/to/kubeconfig
```

团队成员随后访问：

```bash
# 在 claude.ai/code 中
Select "Production Cluster" from the Environment dropdown
```

连接器抽象掉了 SSH、端口转发和凭证管理。团队所有成员都可以连接到共享基础设施，无需各自维护凭证。

### 网络策略

默认情况下，Claude Code 连接经过加密和身份验证。但你可以强制执行更严格的策略：

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

加载策略：

```bash
claude config load-policy ~/.claude/network-policy.yaml
```

这对于受监管行业（金融、医疗）至关重要——这些行业必须证明代码执行经过授权和审计。

---

## 实际架构示例

以下是一个真实场景：一个数据科学团队跨三个环境使用 Claude Code。

**配置：**

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

**工作流：**

1. **本地开发**：`claude`（使用 local-dev）
2. **在共享 GPU 上测试**：`claude --env shared-gpu`（使用 Bedrock）
3. **部署到生产**：`claude --env production`（使用 Vertex AI，需要 MFA）
4. **与同事结对调试**：`claude --teleport`（开启 Web 会话）

这种架构分离了不同关注点：本地实验、团队资源和生产系统，同时保持界面一致。

---

## 参考资料

- AWS Bedrock CLI：`aws bedrock-runtime invoke-model --help`
- Google Vertex AI 文档：https://cloud.google.com/vertex-ai/docs
- Microsoft Azure ML：https://learn.microsoft.com/en-us/azure/machine-learning/
- LiteLLM GitHub：https://github.com/BerriAI/litellm
- Claude Code 远程控制指南：在终端运行 `claude docs remote-control` 查看详情
- 网络策略规范：在终端运行 `claude docs network-policy` 查看详情

---

**接下来：** [第 5 章 — CLAUDE.md 最佳实践](./05-claude-md-patterns.md) — 适用于各类项目的经过实战检验的配置方案。
