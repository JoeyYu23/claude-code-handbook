import { defineConfig } from 'vitepress'

// Book 1 EN sidebar
const book1En = [
  {
    text: 'Book 1: Getting Started',
    items: [
      { text: 'Overview', link: '/en/book1-getting-started/' },
    ]
  },
  {
    text: 'Part I: What & Why',
    items: [
      { text: '1. What is Claude Code?', link: '/en/book1-getting-started/01-what-is-claude-code' },
      { text: '2. Why Claude Code?', link: '/en/book1-getting-started/02-why-claude-code' },
      { text: '3. How It Works', link: '/en/book1-getting-started/03-how-it-works' },
    ]
  },
  {
    text: 'Part II: Setup',
    items: [
      { text: '4. Installation', link: '/en/book1-getting-started/04-installation' },
      { text: '5. Your First Conversation', link: '/en/book1-getting-started/05-first-conversation' },
      { text: '6. Permission Modes', link: '/en/book1-getting-started/06-permission-modes' },
    ]
  },
  {
    text: 'Part III: Daily Workflows',
    items: [
      { text: '7. Reading & Understanding Code', link: '/en/book1-getting-started/07-reading-code' },
      { text: '8. Editing Files', link: '/en/book1-getting-started/08-editing-files' },
      { text: '9. Running Commands', link: '/en/book1-getting-started/09-running-commands' },
      { text: '10. Git Workflows', link: '/en/book1-getting-started/10-git-workflows' },
    ]
  },
  {
    text: 'Part IV: Your First Project',
    items: [
      { text: '11. Building a Simple Website', link: '/en/book1-getting-started/11-build-website' },
      { text: '12. Debugging Like a Pro', link: '/en/book1-getting-started/12-debugging' },
      { text: '13. Working with APIs', link: '/en/book1-getting-started/13-working-with-apis' },
    ]
  },
  {
    text: 'Part V: Customization Basics',
    items: [
      { text: '14. CLAUDE.md', link: '/en/book1-getting-started/14-claude-md' },
      { text: '15. Memory System', link: '/en/book1-getting-started/15-memory' },
      { text: '16. IDE Integration', link: '/en/book1-getting-started/16-ide-integration' },
    ]
  },
  {
    text: 'Appendix',
    collapsed: true,
    items: [
      { text: 'Glossary', link: '/en/book1-getting-started/glossary' },
      { text: 'Troubleshooting', link: '/en/book1-getting-started/troubleshooting' },
      { text: 'Keyboard Shortcuts', link: '/en/book1-getting-started/keyboard-shortcuts' },
    ]
  },
]

// Book 2 EN sidebar
const book2En = [
  {
    text: 'Book 2: Advanced Patterns',
    items: [
      { text: 'Overview', link: '/en/book2-advanced/' },
    ]
  },
  {
    text: 'Part I: The Skill System',
    items: [
      { text: '1. Built-in Slash Commands', link: '/en/book2-advanced/01-slash-commands' },
      { text: '2. Custom Skills', link: '/en/book2-advanced/02-custom-skills' },
      { text: '3. Skill Composition', link: '/en/book2-advanced/03-skill-composition' },
    ]
  },
  {
    text: 'Part II: The Agent System',
    items: [
      { text: '4. Sub-agents Explained', link: '/en/book2-advanced/04-subagents' },
      { text: '5. Agent Types Catalog', link: '/en/book2-advanced/05-agent-catalog' },
      { text: '6. Parallel Agent Orchestration', link: '/en/book2-advanced/06-parallel-agents' },
      { text: '7. Large Project Patterns', link: '/en/book2-advanced/07-large-projects' },
    ]
  },
  {
    text: 'Part III: Hooks & Automation',
    items: [
      { text: '8. Hook System Deep Dive', link: '/en/book2-advanced/08-hooks' },
      { text: '9. Automated Workflows', link: '/en/book2-advanced/09-automated-workflows' },
      { text: '10. Custom Tool Creation', link: '/en/book2-advanced/10-custom-tools' },
    ]
  },
  {
    text: 'Part IV: MCP Protocol',
    items: [
      { text: '11. MCP Fundamentals', link: '/en/book2-advanced/11-mcp-basics' },
      { text: '12. Browser MCP', link: '/en/book2-advanced/12-browser-mcp' },
      { text: '13. Database MCP', link: '/en/book2-advanced/13-database-mcp' },
      { text: '14. Building Custom MCP Servers', link: '/en/book2-advanced/14-custom-mcp' },
    ]
  },
  {
    text: 'Part V: Context & Performance',
    items: [
      { text: '15. Context Window Management', link: '/en/book2-advanced/15-context-management' },
      { text: '16. Token Optimization', link: '/en/book2-advanced/16-token-optimization' },
      { text: '17. Memory Architecture', link: '/en/book2-advanced/17-memory-architecture' },
      { text: '18. Multi-session Workflows', link: '/en/book2-advanced/18-multi-session' },
    ]
  },
  {
    text: 'Part VI: Real-World Patterns',
    items: [
      { text: '19. CLAUDE.md Best Practices', link: '/en/book2-advanced/19-claude-md-patterns' },
      { text: '20. Team Workflows', link: '/en/book2-advanced/20-team-workflows' },
      { text: '21. Remote Connection', link: '/en/book2-advanced/21-remote-connection' },
      { text: '22. Security & Privacy', link: '/en/book2-advanced/22-security' },
      { text: '23. Cost Reality', link: '/en/book2-advanced/23-cost-reality' },
    ]
  },
  {
    text: 'Appendix',
    collapsed: true,
    items: [
      { text: 'Agent Type Reference', link: '/en/book2-advanced/agent-reference' },
      { text: 'MCP Server Registry', link: '/en/book2-advanced/mcp-registry' },
      { text: 'Performance Benchmarks', link: '/en/book2-advanced/benchmarks' },
      { text: 'Migration Guide', link: '/en/book2-advanced/migration-guide' },
    ]
  },
]

// Book 1 ZH sidebar
const book1Zh = [
  {
    text: 'Book 1: 入门指南',
    items: [
      { text: '目录', link: '/zh/book1-getting-started/' },
    ]
  },
  {
    text: 'Part I: 认识 Claude Code',
    items: [
      { text: '1. 什么是 Claude Code？', link: '/zh/book1-getting-started/01-what-is-claude-code' },
      { text: '2. 为什么选 Claude Code？', link: '/zh/book1-getting-started/02-why-claude-code' },
      { text: '3. 工作原理', link: '/zh/book1-getting-started/03-how-it-works' },
    ]
  },
  {
    text: 'Part II: 安装与配置',
    items: [
      { text: '4. 安装教程', link: '/zh/book1-getting-started/04-installation' },
      { text: '5. 第一次对话', link: '/zh/book1-getting-started/05-first-conversation' },
      { text: '6. 权限模式', link: '/zh/book1-getting-started/06-permission-modes' },
    ]
  },
  {
    text: 'Part III: 日常工作流',
    items: [
      { text: '7. 读代码', link: '/zh/book1-getting-started/07-reading-code' },
      { text: '8. 改文件', link: '/zh/book1-getting-started/08-editing-files' },
      { text: '9. 跑命令', link: '/zh/book1-getting-started/09-running-commands' },
      { text: '10. Git 工作流', link: '/zh/book1-getting-started/10-git-workflows' },
    ]
  },
  {
    text: 'Part IV: 实战项目',
    items: [
      { text: '11. 从零搭一个网站', link: '/zh/book1-getting-started/11-build-website' },
      { text: '12. Debug 技巧', link: '/zh/book1-getting-started/12-debugging' },
      { text: '13. 对接 API', link: '/zh/book1-getting-started/13-working-with-apis' },
    ]
  },
  {
    text: 'Part V: 个性化配置',
    items: [
      { text: '14. CLAUDE.md', link: '/zh/book1-getting-started/14-claude-md' },
      { text: '15. Memory 系统', link: '/zh/book1-getting-started/15-memory' },
      { text: '16. IDE 集成', link: '/zh/book1-getting-started/16-ide-integration' },
    ]
  },
  {
    text: '附录',
    collapsed: true,
    items: [
      { text: '术语表', link: '/zh/book1-getting-started/glossary' },
      { text: '常见问题', link: '/zh/book1-getting-started/troubleshooting' },
      { text: '快捷键', link: '/zh/book1-getting-started/keyboard-shortcuts' },
    ]
  },
]

// Book 2 ZH sidebar
const book2Zh = [
  {
    text: 'Book 2: 进阶指南',
    items: [
      { text: '目录', link: '/zh/book2-advanced/' },
    ]
  },
  {
    text: 'Part I: Skill 系统',
    items: [
      { text: '1. 内置 Slash Commands', link: '/zh/book2-advanced/01-slash-commands' },
      { text: '2. 自定义 Skills', link: '/zh/book2-advanced/02-custom-skills' },
      { text: '3. Skill 组合', link: '/zh/book2-advanced/03-skill-composition' },
    ]
  },
  {
    text: 'Part II: Agent 系统',
    items: [
      { text: '4. Sub-agents 详解', link: '/zh/book2-advanced/04-subagents' },
      { text: '5. Agent 类型大全', link: '/zh/book2-advanced/05-agent-catalog' },
      { text: '6. 并行 Agent 编排', link: '/zh/book2-advanced/06-parallel-agents' },
      { text: '7. 大项目模式', link: '/zh/book2-advanced/07-large-projects' },
    ]
  },
  {
    text: 'Part III: Hooks 与自动化',
    items: [
      { text: '8. Hook 系统深入', link: '/zh/book2-advanced/08-hooks' },
      { text: '9. 自动化工作流', link: '/zh/book2-advanced/09-automated-workflows' },
      { text: '10. 自定义工具', link: '/zh/book2-advanced/10-custom-tools' },
    ]
  },
  {
    text: 'Part IV: MCP 协议',
    items: [
      { text: '11. MCP 基础', link: '/zh/book2-advanced/11-mcp-basics' },
      { text: '12. 浏览器 MCP', link: '/zh/book2-advanced/12-browser-mcp' },
      { text: '13. 数据库 MCP', link: '/zh/book2-advanced/13-database-mcp' },
      { text: '14. 自建 MCP Server', link: '/zh/book2-advanced/14-custom-mcp' },
    ]
  },
  {
    text: 'Part V: Context 与性能',
    items: [
      { text: '15. 上下文窗口管理', link: '/zh/book2-advanced/15-context-management' },
      { text: '16. Token 优化', link: '/zh/book2-advanced/16-token-optimization' },
      { text: '17. Memory 架构', link: '/zh/book2-advanced/17-memory-architecture' },
      { text: '18. 多 Session 工作流', link: '/zh/book2-advanced/18-multi-session' },
    ]
  },
  {
    text: 'Part VI: 实战 Patterns',
    items: [
      { text: '19. CLAUDE.md 最佳实践', link: '/zh/book2-advanced/19-claude-md-patterns' },
      { text: '20. 团队协作', link: '/zh/book2-advanced/20-team-workflows' },
      { text: '21. 远程连接', link: '/zh/book2-advanced/21-remote-connection' },
      { text: '22. 安全与隐私', link: '/zh/book2-advanced/22-security' },
      { text: '23. 费用真相', link: '/zh/book2-advanced/23-cost-reality' },
    ]
  },
  {
    text: '附录',
    collapsed: true,
    items: [
      { text: 'Agent 类型速查表', link: '/zh/book2-advanced/agent-reference' },
      { text: 'MCP Server 清单', link: '/zh/book2-advanced/mcp-registry' },
      { text: '性能基准测试', link: '/zh/book2-advanced/benchmarks' },
      { text: '迁移指南', link: '/zh/book2-advanced/migration-guide' },
    ]
  },
]

export default defineConfig({
  base: '/claude-code-handbook/',

  ignoreDeadLinks: [
    /\.\/LICENSE/,
    /\.\/en\//,
    /\.\/zh\//,
  ],

  title: 'Claude Code Handbook',
  description: 'The definitive guide to Claude Code — from zero to mastery.',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#1a7f64' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Claude Code Handbook' }],
    ['meta', { property: 'og:description', content: 'The definitive guide to Claude Code — from zero to mastery.' }],
  ],

  cleanUrls: true,
  lastUpdated: true,

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'Claude Code 手册',
      description: 'Claude Code 权威指南 —— 从零到精通',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'Book 1: 入门', link: '/zh/book1-getting-started/' },
          { text: 'Book 2: 进阶', link: '/zh/book2-advanced/' },
          {
            text: '语言',
            items: [
              { text: 'English', link: '/' },
              { text: '中文', link: '/zh/' },
            ]
          }
        ],
        sidebar: {
          '/zh/book1-getting-started/': book1Zh,
          '/zh/book2-advanced/': book2Zh,
        },
        outline: {
          label: '本页目录',
          level: [2, 3],
        },
        docFooter: {
          prev: '上一章',
          next: '下一章',
        },
        lastUpdated: {
          text: '最后更新',
        },
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '深色模式',
        lightModeSwitchTitle: '切换到亮色模式',
        darkModeSwitchTitle: '切换到深色模式',
      }
    }
  },

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Claude Code Handbook' },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Book 1: Getting Started', link: '/en/book1-getting-started/' },
      { text: 'Book 2: Advanced', link: '/en/book2-advanced/' },
      {
        text: 'Language',
        items: [
          { text: 'English', link: '/' },
          { text: '中文', link: '/zh/' },
        ]
      }
    ],

    sidebar: {
      '/en/book1-getting-started/': book1En,
      '/en/book2-advanced/': book2En,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JoeyYu23/claude-code-handbook' }
    ],

    outline: {
      label: 'On this page',
      level: [2, 3],
    },

    footer: {
      message: 'Released under CC BY-SA 4.0.',
      copyright: 'Copyright 2026-present Claude Code Handbook'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                }
              }
            }
          }
        }
      }
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
})
