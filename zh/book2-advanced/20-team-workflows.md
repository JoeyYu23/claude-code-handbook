# 第二十章：团队协作

> 在团队中统一使用 Claude Code——从共享配置到 PR 自动化，让 AI 成为团队生产力倍增器。

---

## 团队共享 CLAUDE.md

团队最重要的协作基础是把 CLAUDE.md 提交到 Git，让每个人都用相同的 Claude 配置。

### 什么应该在团队 CLAUDE.md 里

```markdown
# CLAUDE.md — Team Edition

## 技术决策（Architecture Decision Records）
所有团队已讨论确认的技术选型都记录在这里。
Claude 在提建议时应参考这些决策，不应提议推翻它们。

- **状态管理**：使用 Zustand（不是 Redux）
- **样式方案**：Tailwind CSS + shadcn/ui（不是 styled-components）
- **API 客户端**：TanStack Query（不是 SWR）

## 代码规范
[团队统一的编码规范]

## 工作流程
[团队统一的 Git 流、PR 流程]
```

### 什么留在个人 ~/.claude/CLAUDE.md

```markdown
# ~/.claude/CLAUDE.md — 个人偏好

## 我的偏好
- 回复简洁，直接给代码
- 中文回复
- 我更喜欢函数式风格
```

个人偏好不应该提交到团队仓库，放在用户级别即可。

---

## 用 Claude 统一代码审查

### 场景一：PR 自动审查

在 `.claude/skills/review-pr.md` 中定义团队审查标准：

```markdown
---
name: review-pr
description: 按照团队标准审查当前 PR 的代码变更
---

# PR 代码审查

请按以下维度审查本次 PR：

## 功能正确性
- 实现是否符合 PR 描述的需求？
- 边界条件是否处理了？
- 错误处理是否完善？

## 代码质量
- 是否符合 CLAUDE.md 中的代码规范？
- 是否有重复代码可以复用？
- 命名是否清晰？

## 安全
- 用户输入是否验证？
- 有无潜在的注入漏洞？
- 敏感信息是否泄露？

## 测试
- 新功能是否有测试？
- 测试是否覆盖关键路径？

请以 Markdown 格式输出，包含：
1. 总体评价（1句话）
2. 必须修改的问题（按严重程度排序）
3. 建议改进的地方
4. 值得肯定的优点
```

使用：

```bash
git diff main | claude -p "$(cat .claude/skills/review-pr.md)"
```

### 场景二：GitHub Actions 集成

在 CI 中自动触发 Claude Code 审查：

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: curl -fsSL https://claude.ai/install.sh | bash

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # 获取 PR 的 diff
          git diff origin/${{ github.base_ref }}...HEAD > pr.diff

          # Claude 审查
          REVIEW=$(claude --print "$(cat .claude/skills/review-pr.md)" < pr.diff)

          # 输出到 GitHub Step Summary
          echo "$REVIEW" >> $GITHUB_STEP_SUMMARY

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const review = process.env.REVIEW_CONTENT;
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## Claude Code Review\n\n${review}`
            });
```

---

## PR 自动化

### 自动生成 PR 描述

```bash
# 在 .claude/skills/write-pr.md 中定义模板
---
name: write-pr
description: 根据代码变更生成规范的 PR 描述
---

根据以下代码变更，生成一个 GitHub PR 描述。

格式：
## 变更内容
[简明扼要描述做了什么]

## 变更原因
[为什么做这个变更]

## 测试方案
[如何验证变更正确]

## 截图（如有 UI 变更）
[留空，由开发者填写]

## Checklist
- [ ] 代码已自测
- [ ] 相关文档已更新
- [ ] 已添加测试

---

# 使用
git diff main | claude --print < .claude/skills/write-pr.md | pbcopy
# 粘贴到 PR 描述框中
```

### 自动生成 Commit Message

```bash
# 用 hook 自动生成 commit message
# .git/hooks/prepare-commit-msg

#!/bin/bash
if [ "$2" = "" ]; then  # 只对普通 commit 生效
    DIFF=$(git diff --cached)
    if [ -n "$DIFF" ]; then
        MSG=$(echo "$DIFF" | claude --print "根据这个 diff 生成一个符合 Conventional Commits 规范的 commit message。只输出 commit message，不要其他解释。格式：type(scope): description")
        echo "$MSG" > "$1"
    fi
fi
```

---

## 新成员 Onboarding

Claude Code 可以大幅加速新成员上手过程。

### 自动生成项目导览

```bash
# onboarding.sh
#!/bin/bash
claude --print "
你是一位经验丰富的工程师，正在帮助新入职的团队成员了解这个项目。
请分析项目结构，生成一份适合新人的入门指南，包括：
1. 项目是什么（2句话）
2. 技术架构概览
3. 最重要的 5 个文件/目录
4. 本地开发环境搭建步骤
5. 第一个任务的推荐起点
" > ONBOARDING.md
```

### Onboarding 检查清单 CLAUDE.md

```markdown
## 新成员 Onboarding 指南（放在 CLAUDE.md 或 ONBOARDING.md 中）

### 环境搭建（顺序执行）
1. `cp .env.example .env` — 复制环境变量配置
2. 联系 张三 获取 TEST_API_KEY 值
3. `make setup` — 安装依赖 + 初始化数据库
4. `make dev` — 启动开发环境
5. 访问 http://localhost:3000 验证运行正常

### 第一周推荐学习路径
- Day 1: 阅读 docs/ARCHITECTURE.md，理解系统设计
- Day 2-3: 找一个 good-first-issue 标签的 bug 来修
- Day 4-5: 参与第一次代码审查（作为 reviewer）
```

---

## 通过 Skills 共享知识

Skills（自定义斜杠命令）可以把团队的专业知识打包成可复用的命令。

### 常用团队 Skills 示例

```markdown
<!-- .claude/skills/perf-audit.md -->
---
name: perf-audit
description: 对指定页面进行性能分析和优化建议
---

分析 $ARGUMENTS 相关的代码，关注以下性能问题：
1. 不必要的 re-render（React）
2. 大列表未虚拟化
3. 未 memoize 的昂贵计算
4. 阻塞渲染的同步操作
5. 未优化的图片和资源加载

输出：问题列表 + 每个问题的优化建议 + 预期收益（小/中/大）
```

```markdown
<!-- .claude/skills/security-check.md -->
---
name: security-check
description: 对当前分支的变更做安全检查
---

审查当前代码变更的安全风险：

## 检查维度
- SQL/NoSQL 注入
- XSS 漏洞
- CSRF 保护
- 路径遍历
- 不安全的反序列化
- 硬编码的 secrets
- 过度授权
- 敏感数据泄露

对每个发现的问题，给出：
1. 风险级别（高/中/低）
2. 具体位置（文件:行号）
3. 漏洞说明
4. 修复建议
```

---

## 团队约定

### Git 工作流约定

```markdown
# CLAUDE.md 中的 Git 规范

## 分支命名
- 功能：feat/简短描述（feat/user-auth）
- 修复：fix/issue-编号（fix/issue-456）
- 重构：refactor/模块名（refactor/payment）
- 文档：docs/内容（docs/api-guide）

## Commit 规范
格式：type(scope): 简短描述
type: feat, fix, refactor, docs, test, chore, perf
示例：feat(auth): add OAuth2 login with Google

## PR 规范
- 标题格式与 commit 相同
- 描述模板见 .github/pull_request_template.md
- 最少一个 reviewer approve 才能 merge
- 所有 CI 检查通过才能 merge
```

### 自动化安全门禁

```bash
# .git/hooks/pre-commit
#!/bin/bash

# 检查是否有 secret 泄露
STAGED=$(git diff --cached)
if echo "$STAGED" | grep -qiE '(api_key|secret|password|token)\s*=\s*["\x27][^"\x27]+["\x27]'; then
    echo "ERROR: Potential secret detected in staged changes!"
    echo "Please move secrets to .env file."
    exit 1
fi

# 运行 lint
pnpm lint --quiet
```

---

**下一章：** [远程连接](./21-remote-connection.md)
