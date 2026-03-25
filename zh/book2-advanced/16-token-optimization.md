# 第十六章：Token 优化

> 理解成本结构，做对模型选择，用高效的 prompting 模式——让每一分钱发挥最大价值。

---

## 理解 Token 成本结构

使用 Claude Code 会产生 API 调用费用（除非你使用 Pro/Max 订阅的包月额度）。理解成本结构是优化的基础。

### Token 类型

| Token 类型 | 说明 | 相对成本 |
|-----------|------|---------|
| Input tokens | 发送给 Claude 的内容（context + 消息） | 基准 |
| Output tokens | Claude 生成的回复 | 约 3-5x input 价格 |
| Cache read tokens | 命中 prompt cache 的 input tokens | 约 10% input 价格（自动生效） |
| Thinking tokens | Extended thinking 模式下的内部推理 | 与 output 相同，可用 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1` 关闭 |

### 一个典型 session 的成本构成

```
典型编码 session（1小时）：
- Input tokens:  ~50,000  → $0.15  (Claude Sonnet 4.6)
- Output tokens: ~20,000  → $0.30
- Cache hits:    ~80,000  → $0.08  (CLAUDE.md 被缓存)
- 合计: ~$0.53/小时

重文件探索 session（大项目）：
- Input tokens:  ~200,000 → $0.60
- Output tokens: ~30,000  → $0.45
- 合计: ~$1.05/小时
```

---

## 模型选择策略：Opus vs Sonnet vs Haiku

Claude Code 支持三个档次的模型，选对模型是最大的成本杠杆。

### 模型对比

| 模型 | 智力水平 | 速度 | 适用场景 |
|------|---------|------|---------|
| Claude Opus 4.6 | 最强 | 最慢 | 复杂架构设计、多文件调试、研究分析 |
| Claude Sonnet 4.6 | 强 | 快 | 日常编码、功能实现、代码审查（默认推荐） |
| Claude Haiku 4.5 | 良 | 极快 | 简单查询、格式化、低复杂度任务 |

### 实际使用建议

```bash
# 启动时指定模型
claude --model claude-opus-4-6      # 复杂问题
claude                               # 默认 Sonnet 4.6
claude --model claude-haiku-4-5     # 批量简单任务
```

也支持模型别名：`opus`、`sonnet`、`haiku`、`sonnet[1m]`、`opus[1m]`、`opusplan`。

### 任务-模型匹配表

```
Haiku 够用的场景：
✓ "帮我把这段代码格式化一下"
✓ "这个函数加个 JSDoc 注释"
✓ "把这些 console.log 都删掉"
✓ "生成一个简单的 CRUD 路由"

Sonnet 是最佳选择：
✓ 实现一个新功能（5-10 个文件）
✓ 修复 bug（需要理解上下文）
✓ 代码审查和改进建议
✓ 写单元测试
✓ 重构现有代码

Opus 才值得的场景：
✓ 设计整个系统架构
✓ 调试复杂的并发问题
✓ 理解并改进遗留代码库
✓ 跨越 10+ 文件的大型重构
✓ 需要深入推理的安全审计
```

---

## 减少不必要的 Context

### 原则一：精准读文件

```
# 高成本：让 Claude 扫描整个代码库
> 帮我找出所有使用了 deprecated API 的地方

# 低成本：先用工具定位，再让 Claude 分析
> 我用 grep 找到了以下使用 deprecated API 的位置：
  [粘贴 grep 结果]
  帮我制定一个迁移计划
```

### 原则二：分批处理大任务

```
# 不好：一次性读取所有相关文件
> 帮我重构整个 auth 模块（10 个文件）

# 好：分批进行，每批压缩后继续
> 第一步：只看 auth/index.ts 和 auth/types.ts
  告诉我需要改什么接口
---（/compact）---
> 根据刚才确定的接口变更，修改 auth/middleware.ts
---（/compact）---
> 继续修改 auth/handlers.ts
```

### 原则三：用 --print 做单次任务

对于不需要对话的任务，用 `--print` 模式，不积累 context：

```bash
# 每次都是全新 session，无历史 context
claude --print "解释 src/utils/crypto.ts 这个文件的作用"
claude --print "帮我把 README.md 翻译成英文"

# 管道模式：只处理你传入的内容
cat error.log | claude --print "这个错误日志有什么问题？"
git diff | claude --print "这次变更有没有安全风险？"
```

---

## 高效 Prompting 模式

### 模式一：任务优先，背景其次

```
# 低效（先给大量背景，再说任务）
> 我们这个项目是一个电商平台，使用了 React + TypeScript...
  后端是 Express + PostgreSQL...
  我们有大约 50 个 API endpoint...
  [200 字背景]
  请帮我实现一个搜索功能

# 高效（先说任务，需要时 Claude 自己看代码）
> 在 src/api/search.ts 中实现商品搜索 API
  支持按名称、分类、价格范围过滤
  参考 src/api/products.ts 中的代码风格
```

### 模式二：指定输出格式

当你知道自己需要什么格式时，直接说——避免 Claude 生成多余的解释文字：

```
# 只要代码，不要解释
> 写一个 debounce 函数，只给代码，不要注释

# 只要 JSON
> 给我 5 个测试用的用户数据，JSON 数组格式

# 简洁回复
> 这个正则表达式 /^[\w-]+$/ 匹配什么？一句话回答
```

### 模式三：利用 Prompt Caching

Claude API 会自动对 context 的前缀部分进行缓存。CLAUDE.md 内容会被缓存，重复读取基本免费。利用这一点：

```markdown
# CLAUDE.md（把常用参考资料放进来，让它被缓存）

## 项目架构（缓存后读取几乎免费）
[完整的架构说明]

## 代码规范（缓存后读取几乎免费）
[完整的编码规范]

## 常用命令参考（缓存后读取几乎免费）
[命令列表]
```

---

## 用 /context 可视化上下文用量

`/context` 命令显示当前 context window 的使用情况，并给出优化建议：

```text
/context
```

输出显示哪些内容占用了最多 token——哪些文件较大、对话历史积累了多少、是否适合压缩。

---

## 用 /effort 控制推理深度

对于希望在速度和质量之间权衡的任务，使用 `/effort` 命令：

```text
/effort low      # 最快、最便宜——适合简单查询
/effort medium   # 均衡（默认）
/effort high     # 更深入的推理
/effort max      # 最大推理深度——仅限 Opus 4.6，非持久
```

`/effort max` 激活最高推理深度，仅适用于 Claude Opus 4.6，且不会持续到下一个任务。

---

## 用 /cost 监控开销

在 session 中随时查看费用：

```text
/cost

输出：
Session cost: $0.34
  Input tokens:  45,231 ($0.14)
  Output tokens: 12,045 ($0.18)
  Cache reads:   23,100 ($0.02)

Total session time: 23 minutes
Average cost/minute: $0.015
```

### 成本对比技巧

```bash
# 用不同模型处理同一任务，比较成本和质量
claude --model claude-haiku-4-5 --print "解释这个函数" < func.ts
claude --model claude-sonnet-4-6 --print "解释这个函数" < func.ts
```

---

## 预算管理策略

### 为团队设置用量限制

在 Claude Console 中可以设置：
- 每日/每月的 token 用量上限
- 按项目/用户分配预算
- 超限告警

### 个人订阅用户的成本控制

如果使用按量计费的 API key：

```bash
# .env 或环境变量
export CLAUDE_MAX_TOKENS_PER_SESSION=100000  # 每 session 最多消耗 token 数

# 在 CLAUDE.md 中声明优化偏好
# 告诉 Claude 应该节省 token
```

```markdown
# CLAUDE.md 中的 token 优化指令示例

## 模型偏好
对所有任务默认使用 claude-sonnet-4-6。
仅在明确要求架构推理或调试持续性问题时使用 claude-opus-4-6。

## 回复风格
- 代码直接输出，不加解释，除非我明确要求
- 错误信息给出修复方案，不重复问题描述
- 使用简洁的中文，避免冗余表达
```

### 真实成本数据参考

下表基于 Claude Sonnet 4.6 的实际使用统计（仅供参考，价格随 Anthropic 定价调整）：

| 任务类型 | 典型 token 消耗 | 约合费用 |
|---------|--------------|---------|
| 修复单个 bug | 5,000-15,000 | $0.05-0.15 |
| 实现小功能（1-3 文件） | 15,000-40,000 | $0.15-0.40 |
| 代码审查（PR） | 20,000-60,000 | $0.20-0.60 |
| 大功能开发（5-10 文件） | 50,000-150,000 | $0.50-1.50 |
| 探索陌生代码库 | 80,000-200,000 | $0.80-2.00 |

---

## 优化清单

```
使用前：
□ 选择了合适的模型（不是默认 Opus）
□ .claudeignore 排除了无关文件
□ CLAUDE.md 简洁（< 200 行）

使用中：
□ 用 --print 处理单次任务
□ 精确指定要读取的文件
□ 用 /compact 保持 context 清洁
□ 定期 /cost 检查消耗

任务完成后：
□ 重要指令已写入 CLAUDE.md 而非依赖对话历史
□ 工作已 commit，可以关闭 session
```

---

**下一章：** [Memory 架构](./17-memory-architecture.md)
