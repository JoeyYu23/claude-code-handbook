# 第 22 章：语音、快速模式与尽力级别

Claude Code 提供了多种方式来调整你与 Claude 推理问题的方式。本章涵盖三个互补功能：用于无手输入的语音听写、用于降低延迟的快速模式，以及用于控制推理深度和输出质量的尽力级别。

---

## 语音听写

语音听写将 Claude Code 转化为无需输入即可使用的工具。启用一次，然后按住 Space 来直接向 Claude 听写消息或命令。

### 启用语音听写

```text
/voice
```

这打开语音配置屏幕，其中你可以：
- 启用或禁用语音输入
- 选择输入语言（支持 20 种语言，截至 2026 年 3 月。支持的语言数量在持续增加，请查阅官方文档获取最新列表。）
- 调整麦克风灵敏度
- 设置语音反馈（Claude 应该用音频回应吗）
- 测试麦克风

启用后，再次 `/voice` 来调整设置而无需重新启用。

**首次设置需要 30 秒：** 选择语言、测试麦克风、确认音频权限，你就准备好了。

### 按住说话的 Space 键

按住 Space 来录制。释放时完成。Claude 处理音频并在发送给模型之前显示转录。

**工作流：**

1. 按住 Space
2. 听写："Add error handling to the auth middleware"
3. 释放 Space
4. Claude 显示：`Add error handling to the auth middleware`
5. 按 Enter 发送，或如果需要可编辑转录

**单个录制中的多个话语：**

你可以在录制中间暂停并继续而无需释放 Space。对于较长的指令很有用：

```
[Hold Space]
"Refactor the database query"
[Pause 2 seconds while thinking]
"Add caching for frequently accessed records"
[Release Space]
```

Claude 将这些连接成单个消息。

### 语言配置

语音支持多种语言并根据你的系统设置自动检测最可能的语言：

```text
/voice [language]
```

示例：
```text
/voice English (US)
/voice Mandarin Chinese
/voice Spanish (Mexico)
/voice French (Canada)
```

语言检测不完美，特别是对于混合代码和自然语言。如果转录不准确：

1. 切换到最常使用的语言来发出命令
2. 在代码术语之间更清楚地说话
3. 用 `/voice` 来调整灵敏度

**提示：** 对于代码密集的指令，考虑输入代码并使用语音的英文描述。例如，听写"Create a function that does X"但输入函数签名来避免语法转录错误。

### 语音何时效果最好

**理想场景：**

- 写提交消息："Fixed the authentication timeout issue"
- 高级指令："Refactor this to be more testable"
- 代码审查反馈："Add validation before saving to the database"
- 快速更正："That should be async instead"

**避免语音：**

- 复杂的正则表达式模式
- 深层嵌套的代码结构
- 精确的 JSON 配置
- 任何一个字符错误会改变含义的指令

---

## 快速模式

快速模式通过跳过一些推理步骤来降低 Claude 的响应延迟。模型是相同的，但 Claude 在更紧的限制下运行 — 优先考虑速度而不是详尽审议。

### 切换快速模式

```text
/fast on
/fast off
```

不带参数，`/fast` 显示当前状态。

**快速模式影响：**
- 响应生成（流开始更快）
- 文件分析（跳过一些优化通过）
- 推理链（较短的内部审议）

它 **不** 影响：
- 模型能力（仍使用所选模型）
- 令牌使用（大约相同）
- 输出格式（仍遵循相同约定）

### 何时使用快速模式

**何时使用快速模式：**

- 你快速迭代并需要快速反馈（设计 UI、探索方法）
- 你在执行日常任务（重构变量名、添加评论）
- 你在你的计算机上并希望立即响应（速度是主要目标）
- 你在慢速网络上并延迟比完整性更重要

**何时不使用快速模式：**

- 你在做架构决定（需要完整推理）
- 你在调试复杂问题（需要仔细分析）
- 你在写安全关键代码（需要彻底审查）
- 你有时间并想要最高质量的输出

### 脚本中的快速模式

在 `.claude/settings.json` 中配置快速模式以获得一致的行为：

```json
{
  "session": {
    "fast_mode": true
  }
}
```

或每个智能体启用：

```json
{
  "agents": [
    {
      "name": "routine-fixer",
      "fast": true,
      "instructions": "Apply formatting and linting fixes quickly"
    }
  ]
}
```

---

## 尽力级别

尽力控制 Claude 应用于任务的计算资源量，直接影响推理深度、审议时间和输出质量。这独立于模型选择 — 你可以用高尽力使用 Sonnet 或用低尽力使用 Opus。

### 设置尽力

```text
/effort low
/effort medium
/effort high
/effort max
/effort auto
```

默认是 `auto`，根据任务复杂性调整。更高的尽力使用更多令牌并耗时更长，但产生更仔细、彻底的输出。

**尽力级别解释：**

| 级别 | 思考时间 | 使用案例 | 成本 |
|---|---|---|---|
| `low` | 最小 | 简单任务、快速答案 | 最低 |
| `medium` | 标准 | 典型开发任务 | 标准 |
| `high` | 延伸 | 复杂调试、架构 | 高 |
| `max` | 最大 | 安全审查、困难设计 | 最高 |
| `auto` | 自适应 | 默认；按任务调整 | 可变 |

### 使用键盘的尽力

在支持的平台上，使用 `Cmd+T` (macOS) 或 `Meta+T` (Windows/Linux) 来切换尽力级别而不用输入。这比 `/effort` 更快用于频繁调整。

**键盘循环：**

```
Cmd+T: auto → low → medium → high → max → auto
```

你当前的级别显示在状态栏中。

### 思考令牌与输出质量

尽力直接影响 **思考令牌** — Claude 分配给内部推理的令牌。更多思考令牌意味着：

- 更好的问题分析
- 对边缘案例更彻底的考虑
- 更仔细的代码审查
- 更好的设计决定

**真实例子：**

```
将这个 500 行解析器重构为更小的函数。

低尽力：     200 令牌输出，无思考
中等尽力：  400 令牌输出 + 500 思考令牌
高尽力：    500 令牌输出 + 2000 思考令牌
最大尽力：  600 令牌输出 + 5000+ 思考令牌
```

更高的尽力产生更详细的重构建议、更好的测试案例和更彻底的文档。

### 尽力与模型选择

尽力和模型选择是独立的：

- **Sonnet + 最大尽力：** 快速模型、彻底推理。适合需要关心的日常任务。
- **Opus + 低尽力：** 慢速模型、最小推理。对于简单任务是过度的。
- **Sonnet + 自动尽力：** 均衡 — 对大多数工作都是绝佳的默认值。
- **Opus + 最大尽力：** 最大力量。预留给架构决定或安全审查。

**成本意识的模式：**

对 90% 的工作使用 Sonnet（快速、便宜）+`auto` 尽力。只对架构决定切换到 Opus + `high` 尽力。

```text
/model sonnet
/effort auto
# 正常开发

/model opus
/effort max
# 在发布关键代码前
```

### 智能体配置中的尽力

按智能体设置尽力来编码任务复杂性：

```json
{
  "agents": [
    {
      "name": "code-reviewer",
      "model": "opus",
      "effort": "high",
      "instructions": "Review code for correctness and performance"
    },
    {
      "name": "quick-fixer",
      "model": "sonnet",
      "effort": "low",
      "instructions": "Apply linting and formatting fixes quickly"
    }
  ]
}
```

代码审查员获得最大注意力。快速修复器快速完成日常工作。

### 自适应思考

`auto` 尽力是推荐的默认值。Claude 基于检测到的任务复杂性调整尽力：

**Claude 自动增加尽力当检测到：**
- 与安全相关的代码
- 复杂的算法问题
- 架构决定
- 调试不清楚的问题
- 为边缘案例写测试

**Claude 自动降低尽力对于：**
- 格式化更改
- 变量重命名
- 添加评论
- 例行文件创建
- 简单复制编辑

你总是可以用显式尽力级别覆盖自适应行为，但 `auto` 处理大多数情况很好。

### 尽力与延迟

更高的尽力增加首令牌时间 (TTFT) 和总响应时间：

| 尽力 | TTFT | 响应时间 |
|---|---|---|
| 低 | <1s | 3-5s |
| 中等 | 1-2s | 5-10s |
| 高 | 2-4s | 10-20s |
| 最大 | 4-6s | 20-40s |

对于交互工作，`low` 和 `medium` 感到有响应。对于非交互任务（提交、审查、隔夜运行），`high` 或 `max` 提供更好的质量。

---

## 重新审视模型选择

尽力级别改变你对模型选择的思考方式：

**传统想法（无尽力级别）：**
- 简单任务 → 使用 Haiku
- 复杂任务 → 使用 Opus
- 中等任务 → 使用 Sonnet

**新想法（有尽力级别）：**
- 简单任务 + 低尽力 → Haiku
- 中等任务 + 自动尽力 → Sonnet
- 复杂任务 + 高尽力 → Sonnet 或 Opus
- 关键任务 + 最大尽力 → Opus
- 日常任务 + 高尽力 → Sonnet（比 Opus 更好的价值）

**成本最优的模式：**

```text
# 模式 1：用自适应尽力使用 Sonnet
/model sonnet
/effort auto
# 适用于 95% 的任务

# 模式 2：Sonnet 作为默认，Opus 用于关键决定
/model sonnet
/effort auto
# 日常工作

/model opus
/effort high
# 主要重构、架构

# 模式 3：用简单、快速任务的 Haiku
/model haiku
/effort low
# 快速答案、提示修复、简单搜索
```

**何时使用每个模型：**

- **Haiku：** 快速答案、简单实用脚本、首次探索
- **Sonnet：** 常规开发、大多数工作的默认选择
- **Opus：** 架构决定、复杂调试、安全审查

**何时尽力比模型更重要：**

```text
高尽力的 Sonnet 通常在复杂任务上比低尽力的 Opus 表现更好。
在转向 Opus 前使用 /model sonnet 和 /effort high。
```

---

## 快速参考

| 功能 | 命令 | 使用案例 |
|---|---|---|
| 启用语音 | `/voice` | 无手输入 |
| 按住说话 | 按住 Space | 录制听写 |
| 设置语言 | `/voice [lang]` | 多语言支持 |
| 切换快速 | `/fast on/off` | 降低延迟 |
| 设置尽力 | `/effort [level]` | 控制推理深度 |
| 循环尽力 | `Cmd+T` / `Meta+T` | 快速调整 |
| 尽力 + 模型 | `/model sonnet`, `/effort high` | 成本最优配置 |

---

## 实用工作流

**典型会话：**

```
1. 从 /model sonnet 和 /effort auto 开始
2. 对于探索和迭代，使用 /fast on
3. 对于质量关键工作，使用 /effort high 或 max
4. 对高级描述使用语音；对代码输入
5. 在交互工作时使用 Cmd+T 来切换尽力
```

**示例任务：添加功能请求验证 API**

```text
/fast on
# 快速获得基本结构

/fast off
/effort high
# 小心地写验证逻辑

/effort auto
# 日常端点设置

/voice
# 听写：为新端点添加集成测试
```

---

## 参考资料

- [第 1 章：内置斜线命令](./01-slash-commands.md) — `/model` 和 `/effort` 的参考
- [第 16 章：令牌优化](./16-token-optimization.md) — 理解令牌成本
---

*成本与定价数据，请参见 Book 3：[成本现实](/zh/book3-architect/09-cost-reality)。*
