# 第十二章：浏览器 MCP

> 用 Claude Code 直接操控浏览器——截图、填表、跑 E2E 测试，全部自动化。

---

## 为什么需要浏览器 MCP？

大多数开发工作最终都要落地到浏览器里：验证页面渲染、跑端对端测试、抓取数据、审查性能指标。传统做法是手动切换窗口，或者维护一套复杂的 Playwright/Selenium 脚本。

浏览器 MCP 让 Claude Code 直接拥有"一双手"，可以像真人一样操作浏览器，同时 Claude 的语言理解能力让它能看懂页面内容并做出判断——不只是机械地执行脚本。

---

## Playwright MCP Server

Anthropic 官方推荐使用 Playwright MCP Server，它是目前浏览器自动化领域最成熟的选择。

### 安装

```bash
# 添加 Playwright MCP server
claude mcp add --transport stdio playwright \
  -- npx -y @playwright/mcp@latest
```

验证安装成功：

```bash
claude mcp list
# playwright    stdio    /path/to/npx @playwright/mcp@latest
```

### 工作原理

Playwright MCP Server 在你的机器上启动一个受控的 Chromium 浏览器实例，通过 MCP 协议暴露一系列工具给 Claude Code。Claude 可以调用这些工具来：

- 导航到 URL
- 点击页面元素
- 填写表单
- 执行 JavaScript
- 截取截图
- 等待特定状态

---

## 核心操作示例

### 导航和截图

```
# 在 Claude Code 中
> 打开 https://example.com 并截图，告诉我页面主要内容是什么

Claude 将会：
1. 调用 playwright_navigate 导航到指定 URL
2. 调用 playwright_screenshot 截取当前页面
3. 分析截图内容并回答你的问题
```

### 填写表单

一个典型的登录场景：

```
> 打开 http://localhost:3000/login
  用 test@example.com 和密码 demo123 登录
  截图确认登录成功

Claude 执行步骤：
1. 导航到登录页
2. 找到邮箱输入框（通过标签文本、placeholder 或 id）
3. 填入邮箱地址
4. 找到密码输入框并填入密码
5. 找到提交按钮并点击
6. 等待页面跳转
7. 截图验证当前 URL 和页面内容
```

### 点击元素

Claude 理解页面语义，可以用自然语言描述你想点击的元素：

```
> 点击导航栏里的"产品"菜单，然后点击下拉菜单中的"企业版"

> 找到价格页面上第二个套餐的"立即购买"按钮并点击
```

---

## Lighthouse 审计

Playwright MCP 与 Chrome DevTools 深度集成，可以运行 Lighthouse 性能审计：

```
> 对 https://my-app.com 运行 Lighthouse 审计
  重点关注：性能分数、首次内容绘制(FCP)、最大内容绘制(LCP)
  如果有明显问题，给出优化建议

示例输出分析：
- Performance: 67/100
- FCP: 2.8s (需要优化，目标 < 1.8s)
- LCP: 4.2s (较差，目标 < 2.5s)
- 主要问题：render-blocking resources, 未压缩图片
```

---

## 用浏览器 MCP 做 E2E 测试

这是浏览器 MCP 最强大的使用场景之一——让 Claude 充当智能 QA 工程师。

### 场景一：用户注册流程测试

```
> 测试用户注册流程：
  1. 打开 http://localhost:3000/register
  2. 用随机邮箱（格式：test_<timestamp>@example.com）注册
  3. 验证注册成功页面出现
  4. 检查是否收到欢迎邮件（检查 http://localhost:8025 的 MailHog 界面）
  5. 报告每个步骤的结果，截图保存证据
```

### 场景二：响应式布局检查

```
> 用不同视口尺寸测试首页：
  - 移动端：375x667 (iPhone SE)
  - 平板：768x1024 (iPad)
  - 桌面：1440x900
  截图并指出布局问题
```

### 场景三：跨浏览器兼容性

```
> 检查这个 CSS 动画在 Chromium 上的渲染效果
  录制一段 3 秒的动画截图序列（每隔 500ms 截一次）
  告诉我动画是否流畅
```

---

## 实战示例：自动化回归测试报告

下面是一个完整的实战场景：在每次部署后，让 Claude 自动运行关键路径测试并生成报告。

### CLAUDE.md 配置

```markdown
# 浏览器测试规范

## E2E 测试执行
- 测试环境：http://localhost:3000
- 测试账号：qa@example.com / qa_password_123
- 截图保存路径：./test-screenshots/

## 关键路径
1. 用户登录
2. 创建新项目
3. 邀请团队成员
4. 导出数据

## 报告格式
每个测试步骤记录：通过/失败 + 截图路径 + 备注
最终生成 markdown 报告存入 ./test-reports/
```

### 执行测试

```bash
# 启动应用
npm run dev &

# 让 Claude 运行 E2E 测试
claude "运行关键路径 E2E 测试，按照 CLAUDE.md 中的规范生成测试报告"
```

### 生成的测试报告示例

```markdown
# E2E 测试报告 - 2024-01-15 14:32

## 测试环境
- URL: http://localhost:3000
- 浏览器: Chromium 121.0

## 测试结果汇总
- 通过: 12/15
- 失败: 3/15
- 执行时间: 2分34秒

## 失败项目

### TC-03: 创建新项目
- 步骤失败：点击"创建"按钮后，弹窗未出现
- 截图：./test-screenshots/tc-03-fail.png
- 可能原因：按钮 ID 已变更（旧：#create-btn，现：#new-project-btn）
```

---

## 高级技巧

### 处理动态内容

```
> 等待 API 数据加载完毕后再截图
  判断依据：页面上出现包含用户名的欢迎信息
  超时时间：10 秒
```

### 处理弹窗和 Cookie 提示

```
> 打开网站前先检查有没有 Cookie 同意弹窗
  如果有，点击"接受所有"后再继续操作
```

### 截图对比

```
> 截图保存当前首页，文件名加上今天的日期
  然后与上次保存的截图对比，列出视觉差异
```

---

## 常见问题

**Q: 浏览器窗口出现在哪里？**
A: Playwright 默认以 headless（无头）模式运行，不显示窗口。如果需要可见窗口调试，可以在启动时加 `--headed` 参数。

**Q: 如何处理需要真实身份验证的页面？**
A: 推荐在测试环境中准备专用测试账号，或者使用 Playwright 的 storage state 功能保存已登录状态。

**Q: 性能指标不准确怎么办？**
A: 确保测试环境配置与生产环境相近，避免在资源紧张的机器上运行 Lighthouse，结果会有偏差。

---

**下一章：** [数据库 MCP](./13-database-mcp.md)
