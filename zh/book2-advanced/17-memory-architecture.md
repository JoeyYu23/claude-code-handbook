# 第十七章：Memory 架构

> 深入理解 Claude Code 的 Memory 系统——让 Claude 真正了解你的项目、偏好和工作方式。

---

## Memory 系统全景

Claude Code 通过两种互补机制在 session 之间保持记忆：

```
Memory 系统
├── CLAUDE.md 文件        # 你写给 Claude 的指令（主动配置）
│   ├── 项目级：./CLAUDE.md 或 ./.claude/CLAUDE.md
│   ├── 用户级：~/.claude/CLAUDE.md
│   └── 组织级（托管策略）：/Library/Application Support/ClaudeCode/CLAUDE.md（macOS）
│                         或 /etc/claude-code/CLAUDE.md（Linux）
│
├── Auto Memory           # Claude 自动积累的学习（被动积累）
│   └── ~/.claude/projects/<project>/memory/
│       ├── MEMORY.md     # 索引文件（每次 session 加载前 200 行或 25KB）
│       ├── debugging.md  # 调试相关的知识
│       ├── patterns.md   # 代码模式发现
│       └── ...           # 其他主题文件
│
└── .claude/rules/        # 按文件类型加载的规则（条件性 CLAUDE.md）
    ├── api-design.md
    ├── testing.md
    └── frontend.md
```

---

## Memory 类型详解

### 类型一：项目级 CLAUDE.md（Team Instructions）

**存放位置**：`./CLAUDE.md` 或 `./.claude/CLAUDE.md`

**特点**：
- 提交到 Git，团队共享
- 每次 session 开始时完整加载
- 用于团队需要共同遵守的规范

**适合存放**：
```markdown
# my-project/CLAUDE.md 示例

## 技术栈
- Frontend: React 18 + TypeScript + Vite
- Backend: FastAPI + PostgreSQL
- 测试: pytest + Vitest

## 开发命令
- 启动开发服务器: `make dev`
- 运行测试: `make test`
- 代码格式化: `make fmt`

## 架构规范
- API 路由放在 `backend/routers/`
- 数据库 models 放在 `backend/models/`
- 前端组件放在 `frontend/src/components/`

## 代码规范
- Python: 遵循 PEP 8，函数 < 30 行
- TypeScript: 使用 strict mode，禁止 any 类型
- 所有公开函数必须有 docstring/JSDoc
```

### 类型二：用户级 CLAUDE.md（Personal Preferences）

**存放位置**：`~/.claude/CLAUDE.md`

**特点**：
- 只属于你，不提交 Git
- 在所有项目中生效
- 用于个人工作习惯

**适合存放**：
```markdown
# ~/.claude/CLAUDE.md 示例

## 我的偏好
- 回复简洁，直接给代码
- 不要主动解释"做了什么"，除非我问
- 中文对话，代码用英文注释

## 我的工作习惯
- 每完成一个小任务就 commit
- commit message 格式：feat/fix/refactor: 简短描述
- 遇到重大决策，先列出 2-3 个方案让我选

## 常用工具偏好
- 包管理器：pnpm（不用 npm 或 yarn）
- 格式化：prettier + eslint（不用 biome）
- 测试框架：vitest（不用 jest）
```

### 类型三：Auto Memory（自动积累）

**存放位置**：`~/.claude/projects/<project>/memory/`

**特点**：
- 由 Claude 自动写入，无需你手动管理
- 按主题分散在多个文件
- `MEMORY.md` 是索引，每次 session 自动加载前 200 行或 25KB（以先到者为准）
- 其他主题文件按需读取

**MEMORY.md 示例**：

```markdown
# Project Memory Index

## 关键发现
- 构建命令：`pnpm build:prod`（不是 `pnpm build`，后者跳过优化）
- 数据库迁移：先运行 `pnpm db:generate`，再 `pnpm db:migrate`
- 测试需要本地 Redis 实例（port 6379）

## 调试记录
- auth 模块的 race condition 已在 2024-01-10 修复，见 debugging.md

## 代码规律
- API handler 的错误处理模式，见 patterns.md

## 未解决问题
- Safari 上的 FormData 兼容性问题，暂时用 polyfill 绕过
```

Auto Memory 需要 Claude Code v2.1.59 或更高版本，默认启用。

**让 Claude 写入 Auto Memory**：

```
> 记住：这个项目的测试需要先启动 mock server，命令是 `pnpm mock:server`

> 把刚才我们发现的那个 UUID 生成 bug 的根本原因记录下来
```

### 类型四：.claude/rules/ 文件（条件性规则）

**特点**：可以设置 `paths` frontmatter，只在 Claude 操作特定文件时加载

```markdown
<!-- .claude/rules/api-design.md -->
---
paths:
  - "src/api/**/*.ts"
  - "backend/routers/**/*.py"
---

# API 设计规范

## 命名规范
- REST 资源用复数名词：/users, /orders
- 动作用动词前缀：/search-users, /bulk-delete

## 响应格式
所有 API 返回统一格式：
{
  "data": ...,
  "error": null | { "code": "...", "message": "..." },
  "meta": { "requestId": "..." }
}
```

```markdown
<!-- .claude/rules/testing.md -->
---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "tests/**/*.py"
---

# 测试规范

- 每个测试必须有 Arrange-Act-Assert 结构
- Mock 外部依赖，不发真实网络请求
- 测试描述用中文，清楚说明测试了什么场景
```

---

## MEMORY.md 作为索引

`MEMORY.md` 的设计哲学是**轻量索引 + 按需加载**：

```
每次 session 启动：
├── 加载 MEMORY.md 前 200 行或 25KB（自动，以先到者为准）
└── 其他主题文件只在需要时读取

好处：
- 关键信息立即可用（不需要查询）
- 详细内容不占用 context（按需加载）
- Claude 自主决定什么时候去查看详细文件
```

### 维护 MEMORY.md 的技巧

定期让 Claude 整理和优化：

```
> 查看一下 memory 目录，删除过时的内容
  保持 MEMORY.md 简洁，确保最重要的 10 条记录在前 50 行
```

---

## 什么时候存，什么时候不存

### 值得存入 Memory 的信息

```
✓ 非显而易见的构建/测试命令
✓ 项目特有的代码规范（与行业惯例不同的）
✓ 已解决的重要 bug 的根本原因
✓ 架构决策及其原因（ADR）
✓ 你的个人偏好（哪些写法你喜欢/不喜欢）
✓ 环境配置的特殊要求
```

### 不值得存入 Memory 的信息

```
✗ 可以从代码中直接读取的信息（如函数签名）
✗ 会频繁变更的临时状态（如当前 sprint 的任务）
✗ 通用的编程知识（Claude 本身就知道）
✗ 太宽泛的指令（如"写好代码"）
✗ 每次 session 都要重新判断的决策
```

---

## Memory vs CLAUDE.md vs Tasks

这三种机制的对比和各自的定位：

| 机制 | 谁来写 | 生命周期 | 适合存放 |
|------|-------|---------|---------|
| CLAUDE.md | 你（主动） | 永久，提交 Git | 团队规范、项目架构、工作流程 |
| Auto Memory | Claude（自动） | 永久，本机私有 | 构建技巧、调试发现、个人偏好 |
| Tasks（CLAUDE.md 中的 TODO） | 你 | 手动更新 | 当前工作状态、未完成任务 |
| Session 对话 | 双方 | 一个 session | 当前问题的上下文 |

---

## 高级模式：跨项目 Memory

### 方案一：共享 rules 目录（用 symlink）

```bash
# 创建共享规则库
mkdir -p ~/my-claude-rules

# 在不同项目中 symlink
cd ~/projects/project-a
ln -s ~/my-claude-rules .claude/rules/shared

cd ~/projects/project-b
ln -s ~/my-claude-rules .claude/rules/shared
```

### 方案二：用户级 ~/.claude/CLAUDE.md

```markdown
# ~/.claude/CLAUDE.md — 所有项目通用规范

## 跨项目代码规范
[你的通用编码偏好]

## 跨项目工作习惯
[你的个人工作流程]
```

### 方案三：在项目 CLAUDE.md 中引用共享文件

```markdown
# ./CLAUDE.md

# 引用用户级的共享规范（不提交到 Git 的部分）
@~/.claude/company-standards.md

# 项目特有规范
[项目特有内容]
```

---

## 使用 /memory 命令管理

```
/memory

输出：
Loaded CLAUDE.md files:
  ✓ /Users/alice/.claude/CLAUDE.md (user)
  ✓ /Users/alice/projects/my-app/CLAUDE.md (project)
  ✓ /Users/alice/projects/my-app/.claude/rules/api-design.md (rule, active)

Auto Memory:
  ✓ ~/.claude/projects/my-app/memory/MEMORY.md
  [Toggle auto memory: ON]

Select a file to open in editor...
```

---

**下一章：** [多 Session 工作流](./18-multi-session.md)
