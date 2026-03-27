# 第十九章：CLAUDE.md 最佳实践

## 什么样的 CLAUDE.md 才算有效

在前面的章节中，我们已经介绍了 CLAUDE.md 的基本机制。本章聚焦于实践中真正有效的内容——那些能让 Claude 在不同项目类型中保持稳定、高质量行为的模式。

核心原则：CLAUDE.md 会在每次会话开始时加载，并且每次都会消耗 token。这意味着内容越多并不代表越好。一个长达 500 行的 CLAUDE.md 会导致 Claude 忽略其中一半，因为没有模型能对大段指令块保持同等的注意力。最有效的 CLAUDE.md 都极为精炼——它们只包含那些一旦缺失就会导致 Claude 在该项目中犯下具体错误的内容。

---

## 该包含什么，该排除什么

**应该包含：**

- Claude 无法从项目结构中推断出的 Bash 命令（例如用 `pnpm` 而非 `npm`、非标准的测试命令模式）
- 偏离主流默认值的代码风格规范
- 约束代码位置的架构决策
- 不那么显眼的环境依赖
- 仓库专属的工作流（分支命名、提交格式、PR 规范）
- 通过实践发现的常见坑点或非直觉行为

**应该排除：**

- Claude 本就熟知的标准惯例（REST 规范、常见命名模式）
- Claude 通过阅读代码就能发现的内容
- 知名公共库的详细 API 文档
- 频繁变动的内容
- 长篇说明或教程（改用链接指向文档）
- 不言而喻的建议（如"写整洁的代码"、"先思考再行动"）

**判断 CLAUDE.md 中任意一行是否值得保留的标准：** "如果删掉这行，Claude 在该项目中是否会犯一个在普通项目中不会犯的具体错误？" 如果答案是否，这行就不应该存在。

---

## 按项目类型提供的模板

### Web 应用模板

```markdown
# [项目名称]

## 快速参考
- 开发服务器：`pnpm dev`（端口 5173）
- 测试：`pnpm test`（Vitest）
- 构建：`pnpm build`
- Lint：`pnpm lint` — 编辑文件后运行
- 类型检查：`pnpm typecheck`

## 架构
- API 路由：src/server/routes/（每个资源一个文件）
- 业务逻辑：src/server/services/（路由应保持轻薄）
- 数据库查询：src/server/db/queries/（此目录外不允许写 SQL）
- React 组件：src/client/components/（按功能组织，而非按类型）
- 共享类型：src/shared/types/

## 代码规范
- 只用命名导出（禁止默认导出）
- 所有 API 边界的运行时验证使用 Zod
- 错误处理：领域错误放在 src/errors/，在路由层统一捕获
- 数据库：使用 Drizzle ORM — 除非必要，不要写裸 SQL

## 环境
- 运行前将 .env.example 复制为 .env
- Postgres 必须运行：`docker compose up db -d`
- Session 需要 Redis：`docker compose up redis -d`
```

### REST API / Node.js 后端模板

```markdown
# [服务名称]

## 命令
- 启动：`npm start`
- 开发：`npm run dev`（nodemon）
- 测试：`npm test` — 运行全部
- 单个测试：`npm test -- --grep "测试名称"`
- 数据库迁移：`npm run migrate`

## 服务架构
本服务负责 [领域] 域。
外部依赖：[列出该服务调用的其他服务]
归属团队：[团队名称]

## API 规范
- 所有端点版本化：/api/v2/
- 通过 Authorization 头中的 Bearer token 鉴权
- 错误格式：{ error: string, code: string, details?: object }
- 分页格式：{ data: [], meta: { total, page, limit } }

## 数据库
- 使用 pg 驱动访问 PostgreSQL（不用 ORM）
- 查询放在 src/db/queries/ — 每个实体一个文件
- 迁移放在 db/migrations/ — 禁止修改已有迁移

## 关键规则
- 禁止在 INFO 级别及以上记录 PII（邮箱、姓名、IP）
- 所有公开端点必须限流 — 参见 src/middleware/rateLimiter.ts
- 所有 POST/PUT/PATCH 处理器必须进行输入校验
```

### Python 库模板

```markdown
# [库名称]

## 开发
- 初始化：`uv sync`（使用 uv，而非 pip）
- 测试：`pytest`
- 类型检查：`mypy src/`
- Lint：`ruff check src/ tests/`
- 格式化：`ruff format src/ tests/`

## 包结构
- 公共 API：从 src/[package]/__init__.py 导出
- 内部模块禁止在 __init__.py 中暴露
- 类型桩：src/[package]/py.typed 标记文件必须存在

## 规范
- 所有公共函数和方法必须有类型注解
- 公共 API 的文档字符串使用 NumPy 格式
- 除非不可避免，否则不引入外部依赖（这是一个库）
- 异常层次结构定义在 src/[package]/exceptions.py

## 测试
- 单元测试：tests/unit/（无 I/O，外部依赖全部 mock）
- 集成测试：tests/integration/（用 @pytest.mark.integration 标记）
- 运行集成测试：`pytest -m integration`
```

### Monorepo 模板

```markdown
# [Monorepo 名称]

## Workspace 命令
- 安装全部：`pnpm install`（从根目录执行）
- 全量构建：`pnpm -r build`
- 全量测试：`pnpm -r test`
- 单包测试：`pnpm --filter @company/[package] test`

## 包结构
- packages/api — REST API 服务
- packages/web — Next.js 前端
- packages/shared — 共享类型和工具函数
- packages/ui — 组件库

## 跨包规则
- 共享类型必须放在 packages/shared（禁止在包之间复制类型）
- 包之间不允许循环依赖
- 对 packages/shared 的破坏性变更需要版本号升级

## 各包说明
每个包都有自己的 CLAUDE.md，包含该包的具体细节。
在某个包内工作时，该包的说明优先于根目录说明。
```

---

## 自动触发器与强制执行规则

在 CLAUDE.md 中设置自动触发器，可以将特定行为变成可靠的习惯：

```markdown
## 自动触发器

每次编辑文件后：
- 运行 `npm run lint` 并修复所有新错误

每次提交前：
- 运行 `npm test` 并确认测试通过
- 运行 `npm run typecheck` 并修复所有错误
- 检查没有 .env 文件或 secret 被暂存

每次创建新 API 端点时：
- 将其添加到 docs/api.md 中的 API 文档
- 添加至少一个正常路径测试
- 添加输入验证
```

对于真正不可协商的规则，除了（或额外于）CLAUDE.md 指令，还应该用 hooks 来强制执行。Hooks 是确定性的；CLAUDE.md 指令是建议性的。

```json
// .claude/settings.json — 用 hooks 强制执行关键规则
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --silent",
            "description": "Auto-lint after file edits"
          }
        ]
      }
    ]
  }
}
```

---

## 环境特定配置

团队成员有各自不同的本地环境。用个人覆盖文件模式来处理这个问题：

```markdown
# 在团队共享的 CLAUDE.md 中：
个人工具偏好设置，请参见 @~/.claude/my-overrides.md（如存在）。
```

每位开发者自行创建 `~/.claude/my-overrides.md`，记录个人设置（首选测试运行器参数、编辑器偏好等），该文件不提交到仓库。

对于真正需要按环境区分的设置，可在 CLAUDE.md 中使用条件逻辑：

```markdown
## 环境说明
如果在 Apple Silicon Mac 上运行，homebrew 命令请使用 `arch -arm64 brew`。
如果在 Docker 容器内运行，数据库地址是 `db` 而非 `localhost`。
如果环境变量中有 GITHUB_ACTIONS，跳过所有交互式确认。
```

---

## 团队统一标准

在团队内共享 CLAUDE.md 时，该文件实际上成为团队标准的"活文档"。请将其如此对待：

**纳入版本控制。** CLAUDE.md 属于你的仓库。每位团队成员拉取代码时都会获得最新版本。

**像审查代码一样审查它。** CLAUDE.md 的变更应走正常的代码审查流程。一条写得不好的指令可能导致整个团队出现错误行为。

**主动演进它。** 随着团队发现新的规律——需要强化的正确行为、需要防止的常见错误——就将其添加到 CLAUDE.md 中。这个文件的价值会随时间积累。

**记录变更历史。** 添加一个简短的 changelog 章节，或者依靠 git history。当某些功能停止正常工作时，你需要知道相关指令是何时添加或修改的。

---

## 应避免的反模式

**过度详细的 CLAUDE.md。** 每增加一条指令，Claude 对其他所有指令的关注度就会降低一点。目标是控制在 200 行以内。如果你发现自己在添加第 50 条规则，回头检查一下现有规则是否还值得保留。

**相互冲突的指令。** 如果 CLAUDE.md 说"用单引号"，而某个子目录的 CLAUDE.md 说"用双引号"，Claude 可能会随机选择其一。定期审查冲突。`/memory` 命令会列出所有已加载的 CLAUDE.md 文件。

**Claude 本就会正确执行的指令。** Claude 原本就会遵循的指令是在浪费 token。如果删掉某条指令后 Claude 的行为没有变化，那这条指令就不应该存在。

**小说式写法。** 用长篇叙述段落代替简洁规则。对于操作性指令，Claude 遵循要点列表的可靠性远高于叙述性段落。仅在叙述确实有助于理解时才使用散文。

**过时的指令。** 随着项目演进，CLAUDE.md 中的某些指令会变得过时甚至错误。一条不再有效的迁移命令比没有命令更糟——它会让 Claude 以令人困惑的方式失败。每季度审查一次你的 CLAUDE.md。

**将临时上下文塞入 CLAUDE.md。** CLAUDE.md 是用于持久标准的。当前任务的上下文应放在对话中、WORK_IN_PROGRESS.md 或任务文件中——而不是 CLAUDE.md。

---

## 评估你的 CLAUDE.md

检验 CLAUDE.md 最好的方式，是观察应用它之后 Claude 的行为是否发生变化。做出修改后：

1. 开启一个全新会话
2. 给 Claude 一个能触发相关规则的任务
3. 观察规则是否被遵循
4. 找出哪些规则被忽略了（通常原因是：规则太模糊或被埋得太深）

一个经过良好调校的 CLAUDE.md，与不使用它相比，会产生明显不同——且更好——的行为。如果你感受不到差异，说明这个文件没有发挥应有的作用。

---

**下一章：** [第六章 — 团队工作流](./06-team-workflows.md) — 工程团队的协作模式、共享配置与知识管理。
