# 第七章：大项目模式

## 什么是"大项目"？

不是代码行数决定的，而是任务的复杂度：

| 规模 | 涉及文件数 | 推荐策略 |
|------|-----------|---------|
| 小 | 1-3 个文件 | 直接在主对话处理 |
| 中 | 4-8 个文件 | 1-2 个并行 agent |
| 大 | 9+ 个文件 | Architect → Coders → Review 工作流 |

9+ 文件的任务如果直接开始写，Claude 很容易：
- 在中途"忘记"最初的设计决策
- 各模块接口不一致
- 完成后发现整体架构有问题

正确方法是：**先设计，后实现，最后审查**。

---

## Architect → Coders → Review 工作流

### 阶段 1：Architect（架构设计）

由你（或一个专门的 architect agent）完成，产出详细的实现计划。

```
作为架构师，为在 devstack 项目中实现"多租户支持"功能制定详细计划。

需求：
- 每个组织有独立的数据隔离
- 现有用户可以被分配到某个组织
- API 自动根据 JWT 中的 org_id 过滤数据
- 管理员可以跨组织查看数据

请输出：
1. 受影响的文件列表（新建/修改）
2. 数据库 schema 改动（详细到字段级别）
3. 每个改动文件的实现要点
4. 各模块的接口定义（函数签名、类型定义）
5. 实现顺序和并行化建议
6. 风险点和注意事项
```

一个好的架构计划输出示例：

```markdown
## 多租户支持实现计划

### 受影响文件
**新建：**
- database/migrations/20240315_add_organizations.py
- models/organization.py
- middleware/tenant_context.py

**修改：**
- models/user.py（添加 org_id 字段）
- api/middleware.py（注入租户上下文）
- models/project.py（添加 org_id 过滤）
- models/invoice.py（添加 org_id 过滤）
- api/users.py（过滤到当前租户）
- api/projects.py（过滤到当前租户）
- api/invoices.py（过滤到当前租户）
- tests/conftest.py（添加多租户测试 fixtures）

### 接口定义
```python
# middleware/tenant_context.py
class TenantContext:
    def get_current_org_id() -> Optional[str]: ...
    def require_org_id() -> str: ...  # 如果没有则抛异常

# models/organization.py
class Organization(Base):
    id: str
    name: str
    created_at: datetime
    is_active: bool
```

### 实现顺序
1. 数据库迁移（基础，其他都依赖它）
2. Organization 模型
3. User 模型更新
4. TenantContext 中间件
5. 各 API 模块（可以并行）
6. 测试更新

### 风险点
- 现有数据迁移：已有用户需要分配到默认 org
- 超级管理员跨组织权限需要特殊处理
```

### 阶段 2：Coders（并行实现）

架构计划确认后，启动并行实现。

关键原则：**每个 coder agent 只收到它需要知道的信息，不是全部计划。**

```
基于刚才的架构计划，并行启动以下实现任务：

**Coder A（数据库层）**：
任务：实现数据库迁移和 Organization、User 模型
文件：database/migrations/20240315_add_organizations.py、models/organization.py
接口定义：[粘贴相关接口]
注意：迁移中包含现有用户数据迁移逻辑（分配到默认 org）

**Coder B（中间件）**：
任务：实现 TenantContext 中间件
文件：middleware/tenant_context.py
依赖：Coder A 的 Organization 模型（如未完成，先假设接口已定义）
接口定义：[粘贴相关接口]

**Coder C（API 层）**：
任务：更新 4 个 API 模块的数据过滤
文件：api/users.py、api/projects.py、api/invoices.py
依赖：TenantContext 中间件接口
注意：超级管理员（role == 'admin'）不过滤租户

**Coder D（测试）**：
任务：更新测试基础设施
文件：tests/conftest.py
需要：为每个测试用例创建独立的测试租户
```

### 阶段 3：Review（审查循环）

**最多两轮。**

#### 第一轮审查

```
对刚刚实现的多租户功能进行代码审查。

重点检查：
1. 是否所有数据查询都加了 org_id 过滤？（扫描所有 ORM 查询）
2. 超级管理员的绕过逻辑是否安全？
3. 迁移脚本是否可以安全回滚？
4. 测试是否覆盖了多租户的关键场景？

列出需要修复的问题。
```

#### 修复

```
修复审查中发现的问题：[问题列表]
```

#### 第二轮审查（最终确认）

```
验证上一轮的修复是否完整，同时做一次全面的集成测试。
如果发现还有问题，只报告但不自动修复——需要我决定是否接受当前状态。
```

**为什么最多两轮？**

无限修复循环会浪费时间和 token，而且有时候小问题接受它反而比花大量时间修复更合理。两轮之后，剩余的问题要么微不足道，要么需要你来做架构决策，不应该继续自动循环。

---

## 跨 Session 管理上下文

大项目往往跨越多个 session。Claude Code 的上下文窗口限制意味着你不能在一个 session 里完成所有事情。

### 策略 1：CLAUDE.md 作为持久记忆

在项目的 CLAUDE.md 中维护状态：

```markdown
# 多租户功能实现状态

## 已完成
- [x] 数据库迁移（2024-03-15）
- [x] Organization 模型
- [x] TenantContext 中间件

## 进行中
- [ ] API 层更新（users.py 完成，projects.py 和 invoices.py 待完成）

## 已知问题
- invoices.py 中的 bulk_create 方法还没有加 org_id 过滤
- 超级管理员逻辑需要在下一个 session 审查

## 接口约定
- 所有数据查询必须调用 TenantContext.require_org_id()
- 超级管理员通过 user.role == 'admin' 判断
```

每个新 session 开始时，Claude 会自动读取 CLAUDE.md，获知当前状态。

### 策略 2：/compact 保留关键信息

当上下文快满时，用 `/compact` 而不是 `/clear`：

```
/compact 保留多租户实现的当前状态：已完成的模块、待完成的模块、已知问题
```

压缩后的对话只有摘要，但摘要包含你指定的关键信息。

### 策略 3：阶段性提交

每个阶段完成后立即提交，这既是版本控制，也是进度记录：

```
git log --oneline
a3f2e1c feat(auth): add TenantContext middleware
b7c9d3e feat(db): add organizations table migration
c1e4a8f feat(models): add org_id to User and Organization
```

下次 session 开始时，通过 git log 了解进度，比任何文档都准确。

---

## 案例：构建全栈应用

假设要为虚构公司 TechFlow 构建一个项目管理工具的 v2.0，包含实时协作功能。

### 规模评估

受影响文件 25+，工作量 3-5 天。属于"大项目"，需要完整的 Architect → Coders → Review 流程。

### 第一天：架构设计

```
为 TechFlow 项目管理工具 v2.0 设计实时协作功能架构。

功能需求：
- 多用户同时编辑项目任务，实时看到对方的改动
- 任务状态变更时所有在线用户立即看到更新
- 用户光标位置实时显示（协同编辑感）
- 离线时自动缓存，重新连接时同步

技术约束：
- 后端：Python FastAPI
- 前端：React + TypeScript
- 数据库：PostgreSQL

请输出完整的技术架构方案，包括：
- 技术选型（WebSocket vs SSE vs Long Polling？为什么？）
- 数据流设计
- 冲突解决策略
- 受影响的所有文件
- 实现优先级
```

### 第二天：核心实现（并行）

基于架构方案，拆分并行任务：

```
启动并行实现：

Coder A：WebSocket 服务器基础设施
- backend/websocket/manager.py（连接管理）
- backend/websocket/events.py（事件类型定义）

Coder B：任务实时同步
- backend/api/tasks.py（添加 WebSocket 广播）
- backend/models/task.py（添加版本字段用于冲突检测）

Coder C：前端 WebSocket 集成
- frontend/hooks/useWebSocket.ts
- frontend/hooks/useRealtimeTask.ts

Coder D：前端 UI 组件
- frontend/components/TaskCard.tsx（添加实时状态显示）
- frontend/components/CollaboratorCursors.tsx（光标显示）
```

### 第三天：集成与测试

```
对 v2.0 实时协作功能进行集成测试和审查。

测试场景：
1. 两个用户同时修改同一任务（冲突解决）
2. 网络断开重连（状态同步）
3. 并发高负载（10 个用户同时操作）

运行已有的测试套件，并为上述场景编写新测试。
```

### 关键成功因素

1. **架构计划足够详细**：接口定义精确到函数签名，不只是"写一个用于 X 的模块"
2. **每个 coder 只看到它需要的**：信息过载会让 agent 分心
3. **依赖关系明确**：告诉 coder B "依赖 coder A 的 Organization 模型，如未完成则假设接口已定义"
4. **及时提交**：每个有意义的里程碑提交一次，便于追踪和回退
5. **两轮审查上限**：不要陷入无限修复循环

---

## 常见陷阱与应对

### 陷阱 1：架构计划太模糊

**问题**：计划只说"实现用户认证模块"，没有接口定义

**影响**：不同 coder 实现的接口互不兼容，集成阶段大量返工

**应对**：架构计划必须包含精确的函数签名和类型定义

### 陷阱 2：并行任务有隐藏的写冲突

**问题**：两个 coder 都需要修改 `config.py`

**影响**：后完成的 coder 覆盖前一个的改动

**应对**：在架构计划阶段识别所有共享文件，设计一个负责修改共享文件

### 陷阱 3：上下文积累到爆炸

**问题**：到了第三天，上下文窗口已经装满了第一天、第二天的所有对话

**影响**：Claude 开始"遗忘"早期的设计决策

**应对**：每天开始新的 session，通过 CLAUDE.md 和 git log 恢复上下文

### 陷阱 4：审查循环无法终止

**问题**：审查发现问题 → 修复 → 审查发现新问题 → 无限循环

**应对**：硬性限制两轮审查，剩余问题作为 tech debt 记录，不影响功能交付

---

**下一章：** [Hook 系统深入](./08-hooks.md)
