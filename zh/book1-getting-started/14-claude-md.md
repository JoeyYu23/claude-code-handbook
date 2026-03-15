# 第十四章：CLAUDE.md — AI 的说明书

## 每次对话，Claude 都从零开始

Claude Code 有一个特性：**每个新对话都是全新的开始**。它不会记得你上次告诉它的偏好，不知道你的项目惯例，也不了解你的团队规范——除非你每次都重新说一遍。

这很麻烦。你不可能每次都从头解释："我们用 2 空格缩进，用 TypeScript，测试框架是 Jest，变量命名用驼峰……"

**CLAUDE.md 就是解决这个问题的工具。**

---

## 什么是 CLAUDE.md？

CLAUDE.md 是一个放在你项目里的 Markdown 文件。每次启动 Claude Code，它都会自动读取这个文件，把里面的内容作为"背景知识"加载进来。

把它理解为：**你给 AI 写的一份岗位说明书**。

就像你新入职时会收到一份公司规范手册，CLAUDE.md 告诉 Claude：
- 这个项目是做什么的
- 代码规范是什么
- 常用命令有哪些
- 有哪些特殊注意事项

有了 CLAUDE.md，你不需要每次重复说明——Claude 一开始就知道这些。

---

## 三个层级的 CLAUDE.md

CLAUDE.md 有三个放置位置，覆盖不同范围：

### 层级一：用户级（个人偏好）

**位置：** `~/.claude/CLAUDE.md`

**作用：** 对你使用的所有项目生效，只影响你自己。

**适合放什么：**
- 你个人的编码风格偏好
- 你常用的工具和快捷方式
- 你对 Claude 的通用要求（比如"总是解释修改原因"）

**示例内容：**
```markdown
# 我的个人偏好

## 编码风格
- 所有注释用中文写
- 函数要简短，超过 30 行要拆分
- 变量命名用驼峰式（camelCase）

## 沟通方式
- 每次修改代码前，先解释修改思路
- 对不确定的地方，列出 2-3 个方案让我选择
```

### 层级二：项目级（团队共享）

**位置：** `./CLAUDE.md` 或 `./.claude/CLAUDE.md`（项目根目录）

**作用：** 对这个项目的所有成员生效，通过 Git 共享给团队。

**适合放什么：**
- 项目架构说明
- 代码规范（缩进、命名等）
- 常用构建和测试命令
- 重要的技术决策

**这是最重要的一层。** 本章后面的示例主要针对项目级 CLAUDE.md。

### 层级三：目录级（局部规范）

**位置：** 项目内各子目录的 `CLAUDE.md`

**作用：** 只在 Claude 处理该目录下的文件时生效。

**适合放什么：**
- 特定模块的注意事项
- 不同技术栈的规范（比如前端目录和后端目录规范不同）

---

## 写你的第一个 CLAUDE.md

### 快速生成（推荐方式）

最简单的方式：让 Claude 帮你生成！

在项目目录启动 Claude Code，输入：

```
/init
```

Claude 会分析你的项目（代码结构、依赖、配置文件），自动生成一个 CLAUDE.md 的初稿，包括：
- 项目概述
- 构建和测试命令
- 它发现的代码规范

然后你可以在生成的基础上补充修改。

### 手动编写

如果你想从头写，以下是一个实用的模板：

```markdown
# 项目名称

## 项目概述
这是一个 [一句话描述]，使用 [主要技术栈]。

## 快速开始
```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（localhost:3000）
npm test         # 运行测试
npm run build    # 构建生产版本
```

## 代码规范
- 使用 TypeScript，禁止 any 类型
- 缩进：2 个空格
- 命名：组件用 PascalCase，变量和函数用 camelCase
- 每个文件不超过 300 行，超出要拆分模块

## 项目架构
```
src/
  components/    前端 UI 组件
  services/      业务逻辑层
  utils/         工具函数
  types/         TypeScript 类型定义
```

## 重要规则
- 不得直接修改 main 分支，所有改动通过 PR
- 新功能必须有对应的测试
- 环境变量必须在 .env.example 中有示例
- 不要提交 console.log 到生产代码
```

---

## 常见的 CLAUDE.md 内容模式

### 模式一：构建和测试命令

这是最重要的内容之一。Claude 需要知道如何运行你的项目：

```markdown
## 常用命令
- 开发：`npm run dev`
- 测试全部：`npm test`
- 测试单个文件：`npm test -- --testPathPattern=auth`
- 代码检查：`npm run lint`
- 构建：`npm run build`
- 数据库迁移：`npm run db:migrate`
```

### 模式二：技术架构决策

记录你的项目为什么这么设计，帮 Claude 做出一致的选择：

```markdown
## 架构决策
- 状态管理：使用 Zustand（不用 Redux，太复杂）
- HTTP 客户端：使用 axios（不用 fetch）
- 样式方案：Tailwind CSS（不用 CSS modules）
- 数据库：PostgreSQL + Prisma ORM
```

### 模式三：代码风格规范

```markdown
## 代码规范
### JavaScript/TypeScript
- 使用 async/await，不使用 .then() 链式调用
- 函数要有显式的返回类型注解
- 错误处理：向上抛出，不在内层静默忽略

### 命名规范
- 布尔变量：is/has/can 开头（isLoading, hasError）
- 事件处理函数：handle 开头（handleSubmit, handleClick）
- 异步函数：不需要特殊前缀，靠 async 关键字区分

### 注释规范
- 复杂业务逻辑必须有注释
- 注释解释"为什么"，不解释"是什么"（代码本身就说明了"是什么"）
```

### 模式四：需要特别注意的事项

```markdown
## 注意事项
- 用户密码相关代码必须使用 bcrypt，不得明文存储
- 所有 API 接口必须有认证中间件保护
- 文件上传大小限制：最大 5MB
- 付款相关逻辑在 src/payments/ 目录，改动前必须先沟通

## 不要做的事
- 不要直接修改 prisma/schema.prisma，改动需要评审
- 不要在前端代码中写 API Key 或 Secret
- 不要删除 types/ 目录下的类型定义文件
```

---

## 一个完整的 CLAUDE.md 示例

以下是一个个人博客项目的示例：

```markdown
# 个人博客（my-blog）

## 关于这个项目
使用 Next.js + Prisma + PostgreSQL 搭建的个人博客。
主要功能：文章发布、标签管理、评论系统。

## 技术栈
- 前端：Next.js 14（App Router）
- 样式：Tailwind CSS
- 数据库：PostgreSQL，ORM 用 Prisma
- 认证：NextAuth.js
- 部署：Vercel

## 常用命令
```bash
npm run dev          # 启动开发服务器 http://localhost:3000
npm run db:studio    # 打开 Prisma Studio 查看数据库
npm run db:migrate   # 运行数据库迁移
npm test             # 运行所有测试
npm run type-check   # TypeScript 类型检查
```

## 目录结构
```
app/                 Next.js App Router 页面
  (auth)/            认证相关页面（登录/注册）
  (blog)/            博客公开页面
  admin/             管理后台（需认证）
components/          可复用 UI 组件
lib/                 工具函数和服务层
prisma/              数据库 Schema 和迁移文件
```

## 代码规范
- TypeScript 严格模式，禁止 any
- 组件文件：PascalCase（PostCard.tsx）
- 工具函数：camelCase（formatDate.ts）
- 每个组件不超过 150 行，复杂组件拆分子组件

## 重要规则
- Prisma Schema 变更必须生成迁移文件（不要直接改数据库）
- 管理员权限检查在 middleware.ts 统一处理
- 图片上传走 /api/upload，不要引入其他上传库
- 评论功能暂未开发，不要在这个方向花时间
```

---

## 维护你的 CLAUDE.md

CLAUDE.md 不是写完就不管了的文档，它需要随项目一起成长。

**建议定期更新的情况：**
- 引入了新的依赖或工具
- 做出了重要的架构决策
- 规范发生了变化
- 踩了坑，需要提醒未来的自己（或 Claude）避开

**让 Claude 帮你更新：**

```
这个项目最近引入了 React Query 来管理服务端状态，
帮我更新 CLAUDE.md，加入相关说明。
```

```
我们刚开完技术评审，决定把测试框架从 Jest 换成 Vitest，
帮我更新 CLAUDE.md 中的测试相关内容。
```

**控制文件大小：** CLAUDE.md 建议控制在 200 行以内。太长的内容会降低 Claude 遵循规则的准确性，也会消耗更多对话上下文。

---

## 小结

- CLAUDE.md 是你给 AI 的说明书，**每次对话自动加载**
- 三个层级：用户级（个人偏好）→ 项目级（团队规范）→ 目录级（局部规则）
- 用 `/init` 让 Claude 帮你生成初稿，比手写快得多
- 内容越具体越好：`npm run test` 比 "运行测试" 有用
- 保持 200 行以内，定期随项目更新

一个好的 CLAUDE.md 能让每次对话都更高效——你不需要重复说明，Claude 直接在正确的上下文里工作。

---

**下一章：** [Memory 系统](./15-memory.md)
