# 第十五章：上下文窗口管理

> 理解什么在占用 context，掌握压缩时机，让长 session 保持高效。

---

## 理解 Context Window

Claude Code 每次调用模型 API 时，都需要把"当前对话状态"传入，这个状态就是 context window 的内容。Context window 有大小限制（以 token 计算），满了就无法继续对话。

### Context Window 里有什么？

```
一个典型的 Claude Code session context 组成：

┌─────────────────────────────────┐
│  System Prompt (~2,000 tokens)  │  ← 每次对话都有，固定
├─────────────────────────────────┤
│  CLAUDE.md 内容 (~1,000 tokens) │  ← 项目规范，固定
├─────────────────────────────────┤
│  Auto Memory (~500 tokens)      │  ← MEMORY.md 前200行
├─────────────────────────────────┤
│  对话历史 (变量)                 │  ← 你和 Claude 的所有交流
│  - 你的消息                     │
│  - Claude 的回复                │
│  - 工具调用记录（读文件、运行命令）│
├─────────────────────────────────┤
│  当前消息 + 文件内容             │  ← 本次请求的内容
└─────────────────────────────────┘
```

### 什么最占空间？

1. **读取大文件**：每次 `Read` 操作都把文件内容加入 context。读了 5 个大文件 = 大量 token
2. **命令输出**：运行测试或 lint 时，完整输出都会记录
3. **多轮对话历史**：每一轮对话都累积
4. **MCP 工具结果**：数据库查询返回大量数据时，全部进入 context

---

## /compact 命令和自动压缩

### 手动压缩：/compact

当 Claude 感觉上下文过多时，可以手动触发压缩：

```
/compact
```

`/compact` 做的事情：
1. 调用 Claude 把整个对话历史**压缩为摘要**
2. 保留关键决策、代码修改和正在进行的任务
3. 丢弃不再需要的中间步骤和冗余内容
4. 让 context 大幅缩小，但保持工作连续性

**压缩后**：CLAUDE.md 从磁盘重新加载，保证规范不丢失。

### 自动压缩

当 context 达到容量的约 95% 时，Claude Code 自动触发压缩。你会看到提示：

```
Context window is nearly full. Auto-compacting conversation...
```

自动压缩是保底机制——最好不要依赖它，主动在合适时机压缩效果更好。

### 带自定义焦点的压缩

```
/compact 请保留所有关于认证模块的讨论，以及我们已确定的架构决策
```

---

## 在逻辑断点处策略性压缩

**核心原则**：在一个任务完成、下一个任务开始之前压缩，而不是等到撑满。

### 好的压缩时机

```
✓ 完成了一个 feature，准备开始下一个
✓ debug 成功，问题已解决
✓ 刚做完一次大规模的代码阅读，准备开始写代码
✓ 跑完了大量测试，看了很多输出
✓ 探索了一个不熟悉的代码库，准备开始修改
```

### 不好的压缩时机

```
✗ 正在 debug 中间，还有很多相关上下文
✗ 对话历史里有你很快就需要参考的代码
✗ 刚刚让 Claude 分析了一个复杂问题，正在等它给建议
```

### 压缩前的最佳实践

在 `/compact` 之前，让 Claude 把关键内容记录下来：

```
> 在我们压缩 context 之前，请把以下内容写入 CLAUDE.md：
  1. 我们今天确定的 API 设计规范
  2. 我们发现并修复的那个 race condition 的根本原因
  3. 还未完成的 TODO 列表

然后执行 /compact
```

---

## 保持上下文聚焦

最好的 context 管理是在源头减少不必要的 context。

### 技巧一：精确描述要读的文件

```
# 不好的做法（会读取大量不必要的文件）
> 帮我理解整个认证系统

# 好的做法
> 只看 src/auth/middleware.ts 和 src/auth/jwt.ts
  我想了解 JWT 验证的流程
```

### 技巧二：限制命令输出

```
# 不好的做法（测试输出可能很长）
> 运行所有测试

# 好的做法
> 只运行 auth 相关的测试
  npm test -- --grep "auth" 2>&1 | tail -50
```

### 技巧三：分阶段工作

```
# 第一个 session：理解代码
claude "帮我理解 payments 模块的架构，给我一个结构总结"
# 把总结手动保存到 notes.md

# 第二个 session：实现功能（加载 notes.md 而不是重新探索）
claude "根据 @notes.md 中的架构，在 payments 模块添加退款功能"
```

### 技巧五：用 `/btw` 提问而不污染 context

`/btw <问题>` 打开一个**旁路对话**（side conversation），不会将问答内容累积到主 context 中。v2.1.72（2026 年 3 月）引入。

- 复用父级对话的 prompt cache，几乎零额外 context 成本
- 适合快速查询（"这个函数的签名是什么？""TypeScript 的 `satisfies` 怎么用？"）而不打断正在进行的任务
- 旁路对话中 Claude 可以看到当前完整 context，但**无法使用工具**（不能读文件、运行命令）
- 问答以浮层形式显示，关闭后自动返回主对话，不留痕迹

与 subagent 相反：subagent 有完整工具但空 context，`/btw` 有完整 context 但无工具。需要查新信息用 subagent，需要问已有 context 里的事用 `/btw`。

### 技巧四：善用 .claudeignore

在项目根目录创建 `.claudeignore`，排除 Claude 不需要看的文件：

```
# .claudeignore
node_modules/
dist/
*.log
coverage/
.next/
*.min.js
*.map
```

这不仅减少 context 占用，还能让 Claude 更快地找到相关文件。

---

## 上下文快满的信号

识别这些信号，及时压缩：

### 显式信号

```
# Claude Code 界面提示
"Context window is 85% full"
"Auto-compacting conversation..."
```

### 隐式信号

- Claude 开始"忘记"你早些时候说过的事情
- 回复变慢（处理更大的 context 耗时更长）
- Claude 开始重复已经确认过的信息
- 你发现自己在重新解释之前讲过的背景

---

## 长 Session 技巧

### 技巧一：活用 CLAUDE.md 做持久化

任何需要跨越 `/compact` 的信息，都写进 CLAUDE.md：

```markdown
# 当前工作状态（2024-01-15）

## 进行中的任务
- [ ] 实现用户头像上传功能
- [x] 修复 S3 URL 签名 bug
- [ ] 添加上传进度显示

## 已确定的技术决策
- 使用 multipart upload（文件 > 10MB）
- 压缩图片到最大 1920px，质量 85%
- 存储路径格式：avatars/{userId}/{timestamp}.{ext}

## 已知问题
- Safari 上 FormData 需要额外处理
```

### 技巧二：里程碑式提交

完成每个子任务后立即 commit，这样即使 session 中断，进度也不会丢失：

```
每完成一个逻辑单元：
1. 运行测试确认通过
2. commit 代码
3. 更新 CLAUDE.md 中的任务状态
4. 如果 context 较大，执行 /compact
```

### 技巧三：使用命名 session

给长期工作的 session 起名字（通过 `/rename` 命令），方便识别和恢复：

```
/rename "支付系统重构 - Sprint 23"
```

### 技巧四：Monitor context 用量

在 Claude Code 中随时查看当前 context 占用：

```
/status

输出示例：
Context: 67,432 / 200,000 tokens (33%)
Cost this session: $0.24
```

---

## Context 管理心智模型

把 context window 想象成一个**工作桌面**：
- 桌面有限，放太多东西就找不到需要的
- 定期整理（`/compact`）保持桌面整洁
- 重要的参考资料放在抽屉里（CLAUDE.md、memory 文件），随时可以取出
- 完成一个任务后清理相关材料，再开始下一个

---

**下一章：** [Token 优化](./16-token-optimization.md)
