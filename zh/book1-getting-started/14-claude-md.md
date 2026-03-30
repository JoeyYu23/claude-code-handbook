# 第十四章：CLAUDE.md — 你的 AI 说明书

## 问题：Claude Code 还不了解你

每次你启动一个新的 Claude Code 对话，Claude 都是全新的开始。它不知道你更喜欢 TypeScript 而不是 JavaScript，不知道你用 Prettier 做格式化、用 Vitest 跑测试，不知道你项目的 API 处理函数在 `src/api/handlers/` 目录，也不知道你从不直接提交到 main 分支。

在一个短暂的对话中，这没什么问题——你边工作边给 Claude 提供上下文。但在一个长期项目中，每次对话都重复同样的上下文很繁琐。而在团队中，确保每个开发者都得到一致的 Claude 行为，需要更系统化的方案。

这个方案就是 `CLAUDE.md`。

---

## 什么是 CLAUDE.md

`CLAUDE.md` 是一个用 Markdown 编写的纯文本文件，你把它放在项目里。Claude Code 在每次对话开始时自动读取它。

把它想象成员工入职文件——除了这个"员工"是 Claude，它每次都能完美地阅读这份文件，永远不会忘记任何东西。

你也可以自动生成一个初始的 CLAUDE.md。在 Claude Code 对话中运行：

```
/init
```

Claude 会分析你的项目并创建一个 `CLAUDE.md`，其中包含它发现的构建命令、测试说明和代码约定。然后你可以在此基础上补充 Claude 无法自行发现的内容：业务上下文、团队偏好、架构决策。

无论你在 CLAUDE.md 中写什么，Claude 都将其视为当前对话的背景知识。写好指令，Claude 就会一致地遵循它们。写模糊的指令，结果就会参差不齐。

---

## 层级体系：托管策略、全局、项目、目录

CLAUDE.md 文件可以存在于四个不同位置，每个位置的作用范围不同。优先级从高到低排列如下。

### 托管策略（Managed Policy） — 由 IT/DevOps 管理员部署

位置：
- macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
- Linux: `/etc/claude-code/CLAUDE.md`

这是优先级最高的层级，由组织的 IT 或 DevOps 管理员部署。适合放：

- 全组织范围的安全策略和合规要求
- 强制执行的编码规范
- 不允许被个人或项目级配置覆盖的规则

普通用户通常不需要手动管理这个文件——它由管理员统一维护和分发。

### 全局 CLAUDE.md — 适用于你所有的项目

位置：`~/.claude/CLAUDE.md`

这是你的个人指令集，适用于所有项目。适合放：

- 你的编码风格偏好（Tab 还是空格，引号风格）
- 你常用任务的首选库
- 你想让 Claude 了解的个人工作流快捷方式
- 你希望解释以何种结构组织

示例：
```markdown
## Personal Preferences

- I prefer tabs for indentation, 2 spaces wide
- Always use TypeScript, never plain JavaScript
- I use pnpm as my package manager, not npm or yarn
- When writing tests, use Vitest and the describe/it pattern
- Explain things at an intermediate level — I know the basics
  but do not assume deep expertise
```

### 项目 CLAUDE.md — 适用于单个项目

位置：`./CLAUDE.md` 或 `./.claude/CLAUDE.md`（在你的项目文件夹中）

这是日常工作中最重要的一个。它存在于你的项目仓库中，通常提交到版本控制系统，这样整个团队都能共享。

适合放：
- 构建和测试命令
- 项目架构概述
- 本项目的编码规范
- 重要的文件位置
- 本项目绝对不能做的事

这个文件通过 Git 与整个团队共享，所以要专注于项目级的规范，而不是个人偏好。

### 目录级 CLAUDE.md — 适用于某个子目录

你也可以在子目录中放置 CLAUDE.md 文件。当 Claude 读取那些目录中的文件时，会加载它们。

在大型项目中，代码库的不同部分有不同的约定时，这很有用——例如前端可能有与后端不同的规则。

---

## 编写你的第一个 CLAUDE.md

在项目根目录创建一个名为 `CLAUDE.md` 的文件。以下是一个实用的起始模板：

```markdown
# My Portfolio Site

## Build & Run

- `npm install` — install dependencies
- `npm run dev` — start dev server on port 3000
- `npm run build` — production build
- `npm test` — run tests (must pass before committing)

## Tech Stack

React 18 + TypeScript + Vite. Styling with Tailwind CSS (no CSS modules, no styled-components). State management with Zustand — no Redux. Deployment on Vercel, auto-deploys from main branch.

## Project-Specific Rules

- Image assets go in `public/images/` and must be WebP format, max 200KB each
- The site has exactly 4 pages: Home, Work, About, Contact — do not add new pages without asking
- Color palette is defined in `tailwind.config.ts` under `theme.extend.colors` — use those tokens, never hardcode hex values
- Contact form submits to Formspree (endpoint in `.env`), do not build a backend
- All text content lives in `src/content/data.ts` — the client updates this file directly, so keep the format simple

## Architecture Decisions

- No SSR — this is a fully static SPA, pre-rendered at build time via `vite-plugin-ssr`
- No authentication — the site is public, no login needed
- No database — all content is in `data.ts`
- We chose Zustand over React Context because the theme toggle and language state need to persist across page navigations without prop drilling

## What Claude Should Know

This is a portfolio for a graphic designer. Visual polish matters more than feature count. The client is not technical — any content they need to update must be editable in `data.ts` without touching React components. Performance budget: Lighthouse score must stay above 95.
```

核心原则：**写 Claude 无法从代码中推断出来的信息。** 构建命令和文件结构是可以自动发现的——但"图片必须是 200KB 以下的 WebP 格式"和"客户会直接编辑 data.ts"这些决策只有你自己知道。

---

## 编写有效的指令

你编写指令的方式会显著影响 Claude 的遵循程度。以下是效果最好的模式：

### 具体而明确

不够具体："Format code properly."
够具体："Use 2-space indentation. Single quotes for strings. Trailing commas in multi-line arrays and objects."

不够具体："Keep things organized."
够具体："API handlers live in `src/api/handlers/`. Database models live in `src/models/`. Utility functions live in `src/utils/`."

### 使用可验证的指令

描述可以检查的具体事项的指令比抽象指令效果更好：

好："Every API endpoint must include a try/catch block"
难以验证："Write robust code"

### 保持文件简洁

目标控制在 200 行以内。Claude 在每次对话开始时都会读取整个 CLAUDE.md。文件过长会：
1. 消耗更多上下文（上下文窗口有限制）
2. 稀释信号——重要规则会淹没在噪音中
3. 让 Claude 更难始终如一地遵循

如果你有很多需要记录的内容，使用对其他文件的引用：

```markdown
## Architecture

See @docs/architecture.md for the full architecture overview.

## API Guidelines

See @docs/api-guidelines.md for API design standards.
```

`@` 语法告诉 Claude 也要读取那些文件。

### 避免矛盾

如果两条规则对同一情况说了不同的事，Claude 可能会随机选择一条。定期检查你的 CLAUDE.md 是否有冲突。

---

## 来自真实项目的常见模式

### 模式：团队工作流规则

```markdown
## Git Workflow

- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Commit messages follow Conventional Commits format
- PRs require at least one review before merging
- Never force-push to main or develop branches
- Squash commits when merging feature branches
```

### 模式：代码风格规则

```markdown
## Code Style

- TypeScript strict mode is enabled — no `any` types
- Use explicit return types on all functions
- Prefer named exports over default exports
- Keep files under 400 lines; split large files into modules
- No console.log in production code; use the logger utility
```

### 模式：提供更好建议所需的项目上下文

```markdown
## Project Context

This is a B2B SaaS application for construction project management.
Users are primarily project managers and site supervisors, not
technical users. Design decisions should prioritize clarity over
cleverness. The main user action is reviewing and approving material
orders.

## Performance Constraints

- This app is used on construction sites with slow mobile connections
- Keep bundle size small; avoid large dependencies
- Prefer lazy loading for non-critical features
```

### 模式：做/不做列表

```markdown
## Do

- Use the existing `Button` component for all buttons
- Check the `src/utils/validators.js` file before writing new validation
- Add JSDoc comments to all exported functions

## Don't

- Don't install new dependencies without team discussion
- Don't modify files in `src/generated/` — they are auto-generated
- Don't use the old `fetch` wrapper in `src/legacy/` — use `src/api/client.js`
```

---

## 查看已加载的指令

要查看当前对话中哪些 CLAUDE.md 文件已加载并生效，在对话中运行：

```
/memory
```

这会显示 Claude 从三个层级加载的每一个指令文件。如果某条指令没有被遵循，首先检查这里——文件可能不在正确的位置。

---

## CLAUDE.md 与直接在聊天中告诉 Claude

你可能会想：为什么不在每次对话开头告诉 Claude 我需要什么？

对于一次性任务，这完全没问题。但 CLAUDE.md 有几个优势：

1. **一致性。** 每次对话、每个团队成员、每个代理子进程——它们都自动获得相同的指令。

2. **受版本控制。** 当你更新规范时，这个更新在 Git 中有提交信息说明为什么做了改变。

3. **不占用你的注意力。** 你不需要花心理精力想"我记得告诉 Claude 我的偏好了吗？"——这些指令永远都在那里。

4. **在上下文压缩中留存。** 如果你运行 `/compact` 压缩一个很长的对话，你的 CLAUDE.md 指令会保留下来。在聊天中一次性给出的指令不会。

---

**下一章：** [第十五章 — 记忆系统](./15-memory.md) — Claude 如何自动随时间积累对你项目的了解。
