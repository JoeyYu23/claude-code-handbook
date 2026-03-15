# 第十三章：数据库 MCP

> 用自然语言查询你的数据库——探索 Schema、分析数据、安全地执行操作。

---

## 为什么数据库 MCP 值得重视？

传统的数据库工作流：打开 DBeaver / TablePlus / psql，拼 SQL，看结果，再回到 IDE，解释数据……这个过程中有太多的上下文切换。

数据库 MCP 让 Claude Code 直接连接数据库，你可以用自然语言描述你想知道的，Claude 会帮你写 SQL、解释结果、发现问题——同时保持在你的编码工作流里。

---

## 推荐：DBHub MCP Server

[DBHub](https://github.com/bytebase/dbhub) 是目前最受欢迎的通用数据库 MCP server，支持 PostgreSQL、MySQL、SQLite、SQL Server 等主流数据库。

### 安装

```bash
# PostgreSQL
claude mcp add --transport stdio db \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://username:password@localhost:5432/mydb"

# MySQL
claude mcp add --transport stdio db \
  -- npx -y @bytebase/dbhub \
  --dsn "mysql://username:password@localhost:3306/mydb"

# SQLite
claude mcp add --transport stdio db \
  -- npx -y @bytebase/dbhub \
  --dsn "sqlite:///path/to/database.db"

# 只读模式（推荐生产环境）
claude mcp add --transport stdio db-readonly \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly_user:pass@prod.db.com:5432/analytics" \
  --readonly
```

---

## 通过 Claude 运行查询

### 基础查询

```
> 统计 users 表里总共有多少用户，其中有多少是过去 30 天注册的

Claude 生成并执行：
SELECT
  COUNT(*) AS total_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS new_users
FROM users;

返回结果：
total_users: 45,231
new_users: 1,847
```

### 复杂分析

Claude 可以处理多步骤、多表的复杂分析：

```
> 分析过去 7 天每天的订单量和收入趋势
  同时找出哪些商品类别的退款率最高
  用表格格式展示结果

Claude 会：
1. 写出日订单/收入统计的 SQL
2. 写出退款率分析的 SQL
3. 执行两个查询
4. 将结果格式化为 Markdown 表格并解释趋势
```

---

## Schema 探索

对于不熟悉的数据库，Schema 探索是最有价值的场景之一：

```
> 帮我理解这个数据库的结构
  列出所有表，重点解释 orders、products、users 这三张表的关系
  有没有设计上的潜在问题？

Claude 执行：
1. 查询 information_schema.tables 获取所有表
2. 查询各表的 column 信息和外键约束
3. 生成 ER 关系说明
4. 基于经验指出常见问题（如缺少索引、NULL 约束不当等）
```

### 索引分析

```
> 检查一下 orders 表的索引设置是否合理
  这个查询为什么这么慢：SELECT * FROM orders WHERE user_id = 123 AND status = 'pending'

Claude 查看索引后可能回复：
user_id 列有索引，但 status 列没有。
建议添加组合索引：
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

预计查询时间从 120ms 降至 5ms。
```

---

## 数据分析工作流

### 场景一：业务指标 Dashboard

```
> 生成本月的业务健康报告：
  1. 日活用户趋势（DAU）
  2. 平均订单金额（AOV）
  3. 用户留存率（7天、30天）
  4. 最受欢迎的 5 个功能（按使用次数）

  请把数据整理成 Markdown 表格，如果有异常值要特别标注
```

### 场景二：数据质量检查

```
> 做一次数据质量检查：
  1. 检查 users 表中 email 字段是否有重复或格式异常
  2. 检查 orders 表中有没有 total_amount 为负数的记录
  3. 检查 created_at 和 updated_at 字段的时区是否一致

  输出问题清单和影响条数
```

### 场景三：迁移前验证

```
> 我们要把 products 表的 category 字段从 VARCHAR 改成外键关联 categories 表
  在迁移前，帮我：
  1. 统计 category 字段有多少种不同的值
  2. 找出 categories 表中缺失的对应记录
  3. 生成需要先插入 categories 的 SQL 语句
```

---

## 安全：只读 vs 写入权限

这是数据库 MCP 最重要的实践原则。

### 原则

| 环境 | 连接用户 | 权限 |
|------|---------|------|
| 生产数据库 | readonly_user | SELECT 只读 |
| 开发/测试数据库 | dev_user | 完整权限 |
| 数据分析任务 | analyst_user | SELECT + 特定 schema |

### 为 Claude 创建专用数据库用户

```sql
-- PostgreSQL 示例：创建只读用户
CREATE USER claude_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE mydb TO claude_readonly;
GRANT USAGE ON SCHEMA public TO claude_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;

-- 未来新建的表也自动授权
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO claude_readonly;
```

```sql
-- MySQL 示例：创建只读用户
CREATE USER 'claude_readonly'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT ON mydb.* TO 'claude_readonly'@'localhost';
FLUSH PRIVILEGES;
```

### CLAUDE.md 中声明权限边界

```markdown
# 数据库操作规范

## 连接配置
- 开发环境：使用 db 连接（读写）
- 分析任务：使用 db-readonly 连接（只读）

## 安全规则
- 生产数据库 NEVER 执行 DELETE 或 UPDATE
- 如需修改生产数据，先写出 SQL，等待人工确认
- 包含 PII 的字段（email、phone、address）不得出现在 Claude 回复中
- 查询结果超过 1000 行时，只展示摘要统计
```

---

## 配置多个数据库

大型项目往往有多个数据库，可以同时配置：

```bash
# 主业务数据库
claude mcp add --transport stdio db-main \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@main.db.internal:5432/app"

# 数据仓库
claude mcp add --transport stdio db-warehouse \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://analyst:pass@warehouse.db.internal:5432/analytics"

# Redis（通过支持 Redis 的 MCP server）
claude mcp add --transport stdio redis \
  -- npx -y @modelcontextprotocol/server-redis \
  --url "redis://localhost:6379"
```

使用时指定数据库：

```
> 从主业务数据库查出今天的新增用户列表
  然后在数据仓库里查这些用户过去 90 天的行为数据
  做一个完整的用户画像分析
```

---

## 常见问题

**Q: Claude 会把我的数据库内容发送给 Anthropic 吗？**
A: 查询结果会作为上下文发送给 Claude API（Anthropic 服务器）用于生成回复。因此不要在 Claude 中查询包含真实用户 PII 的数据。对敏感字段使用脱敏视图或只授权访问汇总数据。

**Q: 如何防止 Claude 意外修改数据？**
A: 最有效的方法是使用只读数据库用户。即使 Claude 生成了 UPDATE/DELETE 语句，数据库也会拒绝执行。

**Q: 数据量很大时查询很慢怎么办？**
A: 在 DSN 中加入 `statement_timeout`（PostgreSQL）限制查询时间，或在 CLAUDE.md 中要求 Claude 默认加 LIMIT 限制结果条数。

---

**下一章：** [自建 MCP Server](./14-custom-mcp.md)
