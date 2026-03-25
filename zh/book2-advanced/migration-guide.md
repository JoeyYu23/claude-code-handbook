# 附录 D：迁移指南

> 从其他 AI 编码工具迁移到 Claude Code 的实用指南。

---

## 从 GitHub Copilot 迁移

### 主要差异

| 功能 | GitHub Copilot | Claude Code |
|------|---------------|-------------|
| 工作模式 | 编辑器内补全 + 对话 | 终端 + 编辑器插件 |
| 上下文范围 | 当前文件 + 部分项目 | 整个项目 + 工具执行 |
| 执行能力 | 只生成代码 | 生成 + 执行 + 验证 |
| 持久记忆 | 无 | CLAUDE.md + Auto Memory |
| 自定义程度 | 有限 | 高度可定制 |

### 迁移步骤

```bash
# 1. 安装 Claude Code（保留 Copilot，可并行使用一段时间）
curl -fsSL https://claude.ai/install.sh | bash

# 2. 安装 VS Code 插件（如果使用 VS Code）
# 在扩展市场搜索 "Claude Code"

# 3. 在第一个项目中初始化 CLAUDE.md
cd your-project
claude
> /init
```

### 思维方式转变

Copilot 的核心使用模式是**补全驱动**（你写几个字，AI 补全）。

Claude Code 的核心使用模式是**任务驱动**（你描述目标，AI 完成任务）：

```
Copilot 方式：
  写 "function getUser" → 等待补全 → 接受/修改

Claude Code 方式：
  "在 src/users/service.ts 里实现 getUser 函数
   - 从 PostgreSQL 查询用户
   - 如果不存在抛出 UserNotFoundError
   - 参考 getProduct 函数的风格"
  → Claude 写代码 + 确保测试通过
```

### 快速上手建议

头两周并行使用，逐步把"需要 Copilot 补全"的场景迁移到"让 Claude Code 完成整个任务"。核心心智模型变化：从**逐行辅助**变成**委派整个任务**。

---

## 从 Cursor 迁移

### 主要差异

| 功能 | Cursor | Claude Code |
|------|--------|-------------|
| 界面 | IDE（Fork of VS Code） | 终端 + VS Code 插件 |
| Agent 功能 | Cursor Agent | Claude Code sub-agents |
| 持久化配置 | `.cursorrules` 文件 | `CLAUDE.md` 文件 |
| MCP 支持 | 有 | 完整支持，更丰富 |
| 自动化能力 | 较强 | 最强（完整 bash 访问） |

### .cursorrules 迁移到 CLAUDE.md

Cursor 的 `.cursorrules` 文件与 Claude Code 的 `CLAUDE.md` 几乎是直接对应关系：

```bash
# 简单迁移
cp .cursorrules CLAUDE.md

# 然后用 Claude 优化格式
claude "把 CLAUDE.md 中的 Cursor 特有指令调整为 Claude Code 的最佳实践格式"
```

常见的适配调整：

```markdown
# Cursor 中的写法
@workspace 使用 TypeScript strict mode

# Claude Code 中对应的写法（更明确）
使用 TypeScript strict mode。
tsconfig.json 中已配置 "strict": true，不要关闭任何 strict 检查。
```

### Cursor Composer → Claude Code Agent

```
Cursor Composer：在 IDE 内的多文件编辑界面
Claude Code：在终端中，但能力更强（可以运行测试、git、任意命令）

迁移模式：
Cursor: @file1 @file2 根据这两个文件生成新功能
Claude Code: 直接告诉 Claude 任务，让它自己找相关文件
```

---

## 从 Aider 迁移

### 主要差异

| 功能 | Aider | Claude Code |
|------|-------|-------------|
| 交互方式 | 终端对话 | 终端对话（类似） |
| Git 集成 | 自动提交为核心特性 | 支持，但可选 |
| 文件指定 | 命令行参数 `/add` | Claude 自动判断 + 你可以指定 |
| 配置文件 | `.aider.conf.yml` | `CLAUDE.md` |
| 多模型支持 | 广泛（支持 OpenAI 等） | Anthropic 模型 |

### 配置迁移

```yaml
# .aider.conf.yml（Aider）
model: claude-sonnet-4-6
auto-commits: true
dirty-commits: false
```

```markdown
# CLAUDE.md（Claude Code 对应配置）

## 代码提交规范
- 完成每个独立改动后，自动提交
- Commit message 格式：type(scope): 简短描述
- 不提交包含未通过测试的改动
```

### 工作流对比

```bash
# Aider 工作流
aider --model claude-3-5-sonnet src/auth.py
# 在会话中：/add src/middleware.py
# 然后对话...

# Claude Code 工作流
claude
# 直接描述任务，Claude 自己读取需要的文件
> 修改认证模块，支持 JWT refresh token
```

---

## 从 Copilot Chat / ChatGPT（网页）迁移

这个迁移需要最大的思维转变，因为从"聊天框里复制粘贴代码"变成"AI 直接操作代码库"。

### 关键能力升级

```
之前（网页 AI）：
1. 复制代码 → 粘贴到聊天框
2. 等待 AI 建议
3. 复制 AI 的代码
4. 粘贴回你的编辑器
5. 手动运行测试
6. 如果有问题，重复以上步骤

现在（Claude Code）：
1. 描述任务
2. Claude 直接修改代码、运行测试、修复问题
3. 你审查结果
```

### 消除"复制粘贴"习惯的练习

**练习一**：不再复制粘贴代码到 Claude Code 对话框。让 Claude 直接读文件：
```
# 不好的习惯
> [粘贴300行代码] 这段代码有什么问题？

# 好的习惯
> 读取 src/utils/parser.ts，告诉我有什么问题
```

**练习二**：让 Claude 运行代码来验证，不要只看 Claude 的"我认为这样能工作"：
```
> 实现完之后，跑一下测试确认没有破坏现有功能
```

---

## 通用迁移清单

```
环境准备：
□ 安装 Claude Code（curl 安装或 brew）
□ 登录 claude.ai 账号（/login）
□ 安装 VS Code 插件（如果需要）

项目配置：
□ 在主项目运行 /init 生成初始 CLAUDE.md
□ 迁移旧工具的配置规则到 CLAUDE.md
□ 添加 .claudeignore 排除无关文件
□ 测试 Claude Code 能正确读取项目

工作流调整：
□ 第一周：并行使用旧工具和 Claude Code
□ 识别 3 个高频任务，用 Claude Code 方式重新做一遍
□ 体验多文件任务的差异（这是最大的优势）
□ 设置 2-3 个常用的 custom skills（/命令）

两周后评估：
□ 哪些任务明显更快了？
□ 哪些工作流需要继续调整？
□ CLAUDE.md 是否需要补充？
```

---

## 常见迁移障碍

**障碍一：觉得需要手动控制每一步**

解法：从简单任务开始放手，逐步建立对 Claude 判断力的信任。

**障碍二：不确定 Claude 会读哪些文件**

解法：在 CLAUDE.md 中明确说明项目结构；或者在任务描述中指定"相关文件"。

**障碍三：不习惯在终端工作**

解法：安装 VS Code 插件，在编辑器内使用 Claude Code 对话面板，体验与 Cursor 更接近。

**障碍四：担心 Claude 直接修改文件出错**

解法：使用 git，每次修改前 Claude Code 都会提示你确认。出了问题 `git checkout -- .` 一键还原。

---

## 共存：与其他工具并行使用

Claude Code 不要求你放弃其他工具。许多有经验的开发者会同时使用：

- **Copilot 做行内补全**（打字辅助）+ **Claude Code 处理大型任务**（多文件变更、调试）
- **Cursor 作为编辑器** + **终端中的 Claude Code** 处理复杂任务
- **Aider 处理 git 为核心的工作流** + **需要 MCP 集成时用 Claude Code**

这些工具是互补的，并非互斥的。为工作流优化，而非为工具排他性优化。
