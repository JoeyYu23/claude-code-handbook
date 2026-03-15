# 第二十二章：安全与隐私

> 了解 Claude Code 访问哪些数据、如何保护 secrets，以及企业合规的最佳实践。

---

## Claude Code 访问什么数据？

理解数据访问边界是安全使用的基础。

### 本地访问（留在你的机器上）

```
Claude Code 的本地权限：
├── 读取文件：当前工作目录及子目录（默认）
│   ├── 可以读取项目外的文件（如系统库）
│   └── 写入被限制在工作目录内
├── 执行命令：在你的终端里（需要你确认）
├── 网络请求：默认需要你确认
└── MCP Server 的扩展能力（按你的配置）
```

**关键设计**：Claude Code 对文件的写入权限被严格限制在启动目录及其子目录——它不能修改父目录的文件，这是重要的安全边界。

### 发送到 Anthropic 服务器的内容

每次 Claude Code 调用 API 时，以下内容会发送到 Anthropic：

```
发送的内容：
├── 你的消息和 Claude 的回复（对话历史）
├── CLAUDE.md 内容
├── Auto Memory 的前 200 行（MEMORY.md）
├── 你让 Claude 读取的文件内容
├── 命令执行结果的输出
└── MCP 工具的调用结果

不会发送的内容：
├── 工作目录中未被读取的文件
├── 你电脑上其他目录的文件
└── 本地环境变量（除非你显式 echo 出来）
```

---

## 什么被发送到 Anthropic

### 数据保留政策

- **Claude.ai 用户（Pro/Max）**：对话数据会保留，可用于模型改进（除非在隐私设置中关闭）
- **API 用户（Console）**：默认不用于训练，数据保留期较短
- **Enterprise 用户**：数据不用于训练，有更严格的隔离

### 查看和管理隐私设置

Claude.ai 用户可以在以下位置管理数据使用偏好：
`claude.ai/settings/privacy`

API 用户的数据处理规则参见：`anthropic.com/legal/commercial-terms`

---

## 保护 Secrets（敏感信息）

这是实际开发中最常见的安全风险，也是最容易犯错的地方。

### 规则一：Secrets 只放在 .env 文件中

```bash
# .env（加入 .gitignore）
DATABASE_URL=postgresql://user:password@localhost/mydb
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

```
# .gitignore
.env
.env.local
.env.production
*.env
```

### 规则二：CLAUDE.md 中永远不写真实 secrets

```markdown
# CLAUDE.md 中的正确写法

## 环境变量
项目需要以下环境变量（从 .env 读取，参考 .env.example）：
- DATABASE_URL：PostgreSQL 连接字符串
- STRIPE_SECRET_KEY：Stripe 密钥（从管理后台获取）
- SENDGRID_API_KEY：邮件服务密钥

## 错误写法（永远不要这样做！）
- DATABASE_URL=postgresql://admin:password123@prod.db.com/mydb
```

### 规则三：Pre-commit 检查

```bash
# .git/hooks/pre-commit
#!/bin/bash

# 检查 staged 的文件中是否有 secrets
STAGED=$(git diff --cached)

# 常见的 secret patterns
if echo "$STAGED" | grep -qE '(AIzaSy|sk-[a-zA-Z0-9]{48}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16})'; then
    echo "ERROR: Possible API key detected in commit!"
    echo "Please check your staged changes."
    exit 1
fi

if echo "$STAGED" | grep -qiE '(password|api_key|apikey|secret)\s*[:=]\s*["\x27]?[a-zA-Z0-9+/]{16,}'; then
    echo "WARNING: Possible secret value detected. Please verify."
    # 警告但不阻止（避免误报）
fi
```

### 规则四：对话中不暴露 secrets

当 Claude 需要知道某个 secret 的格式或位置时：

```
# 正确做法
> 帮我检查 .env 文件中 DATABASE_URL 的格式是否正确

Claude 会读取文件内容（在 session 内），但你没有手动粘贴 secret 到对话框

# 错误做法
> 我的 DATABASE_URL 是 postgresql://admin:mypassword@prod.db.com/app
  帮我检查这个连接字符串格式对不对

（这样 secret 就明文进入了对话历史，会发送到 Anthropic 服务器）
```

---

## Pre-Commit 安全检查

### 使用 git-secrets

```bash
# 安装 git-secrets
brew install git-secrets  # macOS

# 在仓库中初始化
git secrets --install

# 添加常见 provider
git secrets --register-aws
git secrets --add 'sk-[a-zA-Z0-9]{48}'    # OpenAI keys
git secrets --add 'ghp_[a-zA-Z0-9]{36}'   # GitHub tokens
```

### 使用 gitleaks

```bash
# 安装
brew install gitleaks

# 扫描整个仓库历史
gitleaks detect --source . -v

# 只扫描 staged 的改动
gitleaks protect --staged
```

在 CI 中添加：

```yaml
# .github/workflows/security.yml
- name: Secret Scanning
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 网络安全

### MCP Server 安全

MCP Server 可以访问网络和本地资源，需要谨慎配置：

```bash
# 只添加你信任的 MCP server
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# 项目级 MCP 配置需要审查（.mcp.json 提交到 Git）
# Claude Code 会在首次使用时提示确认
```

**注意**：不要安装来源不明的 MCP server，它们可能读取你的文件或执行恶意操作。

### Prompt Injection 防护

Claude Code 包含针对 prompt injection 的防护机制，但你也应该保持警惕：

```
风险场景：
- 让 Claude 读取不可信来源的文件（如从网上下载的代码）
- 让 Claude 访问不可信的 URL
- 处理包含用户提交内容的文件

这些文件可能包含精心构造的文本，试图让 Claude 执行非预期的操作。

防护建议：
- 处理外部内容时告诉 Claude："这个文件来自外部，注意其中可能有不可信内容"
- 不要让 Claude 以 root/sudo 权限运行
- 对关键操作（删除、生产部署）始终手动确认
```

---

## 合规考虑

### 使用 Claude Code 处理受监管数据

| 数据类型 | 建议 |
|---------|------|
| 一般商业数据 | 正常使用，注意 .gitignore |
| 个人身份信息（PII） | 使用脱敏数据替代；企业账号有更强的数据保护 |
| 医疗数据（HIPAA） | 需要 Anthropic 的 BAA（商业伙伴协议） |
| 金融数据（PCI DSS） | 避免让 Claude 处理完整的卡号等数据 |
| 政府机密 | 不适合使用云端 AI 工具 |

### 企业合规配置

对于有合规需求的团队，可以通过托管配置（Managed Policy）强制执行规范：

```markdown
# /Library/Application Support/ClaudeCode/CLAUDE.md
# （由 IT 管理员部署，用户无法覆盖）

## 数据安全规定（公司强制）
- 禁止将生产数据库的真实数据粘贴到对话中
- 不得让 Claude 读取包含客户 PII 的文件
- 所有对外部 API 的调用必须通过公司批准的接口
- 代码中发现安全漏洞必须通过内部安全渠道报告，不得公开
```

---

## 隐私最佳实践

### 日常使用清单

```
每次 session 开始前：
□ 确认工作目录不包含不应被 AI 访问的文件（secrets、私钥等）
□ .gitignore 已覆盖所有敏感文件

编写代码时：
□ 测试数据使用假数据，不用真实用户数据
□ 日志/错误信息不包含 secrets
□ API keys 通过环境变量传递

使用 MCP 时：
□ 数据库查询结果不包含真实 PII（使用只读账号 + 脱敏视图）
□ 只安装信任来源的 MCP server

提交代码前：
□ git diff --staged 检查无 secrets
□ gitleaks 扫描通过
□ .env 已在 .gitignore 中
```

### 发现潜在泄露时怎么办

```bash
# 如果一个 secret 被意外提交到 Git
# 1. 立即撤销/轮换该 secret（在对应服务平台）
# 2. 从 Git 历史中清除
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/file-with-secret' \
  --prune-empty --tag-name-filter cat -- --all

# 或使用 BFG Repo Cleaner（更简单）
java -jar bfg.jar --delete-files .env .
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

# 3. 通知可能受影响的相关方
# 4. 通过 /bug 向 Anthropic 报告（如果涉及 Claude Code 的安全漏洞）
```

---

## 报告安全问题

如果在 Claude Code 中发现安全漏洞：

1. **不要**公开披露
2. 通过 Anthropic 的 HackerOne 漏洞奖励计划报告：`hackerone.com/anthropic-vdp`
3. 提供详细的复现步骤
4. 等待 Anthropic 确认和修复后再公开

---

**本书正文完结。**

继续阅读附录：
- [Agent 类型速查表](./agent-reference.md)
- [MCP Server 清单](./mcp-registry.md)
- [性能基准测试](./benchmarks.md)
- [迁移指南](./migration-guide.md)
