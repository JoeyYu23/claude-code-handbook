# 第三章：Skill 组合

## 为什么要组合 Skills？

单个 skill 解决单一问题。但真实的工程工作流往往是一串有序的步骤：分析 → 计划 → 执行 → 验证 → 报告。每个步骤可能需要不同的工具集、不同的专注点，甚至不同的模型。

Skill 组合让你能把这些步骤封装成可复用的模块，然后像搭积木一样拼接成完整的工作流程。

---

## 串联 Skills：顺序执行

最简单的组合方式是在一个 skill 里描述多个阶段，每个阶段调用另一个 skill：

```yaml
---
name: feature-ship
description: 完整的功能交付流程：代码审查 → 测试 → 提交 → PR
disable-model-invocation: true
---

完整执行功能 $ARGUMENTS 的交付流程：

## 阶段 1：代码审查
调用 /code-review，审查与 $ARGUMENTS 相关的所有改动文件。
如果发现 P0 问题，停止并报告，等待用户确认。

## 阶段 2：测试验证
运行相关测试套件，确认所有测试通过。
如果测试失败，报告失败原因并停止。

## 阶段 3：提交
调用 /git-commit 按照规范创建提交。

## 阶段 4：创建 PR
使用 `gh pr create` 创建 Pull Request，
- 标题格式：feat: <功能描述>
- Body 包含：改动摘要、测试结果、相关 issue 链接

完成后报告 PR 链接。
```

当然，Claude 在这里是"理解"这些阶段并依次执行——它不是在"调用"另一个 skill 的代码，而是在执行那个 skill 描述的行为。

---

## Skill 调用 Skill：真正的模块化

更强大的组合方式是利用 `context: fork`，让一个 skill 在子 agent 中运行，并把结果传回主对话：

### 示例：多维度代码分析流水线

**第一个 skill：安全扫描**

```yaml
---
name: security-scan
description: 扫描代码安全漏洞
context: fork
agent: Explore
allowed-tools: Read, Grep, Bash
---

扫描 $ARGUMENTS 中的安全问题，专注于：
- SQL 注入风险（字符串拼接进 SQL 查询）
- XSS 漏洞（未转义的用户输入渲染到 HTML）
- 硬编码密钥或凭证
- 不安全的反序列化
- 路径遍历漏洞

用 JSON 格式输出：
{
  "critical": [{"file": "...", "line": N, "issue": "..."}],
  "high": [...],
  "medium": [...],
  "summary": "..."
}
```

**第二个 skill：性能分析**

```yaml
---
name: perf-scan
description: 分析代码性能问题
context: fork
agent: Explore
allowed-tools: Read, Grep
---

分析 $ARGUMENTS 的性能问题，关注：
- N+1 查询（循环内数据库调用）
- 不必要的全表扫描（缺少索引）
- 同步执行可并发的操作
- 内存泄漏风险（未释放的资源）

用 JSON 格式输出分析结果。
```

**组合 skill：综合代码质量报告**

```yaml
---
name: quality-report
description: 生成全面的代码质量报告（安全 + 性能 + 可读性）
disable-model-invocation: true
argument-hint: <path>
---

对 $ARGUMENTS 生成全面的代码质量报告。

同时执行以下三个分析（可以并行）：
1. 调用 /security-scan $ARGUMENTS
2. 调用 /perf-scan $ARGUMENTS
3. 对代码可读性进行内联分析（命名、复杂度、注释覆盖率）

汇总三个维度的结果，生成以下格式的报告：

---
# 代码质量报告：$ARGUMENTS

## 执行摘要
- 安全评分：X/10
- 性能评分：X/10
- 可读性评分：X/10
- 综合评分：X/10

## 关键问题（需要立即处理）
...

## 建议改进（按优先级）
...

## 详细分析
...
---
```

---

## 并行执行 Skills

上面的例子提到"可以并行"——Claude Code 支持通过 `/batch` 等内置 skill 真正并行运行多个子 agent。对于自定义 skill，可以这样设计：

```yaml
---
name: full-audit
description: 对整个代码库进行全面审计
context: fork
agent: general-purpose
---

对代码库进行全面审计。

在同一时间启动以下独立任务（使用子 agent 并行执行）：

任务 A：后端代码质量审计
- 审计 src/api/ 和 src/services/ 目录
- 关注：错误处理、输入验证、业务逻辑正确性

任务 B：前端代码质量审计
- 审计 src/components/ 和 src/pages/ 目录
- 关注：性能（不必要的重渲染）、可访问性、用户体验问题

任务 C：测试覆盖率分析
- 分析所有 __tests__ 目录
- 计算覆盖率，识别缺失测试的关键路径

等所有任务完成后，汇总结果生成综合报告。
```

---

## 用 Skills 构建工作流自动化

### 示例：Bug 修复工作流

这个工作流把 "bug 报告 → 定位 → 修复 → 验证" 完整封装：

```yaml
---
name: fix-bug
description: 完整的 bug 修复工作流：复现 → 定位 → 修复 → 验证
disable-model-invocation: true
argument-hint: <bug-description-or-issue-number>
allowed-tools: Read, Edit, Bash, Grep, Glob
---

# Bug 修复工作流

输入：$ARGUMENTS

## 步骤 1：理解 Bug

如果输入是 issue 编号（纯数字），先运行：
`gh issue view $ARGUMENTS`

如果是文字描述，直接进入步骤 2。

## 步骤 2：复现尝试

查找并运行相关测试，尝试复现问题。
如果无法复现，询问用户提供更多信息。

## 步骤 3：根因定位

使用 Grep 搜索相关代码，追踪错误的传播路径。
定位到具体的文件和行号。
解释根因（为什么会出错，不只是在哪里出错）。

## 步骤 4：制定修复方案

在实际修改之前，先呈现修复方案：
- 将改动哪些文件
- 具体做什么改动
- 为什么这样改能解决问题
- 有没有潜在的副作用

等待用户确认（直接描述方案，不要问"要继续吗"这种问题，给出方案后直接等）。

## 步骤 5：实施修复

按照确认的方案实施改动，保持改动最小化。

## 步骤 6：验证

运行相关测试，确认：
1. 原来的 bug 不再复现
2. 没有引入新的测试失败

## 步骤 7：提交

创建提交，格式：
`fix: <简洁描述修复内容>`

提交信息 body 包含根因说明和修复逻辑。
```

### 示例：功能文档生成工作流

```yaml
---
name: gen-docs
description: 为指定模块生成技术文档（README + API 文档 + 使用示例）
disable-model-invocation: true
argument-hint: <module-path>
allowed-tools: Read, Write, Glob, Bash
---

为 $ARGUMENTS 生成完整的技术文档。

## 分析阶段

1. 读取所有相关源文件
2. 提取：
   - 公开 API（函数/类/方法签名）
   - 依赖关系（imports）
   - 已有的注释和 docstring
   - 测试文件（了解使用方式）

## 生成内容

### 1. README.md（放在模块目录）
包含：
- 模块用途（一句话）
- 安装/依赖（如有）
- 快速开始示例
- API 概览表格

### 2. API.md（放在模块目录）
对每个公开函数/类：
- 函数签名
- 参数说明（类型、含义、默认值）
- 返回值
- 可能抛出的异常
- 使用示例

### 3. EXAMPLES.md（放在模块目录）
3-5 个真实使用场景，每个包含：
- 场景描述
- 完整可运行的代码示例
- 预期输出

## 质量要求

- 示例代码必须使用真实的类名、函数名（从源码中提取）
- 不要写"TODO: 补充示例"之类的占位符
- 技术术语保持与源码一致
```

---

## Skill 库设计原则

### 原则 1：单一职责

每个 skill 只做一件事，做好一件事。`code-review` 不应该同时负责提交代码；`deploy` 不应该同时生成文档。

坏的设计：
```yaml
name: code-review-and-commit-and-deploy
```

好的设计：
```yaml
# 三个独立 skill，各司其职
name: code-review
name: git-commit
name: deploy
```

### 原则 2：组合优于继承

需要复杂功能时，组合多个简单 skill，而不是创建一个臃肿的 skill。

### 原则 3：副作用隔离

有副作用的 skill（会写文件、运行命令、调用 API）必须加 `disable-model-invocation: true`。没有副作用的 skill（只读分析）可以让 Claude 自动触发。

### 原则 4：失败处理

在 skill 内容中明确说明失败时的处理方式：

```markdown
## 错误处理

如果测试失败：
- 列出所有失败的测试名称
- 对每个失败给出可能的原因
- 停止流程，等待用户决定

不要尝试自动修复测试失败（除非用户明确要求）。
```

### 原则 5：SKILL.md 保持简洁

建议 SKILL.md 不超过 500 行。详细的参考材料移到单独文件，在 SKILL.md 中引用。

---

## 团队 Skill 库建设

对于团队项目，建议在 `.claude/skills/` 中建立一套标准 skill：

```
.claude/skills/
├── review/
│   ├── SKILL.md           # 代码审查
│   └── checklist.md       # 团队审查清单
├── commit/
│   └── SKILL.md           # 按团队规范提交
├── deploy/
│   ├── SKILL.md           # 部署流程
│   └── environments.md    # 环境配置说明
├── test/
│   └── SKILL.md           # 运行测试并生成报告
└── onboarding/
    ├── SKILL.md            # 新成员上手指南
    └── architecture.md    # 项目架构说明
```

把这些文件提交到版本控制，团队所有成员自动获得统一的工作流工具。

---

## 社区 Skills 资源

Claude Code 的 Skill 系统遵循 [agentskills.io](https://agentskills.io) 开放标准，这意味着：

1. 你在 Claude Code 写的 skill 可以被其他支持同标准的 AI 工具使用
2. 社区分享的 skill 可以直接在你的 Claude Code 中使用

寻找社区 skill 的地方：
- GitHub 搜索 `SKILL.md language:yaml`
- Claude Code 插件市场（通过 `/plugin` 管理）
- 团队内部 wiki

---

## 本章总结

Skill 组合的核心思路：

1. **小而专一**：每个 skill 解决一个问题
2. **串联**：用一个 skill 描述调用其他 skill 的流程
3. **并行**：用 `context: fork` 同时运行独立任务
4. **动态注入**：用 `!`命令`` 在运行时获取真实数据
5. **团队共享**：把 skill 提交到版本控制，与团队同步

掌握 skill 组合后，下一步是理解 Sub-agents——Claude Code 的真正并行计算单元。

---

**下一章：** [Sub-agents 详解](./04-subagents.md)
