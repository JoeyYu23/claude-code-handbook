# 键盘快捷键

Claude Code 所有可用键盘快捷键的完整参考。按使用场景分类：终端/CLI 快捷键、VS Code 插件快捷键和通用文本编辑。

---

## 开始前：平台说明

很多快捷键在 Mac 和 Windows/Linux 上有所不同。本指南使用：
- **Mac：** `Cmd` 表示 Command 键，`Option` 表示 Option/Alt 键
- **Windows/Linux：** `Ctrl` 表示 Control 键，`Alt` 表示 Alt 键

**macOS 用户：** 有些快捷键使用 `Option` 键作为 Meta 键。这需要一次性的终端配置：
- **iTerm2：** Settings → Profiles → Keys → 将 Left/Right Option 键设为"Esc+"
- **Terminal.app：** Settings → Profiles → Keyboard → 勾选"Use Option as Meta Key"
- **VS Code 集成终端：** Settings → Profiles → Keys → 将 Option 键设为"Esc+"

配置后，`Option+B`、`Option+F` 等快捷键就能正常工作了。

在 Claude Code 会话中按 `?` 可查看当前环境中可用的快捷键。

---

## 终端 / CLI 快捷键

### 会话控制

| 快捷键 | 功能 |
|---|---|
| `Ctrl+C` | 取消当前操作或输入 |
| `Ctrl+D` | 退出 Claude Code（发送 EOF 信号） |
| `Ctrl+L` | 清屏（保留对话历史） |
| `Ctrl+R` | 搜索命令历史（输入以过滤，再次按 `Ctrl+R` 循环显示更早的匹配项） |
| `Esc` + `Esc` | 回退或汇总（将代码/对话恢复到之前某个时间点，或对某条消息进行汇总） |

### 导航与输出

| 快捷键 | 功能 |
|---|---|
| `Ctrl+O` | 切换详细输出（显示详细的工具使用和执行步骤） |
| `Ctrl+G` | 在默认文本编辑器中打开当前提示（或计划） |
| `Ctrl+T` | 切换终端状态栏中任务列表的显示 |
| `↑` 方向键 | 在历史记录中导航到上一条命令 |
| `↓` 方向键 | 在历史记录中导航到下一条命令 |
| `← / →` 方向键 | 在权限对话框和菜单的标签页中循环 |

### 权限模式切换

| 快捷键 | 功能 |
|---|---|
| `Shift+Tab` | 在权限模式间循环（默认 → 自动接受 → 计划模式 → 默认） |

### 后台任务

| 快捷键 | 功能 |
|---|---|
| `Ctrl+B` | 将当前运行的命令转为后台运行（tmux 用户：连按两次） |
| `Ctrl+X Ctrl+K` | 终止所有后台代理（和弦按键序列，先按 Ctrl+X 再按 Ctrl+K） |

### 模型与思考

| 快捷键 | 功能 |
|---|---|
| `Cmd+P`（Mac）/ `Meta+P`（Win/Linux） | 不清空提示直接切换模型 |
| `Cmd+T`（Mac）/ `Meta+T`（Win/Linux） | 切换扩展思考模式开/关（需先运行 `/terminal-setup`） |

### 粘贴

| 快捷键 | 功能 |
|---|---|
| `Ctrl+V` | 从剪贴板粘贴图片 |
| `Cmd+V`（iTerm2） | 从剪贴板粘贴图片（仅限 iTerm2） |
| `Alt+V`（Windows） | 从剪贴板粘贴图片 |

---

## 文本编辑快捷键（在提示框内）

这些快捷键在你输入提示框时有效——在发送消息之前。

### 行编辑

| 快捷键 | 功能 |
|---|---|
| `Ctrl+K` | 删除从光标到行尾的内容（删除的文本保存可供粘贴） |
| `Ctrl+U` | 删除整行（删除的文本保存可供粘贴） |
| `Ctrl+Y` | 粘贴最近删除的文本 |
| `Alt+Y`（Ctrl+Y 之后） | 循环浏览粘贴历史（Mac：需要 Option 作为 Meta） |

### 词语导航

| 快捷键 | 功能 |
|---|---|
| `Alt+B`（Mac：需要 Option 作为 Meta） | 光标向后移动一个词 |
| `Alt+F`（Mac：需要 Option 作为 Meta） | 光标向前移动一个词 |

### 多行输入

| 方法 | 操作方式 |
|---|---|
| 快速转义（所有终端） | 输入 `\` 然后按 `Enter` |
| macOS 默认 | `Option+Enter` |
| iTerm2、WezTerm、Ghostty、Kitty | `Shift+Enter`（直接可用） |
| VS Code、Alacritty、Zed、Warp | `Shift+Enter`（运行 `/terminal-setup` 启用） |
| 控制序列 | `Ctrl+J`（换行符） |

---

## 快捷命令（提示前缀）

在提示开头输入这些内容可触发特殊行为：

| 前缀 | 功能 |
|---|---|
| `/` | 打开命令菜单——显示所有可用的斜杠命令 |
| `!` | 直接运行 Shell 命令而不经过 Claude（输出添加到对话） |
| `@` | 触发文件路径自动补全——在提示中引用文件 |

---

## 斜杠命令（内置）

在 Claude Code 中输入 `/` 查看所有可用命令。以下是最常用的：

| 命令 | 功能 |
|---|---|
| `/help` | 显示可用命令和快捷键 |
| `/clear` | 清除对话历史并重新开始（之前的会话会保存，可以恢复） |
| `/compact` | 压缩对话历史以释放上下文空间 |
| `/memory` | 查看所有已加载的 CLAUDE.md 和自动记忆文件；切换自动记忆 |
| `/permissions` | 查看和管理权限规则（允许列表和拒绝列表） |
| `/resume` | 打开会话选择器以恢复之前的会话 |
| `/rename` | 为当前会话命名一个描述性名称 |
| `/init` | 为当前项目生成 CLAUDE.md 文件 |
| `/config` | 打开设置界面 |
| `/theme` | 更改颜色主题 |
| `/vim` | 启用 vim 风格编辑模式 |
| `/add-dir` | 在当前会话中为 Claude 添加可访问的额外目录 |
| `/agents` | 列出可用的子代理并创建新的 |
| `/mcp` | 管理 MCP 服务器连接 |
| `/btw` | 提一个快速的顺带问题，不添加到对话历史 |
| `/effort` | 设置推理力度：`/effort low`、`/effort medium`、`/effort high` |
| `/model` | 切换到不同的 Claude 模型 |
| `/fast` | 切换快速模式（更低延迟，推理不那么深入） |

---

## VS Code 插件快捷键

这些快捷键在 VS Code 的 Claude Code 插件面板中有效。

### 打开 Claude

| 快捷键 | 功能 |
|---|---|
| 点击编辑器右上角的火花图标 | 打开 Claude 面板（需要有文件打开） |
| 点击活动栏的火花图标 | 打开会话列表 |
| `Cmd+Shift+P` / `Ctrl+Shift+P` → "Claude Code" | 通过命令面板打开 |
| 点击状态栏"✱ Claude Code" | 打开 Claude（始终可用，即使没有文件打开） |

### 导航

| 快捷键 | 功能 |
|---|---|
| `Cmd+Esc` / `Ctrl+Esc` | 在编辑器和 Claude 之间切换焦点 |
| `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | 在编辑器标签中打开新的 Claude 对话 |
| `Cmd+N` / `Ctrl+N` | 开始新对话（当 Claude 获得焦点时） |

### 文件操作

| 快捷键 | 功能 |
|---|---|
| `Option+K` / `Alt+K` | 为当前文件和选区插入 @-提及引用到提示中 |
| `Shift` + 拖拽文件到提示框 | 以附件形式添加文件 |
| `Cmd+click` / `Ctrl+click` 点击图片引用 | 在默认查看器中打开图片 |

### 发送消息

| 设置 | 默认值 | 替代方式 |
|---|---|---|
| 发送消息 | `Enter` | 启用 `useCtrlEnterToSend` 设置改为用 `Ctrl+Enter` |
| 在提示中换行 | `Shift+Enter` | |

### 检查点（仅限 VS Code）

| 操作 | 方法 |
|---|---|
| 显示回退按钮 | 将鼠标悬停在任意消息上 |
| 从该时间点分叉对话 | 点击回退 → "Fork conversation from here" |
| 将文件改动恢复到该时间点 | 点击回退 → "Rewind code to here" |
| 分叉并恢复 | 点击回退 → "Fork conversation and rewind code" |

---

## Vim 模式快捷键

用 `/vim` 或在 `/config` 中启用 vim 模式。这些快捷键在 NORMAL 模式下有效。

### 模式切换

| 按键 | 功能 |
|---|---|
| `Esc` | 进入 NORMAL 模式 |
| `i` | 在光标前插入 |
| `I` | 在行首插入 |
| `a` | 在光标后插入 |
| `A` | 在行尾插入 |
| `o` | 在下方新建一行 |
| `O` | 在上方新建一行 |

### NORMAL 模式导航

| 按键 | 功能 |
|---|---|
| `h` / `j` / `k` / `l` | 左 / 下 / 上 / 右 |
| `w` | 下一个词 |
| `b` | 上一个词 |
| `e` | 词尾 |
| `0` | 行首 |
| `$` | 行尾 |
| `gg` | 输入开头 |
| `G` | 输入结尾 |
| `f{char}` | 跳转到下一个字符出现位置 |

### NORMAL 模式编辑

| 按键 | 功能 |
|---|---|
| `x` | 删除字符 |
| `dd` | 删除行 |
| `cc` | 修改行 |
| `yy` | 复制（yank）行 |
| `p` | 在光标后粘贴 |
| `P` | 在光标前粘贴 |
| `.` | 重复上一次改动 |
| `>>` | 增加缩进 |
| `<<` | 减少缩进 |

---

## 会话选择器快捷键

会话选择器打开时（通过 `claude --resume` 或 `/resume`）：

| 按键 | 功能 |
|---|---|
| `↑` / `↓` | 在会话之间导航 |
| `→` / `←` | 展开或折叠分组的会话 |
| `Enter` | 恢复高亮的会话 |
| `P` | 预览会话内容 |
| `R` | 重命名高亮的会话 |
| `/` | 搜索/过滤会话 |
| `A` | 在当前目录和所有项目之间切换 |
| `B` | 过滤为当前 Git 分支的会话 |
| `Esc` | 退出选择器或取消搜索 |

---

## 功能类似快捷键的 CLI 标志

这些命令行标志在启动会话时改变 Claude Code 的行为：

| 标志 | 效果 |
|---|---|
| `claude -c` | 继续最近的对话 |
| `claude -r` | 打开会话选择器（或 `claude -r name` 通过名称恢复） |
| `claude -n name` | 以自定义名称启动会话 |
| `claude --permission-mode plan` | 以计划模式启动 |
| `claude --permission-mode acceptEdits` | 以自动接受模式启动 |
| `claude -v` | 打印 Claude Code 版本号 |
| `claude update` | 将 Claude Code 更新到最新版本 |

---

*在任意 Claude Code 会话中按 `?` 可查看当前终端和平台配置下特定的快捷键。*
