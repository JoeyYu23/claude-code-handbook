# 第十五章：Memory 系统

## Claude 记得什么，不记得什么？

先说一个可能让你意外的事实：**在同一个对话里，Claude 记得你说过的一切。在不同对话之间，Claude 什么都不记得——除非有机制帮它保存。**

这是 AI 模型的基本工作方式。每次新对话都是一张白纸。

这就引出了一个问题：如果你告诉 Claude "我们项目用 pnpm，不用 npm"，下次启动 Claude Code 还管用吗？

答案是：**如果你不做任何设置，不管用。但 Claude Code 提供了两种机制来解决这个问题。**

---

## 两种记忆机制

### 机制一：CLAUDE.md（你写给 Claude 看的）

这是上一章的内容。CLAUDE.md 是你手写的说明文件，Claude 每次启动时都会读取。

特点：
- 你写，你控制
- 适合放规则、规范、不变的信息
- 需要主动维护

### 机制二：Auto Memory（Claude 自己记录的）

这是本章重点介绍的新功能。Auto Memory（自动记忆）让 Claude 在工作过程中**自己记笔记**——当它学到有用的信息，会主动保存下来，供以后使用。

特点：
- Claude 自动写，不需要你操心
- 适合放它在工作中发现的信息
- 比如构建命令、调试技巧、你的工作偏好

---

## Auto Memory 是怎么工作的？

### 存在哪里？

Auto Memory 存储在本地文件系统里：

```
~/.claude/projects/<项目路径>/memory/
    MEMORY.md         ← 主索引文件，每次对话加载
    debugging.md      ← 调试相关笔记（示例）
    build-tips.md     ← 构建提示（示例）
    ...               ← Claude 按需创建的主题文件
```

每个项目都有自己独立的 memory 目录。

### 什么时候 Claude 会保存记忆？

Claude 不会在每次对话都保存记忆——它会判断哪些信息"下次会有用"。

常见的触发场景：
- **你纠正了它的一个错误**："不对，我们不用 yarn，用 pnpm"
- **你表达了偏好**："我更喜欢 async/await 而不是 Promise 链"
- **它发现了重要的项目信息**：构建命令、测试命令、特殊的目录结构
- **解决了一个复杂 bug**：记录 bug 原因和解决方案，防止同类问题再次发生

### 你怎么知道它保存了？

在 Claude Code 界面里，当 Claude 写入记忆时，你会看到类似 "Writing memory" 的提示。

---

## 让 Claude 记住特定信息

除了 Claude 自动判断要保存什么，你也可以主动要求：

### 方式一：直接说

```
记住：这个项目用 pnpm 而不是 npm
```

```
记住：数据库连接配置在 config/database.ts，不在 .env
```

```
记住我的偏好：所有函数都要有 JSDoc 注释
```

Claude 会把这些信息写入 memory 文件，下次对话就能自动知道。

### 方式二：纠正时说"记住"

```
不对，我们的测试命令是 pnpm test --watch，不是 npm test。
以后记住这个。
```

### 方式三：明确要求保存到 CLAUDE.md

如果你想把某个规则写进 CLAUDE.md（而不是 memory），可以说：

```
帮我把这条规则加到 CLAUDE.md 里：
所有 API 接口必须返回统一的 {code, message, data} 格式
```

---

## 查看和管理你的记忆文件

在 Claude Code 对话里，输入：

```
/memory
```

这会打开记忆管理界面，你可以：
- 看到当前加载的所有 CLAUDE.md 文件列表
- 切换 Auto Memory 开关
- 看到 auto memory 的存储位置
- 直接打开记忆文件进行编辑

### 直接编辑记忆文件

Memory 文件是普通的 Markdown 文件，你可以随时用文本编辑器打开、修改或删除。

```bash
# 找到你的 memory 文件
# 路径类似：~/.claude/projects/Users-xiaoming-my-project/memory/MEMORY.md
open ~/.claude/projects/
```

文件里的内容是可读的文字，不是什么神秘格式：

```markdown
# Project Memory

## Build Commands
- Install: pnpm install
- Dev server: pnpm dev (runs on port 3001)
- Tests: pnpm test --watch

## Preferences
- Use async/await instead of Promise chains
- All functions need JSDoc comments
- Prefer early returns over nested conditions

## Known Issues
- Hot reload sometimes breaks after modifying next.config.js
  → Fix: restart dev server with pnpm dev
```

---

## CLAUDE.md vs Memory：该用哪个？

这两个机制有所重叠，但各有侧重：

| 情况 | 推荐 |
|------|------|
| 团队共享的代码规范 | CLAUDE.md（提交到 Git） |
| 项目的构建/测试命令 | CLAUDE.md 或 Memory（都可以） |
| 你个人的编码偏好 | ~/.claude/CLAUDE.md 或 Memory |
| Claude 自己发现的技巧 | Auto Memory（它自己来） |
| 某次调试的关键发现 | 让 Claude 写进 Memory |
| 不变的架构决策 | CLAUDE.md |
| 动态的、随时更新的信息 | Memory |

**一个简单的判断标准：**
- 这个信息需要和团队共享吗？→ CLAUDE.md（提交 Git）
- 这个信息是你一个人用的吗？→ User CLAUDE.md 或 Memory
- 这个信息是 Claude 在工作中发现的？→ Auto Memory

---

## Memory 系统的实际价值

当你的项目很复杂，或者你长期使用 Claude Code 时，Memory 系统会越来越有价值。

**随着时间积累，Claude 会了解：**
- 你项目的每个模块是干什么的
- 你踩过哪些坑、如何解决的
- 你的个人习惯和偏好
- 项目特有的术语和概念

**示例：一个月后的 memory 文件可能长这样：**

```markdown
# Project Memory — my-blog

## Development Setup
- Dev: pnpm dev (port 3001, not default 3000)
- DB: must run `pnpm db:migrate` before testing
- Tests: pnpm test (uses Vitest, not Jest)

## Architecture Notes
- Posts are cached in Redis with 1h TTL
- Image uploads go to /api/upload → Cloudflare R2
- Auth handled by NextAuth, sessions stored in DB (not JWT)

## Debugging Insights
- If hot reload stops working: delete .next/ and restart
- Prisma type errors: run pnpm db:generate to sync types
- Build fails with "module not found": check tsconfig paths

## User Preferences
- Prefers async/await over promise chains
- Wants explanations before making large changes
- Uses pnpm workspace, never npm
```

有了这些积累，下次你说"帮我调试一下为什么热更新不工作了"，Claude 直接就知道：删除 `.next/` 重启就好了。

---

## 关闭 Auto Memory

如果你不需要 Auto Memory，或者在某些场合想关闭它，可以：

**在对话中关闭：**
```
/memory
```
然后在界面中切换 Auto Memory 开关。

**通过设置文件关闭：**

在 `.claude/settings.json` 里添加：
```json
{
    "autoMemoryEnabled": false
}
```

---

## 小结

- **每次对话结束，Claude 就忘记一切**——除非有机制保存
- **两种记忆机制**：CLAUDE.md（你写）和 Auto Memory（Claude 自动写）
- **Auto Memory** 保存在 `~/.claude/projects/项目名/memory/` 里，是普通 Markdown 文件
- 你可以主动要求 Claude 记住某些信息
- 用 `/memory` 命令查看和管理记忆文件
- **CLAUDE.md 适合规则和规范，Memory 适合 Claude 在工作中发现的信息**

随着使用时间增长，你和 Claude Code 的"默契"会越来越深——不是因为 Claude 真的变聪明了，而是因为记忆系统帮它积累了对你项目的了解。

---

**下一章：** [IDE 集成](./16-ide-integration.md)
