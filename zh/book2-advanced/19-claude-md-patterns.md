# 第十九章：CLAUDE.md 最佳实践

> 久经考验的 CLAUDE.md 模板和配置模式——让 Claude Code 在你的项目里表现得像一位了解项目内情的资深工程师。

---

## CLAUDE.md 写作原则

在看模板之前，先理解让 CLAUDE.md 有效的核心原则：

**1. 具体胜过抽象**

```
✗ 抽象：写干净的代码
✓ 具体：函数不超过 40 行，嵌套不超过 3 层，复杂逻辑加注释
```

**2. 可验证胜过主观**

```
✗ 主观：代码要优雅
✓ 可验证：运行 `npm run lint` 必须零警告才能提交
```

**3. 简洁胜过完整**

```
✗ 冗长：把所有可能的情况都列出来
✓ 简洁：列出最重要的 10 条，其余用"参考 X 文件"
```

**4. 保持在 200 行以内**（超过的内容用 `@import` 或 `.claude/rules/` 分离）

---

## 模板一：Web 应用（全栈）

```markdown
# CLAUDE.md — my-saas-app

## 技术栈
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, Python 3.11, SQLAlchemy 2.0, Alembic
- Database: PostgreSQL 15
- Cache: Redis 7
- Testing: pytest (backend), Vitest + Testing Library (frontend)

## 开发命令
```bash
make dev        # 启动全栈开发环境（docker-compose）
make test       # 运行所有测试
make lint       # 运行 ruff + eslint
make migrate    # 应用数据库迁移
make seed       # 填充测试数据
```

## 目录结构
```
backend/
  app/
    api/        # FastAPI routers（每个资源一个文件）
    models/     # SQLAlchemy models
    services/   # 业务逻辑（不放在 router 里）
    schemas/    # Pydantic schemas（request/response）
frontend/
  src/
    components/ # 纯展示组件（无业务逻辑）
    pages/      # 页面组件（含数据获取）
    hooks/      # 自定义 hooks
    api/        # API 调用函数
```

## 代码规范

### Backend
- Service 层处理业务逻辑，Router 只做 HTTP 处理
- 所有数据库操作通过 service，不在 router 直接写 ORM 查询
- 错误统一用 `app/core/exceptions.py` 中的自定义异常
- API 响应统一格式：`{"data": ..., "error": null}`

### Frontend
- 组件文件名：PascalCase（UserCard.tsx）
- Hook 文件名：camelCase，以 use 开头（useUserData.ts）
- API 调用统一通过 `src/api/` 下的函数，不在组件里直接用 fetch

## 自动触发
- 修改 API schema 后：提醒更新 frontend 的对应 TypeScript 类型
- 新建 API endpoint 后：提醒写对应的 pytest 测试
- 修改 SQLAlchemy model 后：提醒生成 Alembic migration
```

---

## 模板二：Node.js API 服务

```markdown
# CLAUDE.md — my-api-service

## 技术栈
- Runtime: Node.js 20 LTS
- Framework: Express 4 + TypeScript
- ORM: Prisma
- 验证: Zod
- 测试: Jest + Supertest
- 文档: OpenAPI (zod-to-openapi)

## 开发命令
```bash
pnpm dev          # 启动开发服务器（nodemon + ts-node）
pnpm test         # 运行测试（需要 test DB）
pnpm test:watch   # 监听模式
pnpm db:push      # 应用 schema 变更（开发用）
pnpm db:migrate   # 生成并应用 migration（生产用）
pnpm build        # TypeScript 编译到 dist/
```

## 项目结构
```
src/
  routes/       # Express 路由（薄层，只做路由分发）
  controllers/  # 请求处理（解析参数、调用 service）
  services/     # 业务逻辑（核心）
  repositories/ # 数据库操作（封装 Prisma）
  middleware/   # Express 中间件
  schemas/      # Zod schemas（复用于验证和 OpenAPI）
  types/        # TypeScript 类型定义
```

## API 设计规范
- REST：使用复数名词，标准 HTTP 方法
- 分页：`?page=1&limit=20`，响应包含 `meta.total`
- 错误码：`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`
- 所有 endpoint 必须有对应的 Zod schema 和 OpenAPI 文档

## 安全规则
- 所有用户输入必须经过 Zod 验证
- 数据库查询使用 Prisma（防 SQL 注入）
- 敏感字段（password, token）不出现在 API 响应中
- rate limiting 已在 `middleware/rateLimit.ts` 配置
```

---

## 模板三：开源库

```markdown
# CLAUDE.md — my-library

## 项目定位
这是一个 TypeScript 工具库，提供 [功能描述]。
面向开发者，API 设计优先考虑 DX（开发者体验）。

## 开发命令
```bash
pnpm build       # 构建 ESM + CJS 双格式
pnpm test        # 运行测试
pnpm test:types  # 类型测试（tsd）
pnpm docs        # 生成 API 文档
pnpm release     # 版本发布（changeset）
```

## API 设计原则
- 函数式 API 优先（tree-shakeable）
- 零依赖（不引入第三方包）
- 完整的 TypeScript 类型（不依赖 @types/xxx）
- 所有公开 API 必须有 JSDoc + 示例

## 兼容性要求
- Node.js >= 18
- 现代浏览器（ES2020+）
- 同时导出 ESM 和 CJS 格式

## 变更管理
- 使用 changesets 管理版本
- Breaking change 必须在 CHANGELOG.md 详细说明迁移步骤
- 新增 API 默认为 @experimental，稳定后去掉标记

## 测试要求
- 每个公开函数至少一个 happy path 测试 + 一个 edge case 测试
- 类型测试：新增类型必须有 .test-d.ts 文件
```

---

## 模板四：Monorepo

```markdown
# CLAUDE.md — my-monorepo

## 结构概览
```
packages/
  core/          # 核心逻辑（无框架依赖）
  react/         # React 组件库
  cli/           # 命令行工具
  docs/          # 文档网站（Astro）
apps/
  web/           # 主 Web 应用（Next.js）
  admin/         # 管理后台（Vite + React）
```

## 开发命令
```bash
pnpm dev              # 启动所有 apps
pnpm dev --filter web # 只启动 web app
pnpm test             # 所有 packages 测试
pnpm build            # 所有 packages 构建
pnpm changeset        # 添加版本变更记录
```

## 跨包规范
- 包间依赖：apps 可以依赖 packages，packages 之间尽量避免横向依赖
- 共享类型：放在 packages/core/src/types.ts
- 共享工具函数：放在 packages/core/src/utils.ts
- 每个 package 有独立的 CLAUDE.md（放在包目录下）

## 注意事项
- 修改 packages/core 后，需要重新 build，apps 才能看到变化
- 发布前运行 `pnpm changeset version` 更新版本号
```

---

## 自动触发和执行规则

自动触发让 Claude 在完成某些操作后主动执行后续步骤，无需你每次提醒。

### 实用自动触发示例

```markdown
## 自动触发规则

### 代码变更触发
- 每次修改 `src/api/` 下的文件后，提醒检查是否需要更新 OpenAPI 文档
- 修改数据库 schema 后，自动生成对应的 migration 文件
- 添加新的公开函数后，提醒添加 JSDoc 和测试

### 提交触发
- 提交前：运行 `pnpm lint && pnpm test`，只有通过才继续
- 提交 message 格式：`feat|fix|refactor|docs|test|chore: 简短描述（英文）`

### 安全触发
- 如果代码中出现 `process.env.XXX` 且不在 .env 文件中，立即提醒
- 如果看到 SQL 字符串拼接，立即警告 SQL 注入风险
```

---

## 团队级标准配置

对于多人团队，通过以下方式统一标准：

### 分层结构

```
组织级（/Library/Application Support/ClaudeCode/CLAUDE.md）
  └── 公司通用安全规范、合规要求

项目级（./CLAUDE.md）
  └── 项目架构、技术决策、团队规范

用户级（~/.claude/CLAUDE.md）
  └── 个人偏好（不影响团队）
```

### 组织级 CLAUDE.md 示例（由 IT 管理员部署）

```markdown
# 公司统一 AI 编码规范

## 必须遵守的安全规则
- 禁止在代码中 hardcode API keys 或密码
- 所有外部输入必须验证和 sanitize
- 使用公司批准的加密库（见内网 wiki：security/approved-libs）

## 禁止操作
- 不得将生产数据库查询结果包含在对话中
- 不得处理包含真实用户 PII 的代码（用脱敏数据）

## 代码审查要求
- 所有 PR 必须包含测试
- 安全相关改动需要 Security 团队审查
```

---

## 要避免的反模式

```
✗ 太宽泛的指令
  "写好代码" → 改成 "函数 < 40 行，变量命名有意义"

✗ 与 Git 状态相关的指令（会过期）
  "当前正在修复 bug #123" → 这类放在 session 对话里，不放 CLAUDE.md

✗ 矛盾的规则
  "总是用 TypeScript" + "有时候 JavaScript 更合适"
  → 明确什么情况下用哪个

✗ 过于细节的指令（Claude 本来就懂的）
  "写 if 语句时用花括号" → 这是语法常识

✗ 超长的 CLAUDE.md（> 300 行）
  → 用 .claude/rules/ 拆分，或用 @import 引用
```

---

**下一章：** [团队协作](./20-team-workflows.md)
