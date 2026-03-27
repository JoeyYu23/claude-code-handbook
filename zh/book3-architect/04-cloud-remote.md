# 第 4 章：云服务商与远程控制

## 到处运行 Claude Code

Claude Code 被构建为在你的本地机器上工作。但如果你的工作跨越多个环境呢？如果你需要：

- 在 AWS 中的生产 GPU 集群上运行代码，但从你的笔记本电脑终端控制？
- 调试在 Google Cloud 上运行的管道，同时坐在咖啡店？
- 从你的 Mac 执行代码在远程 Windows 机器上？
- 让多个团队成员通过网络界面同时贡献相同代码库？

这些场景不再是边缘案例。它们越来越是默认值。基于云的工作流、分布式团队和异质基础设施现在是标准实践。Claude Code 通过三个集成系统处理所有这些：

1. **云服务商集成** — 将 Claude Code 路由到 Bedrock、Vertex AI 或 Azure Foundry
2. **远程控制** — 从终端访问和修改远程机器上的代码
3. **网络会话** — 使用 claude.ai/code 作为云虚拟机的桥梁

本章涵盖如何架构 Claude Code 部署跨越你的整个基础设施 — 从本地开发到全球规模。

---

## Amazon Bedrock 集成

Bedrock 是 AWS 的基础模型托管 API。它处理身份验证、速率限制和多区域故障转移，所以你不需要。优势巨大：你的 Claude Code 会话可以使用 AWS 基础设施、区域延迟优化端点和企业合规框架（SOC2、HIPAA、FedRAMP）。

### 设置与配置

首先，确保你的 AWS 凭证已就位。Claude Code 读取标准位置：

```bash
# ~/.aws/credentials
[default]
aws_access_key_id = AKIA...
aws_secret_access_key = ...

# 或环境变量
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Bedrock 需要你在 AWS 控制台请求模型访问。导航到 **Bedrock > Model Access**，然后检查你的区域中有哪些 Claude 模型可用。启用后，配置 Claude Code：

```bash
claude config set provider bedrock
claude config set bedrock-region us-east-1
claude config set bedrock-model claude-3-5-sonnet
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

| 模型 | 模型 ID | 区域 | 最好用于 |
|---|---|---|---|
| Claude 3.5 Sonnet | `claude-3-5-sonnet` | us-east-1, eu-west-1 | 默认选择 |
| Claude 3 Opus | `claude-3-opus` | us-east-1, us-west-2 | 复杂推理 |
| Claude 3 Haiku | `claude-3-haiku` | us-east-1, us-west-2, ap-southeast-1 | 成本优化 |

---

## Google Vertex AI

Vertex AI 是 Google Cloud 的统一 ML 平台。它与 BigQuery、Dataflow 和 Pub/Sub 集成，如果你的数据管道已在 GCP 中很理想。

配置类似于 Bedrock：

```bash
claude config set provider vertex-ai
claude config set gcp-project "my-gcp-project-123"
claude config set gcp-location us-central1
```

Claude Code 使用应用默认凭证。设置一次：

```bash
gcloud auth application-default login
```

这创建 `~/.config/gcloud/application_default_credentials.json`。

---

## Microsoft Foundry

Microsoft 的 AI 平台与 Azure ML 和 Copilot Studio 集成。如果你的组织标准化 Azure：

```bash
claude config set provider foundry
claude config set azure-subscription-id "12345678-..."
claude config set azure-resource-group "my-rg"
```

用 Azure CLI 认证：

```bash
az login
claude status --provider foundry
```

---

## LiteLLM 网关（模型路由）

LiteLLM 是一个开源代理，在一个 API 后面统一多个 AI 服务商。与其在 Bedrock、Vertex AI 和 OpenAI 间切换，你定义路由：

```yaml
model_list:
  - model_name: claude-default
    litellm_params:
      model: bedrock/claude-3-5-sonnet
      region: us-east-1

  - model_name: claude-budget
    litellm_params:
      model: bedrock/claude-3-haiku
      region: us-west-2
```

优势：

- **自动故障转移：** 如果 Bedrock 宕机，LiteLLM 自动转到 Vertex AI
- **成本优化：** 便宜任务路由到 Haiku，昂贵的到 Opus
- **服务商抽象：** 无代码改变切换服务商

---

## 远程控制

有时你不在机器旁。你离 3000 里或帮同事调试他们的系统。远程控制让你从本地终端控制远程 Claude Code 实例。

### 基本命令

```bash
claude remote-control --name production-server
```

这启动连接到名为 `production-server` 的 Claude Code 实例。远程机器必须有：

1. Claude Code 已安装
2. 守护进程运行：`claude daemon start`
3. 相同的认证令牌（或共享凭证源）

你的终端现在充当代理。你输入命令，它们远程执行，结果实时流回。这是透明的 — 你无法告诉你不是本地。

### 连接多个设备

注册多个机器：

```bash
claude remote-control register --name dev-laptop --host 192.168.1.100 --port 7843
claude remote-control register --name team-gpu --host gpu-server.internal --port 7843
claude remote-control register --name staging-canary --host staging-01.prod.internal --port 7843
```

列出已注册的机器：

```bash
claude remote-control list
```

连接到任何：

```bash
claude remote-control --name team-gpu
```

---

## Teleport（网络 ↔ CLI）

Teleport 是一个桥接网络和 CLI 会话的功能。你在一个开始工作、暂停、切换到另一个并恢复。考虑它为上下文检查点。

### `--teleport` 标志

启动一个 teleport 启用的会话：

```bash
claude --teleport
```

输出：
```
Session ID: tp_7f3a8c4b5d2e9a1f
Share link: https://claude.ai/code/tp_7f3a8c4b5d2e9a1f
```

复制链接、粘贴到浏览器。你现在有相同会话在两个地方：终端和网络。任何你读的文件、做的编辑、运行的命令 — 它们实时同步。

常见工作流：

1. **本地启动：** `claude --teleport` 在终端
2. **构建上下文：** 读文件、运行测试、收集上下文
3. **切换到网络：** 点击共享链接移动会话到 claude.ai
4. **解释给同事：** "这是我找到的" — 它们在浏览器看你的文件
5. **获得帮助：** 它们通过网络 UI 建议改变
6. **回到终端：** 切换回终端（你的机器保持运行）

撤销访问：

```bash
claude teleport revoke tp_7f3a8c4b5d2e9a1f
```

---

## 网络会话（claude.ai/code）

claude.ai/code 的网络界面提供了不同的控制模型：你通过浏览器交互而不是终端。对于基于云的工作流，这启用完全新的模式。

### 云虚拟机

如果你的代码在云虚拟机上运行（EC2、GCE、Azure VM），你可以从网络指向 Claude Code：

1. 确保虚拟机安装了 Claude Code 和守护进程运行
2. 从 claude.ai/code 点击"连接到环境"
3. 选择你的云服务商和实例
4. 开始工作

---

## 参考资料

- AWS Bedrock CLI：`aws bedrock-runtime invoke-model --help`
- Google Vertex AI 文档：https://cloud.google.com/vertex-ai/docs
- Microsoft Azure ML：https://learn.microsoft.com/en-us/azure/machine-learning/
- LiteLLM GitHub：https://github.com/BerriAI/litellm

---

**接下来：** [第 5 章 — CLAUDE.md 最佳实践](./05-claude-md-patterns.md)
