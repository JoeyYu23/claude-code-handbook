# Who to Follow

> Written 2026-10-04. Every link below was fetched and resolved on that date.

Claude Code changes weekly, and most of what you need to know first appears in a handful of primary sources. This page lists them, then the people whose writing helps you judge what to do with the changes. It is a reading list, not a ranking. Some posts (The Pragmatic Engineer, Latent Space) are partly or fully subscriber-only. Inclusion means the person or source published something on coding agents that was worth a Claude Code user's time recently. I left out anyone whose recent writing I could not tie to coding agents.

## 1. Official sources

- **[Claude Code: What's new](https://code.claude.com/docs/en/whats-new)** is a weekly digest of notable features. Start here to learn what shipped.
- **[Claude Code changelog](https://code.claude.com/docs/en/changelog)** is the version-by-version record, including fixes. Use it when a behavior changed and you need to know when. The same history is in the [GitHub repository](https://github.com/anthropics/claude-code).
- **[Anthropic newsroom](https://www.anthropic.com/news)** carries model launches and company announcements.
- **[Anthropic engineering blog](https://www.anthropic.com/engineering)** is the best primary source on how the harness is built. Useful posts include [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) and [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude) (May 2026). Its posts are infrequent. The newest dated post on the page when I checked was April 2026, apart from a featured May post.
- **[Claude blog](https://claude.com/blog)** covers product announcements and how-tos, for example [Customize Claude Code with mods in TypeScript](https://claude.com/blog/claude-code-mods).
- **[Claude Platform release notes](https://platform.claude.com/docs/en/release-notes/overview)** list API and model changes. Read them if you build on the API or Agent SDK.

## 2. Claude Code team and Anthropic people

Anthropic staff mostly speak through the official channels above. These are the individual voices with a verifiable written or recorded trail.

- **Boris Cherny**, who created Claude Code. He has no blog of his own that I could confirm. Read the [Platformer interview](https://www.platformer.news/boris-cherny-interview-ai-jobs/) (26 May 2026) on how the engineer's job is changing, and John Gruber's [note on his YC talk](https://daringfireball.net/linked/2026/08/02/cherny-claude-swift) (August 2026), which describes having Claude Code rewrite the Claude app and verify the result itself.
- **Cat Wu**, head of product for Claude Code. Her post [Product management on the AI exponential](https://claude.com/blog/product-management-on-the-ai-exponential) (March 2026) explains how to plan roadmaps when model capability keeps moving.
- **Erik Schluntz and Barry Zhang** co-wrote [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (December 2024). Anthropic has added a note that much of its tooling description has changed since, so read it for the patterns, not the tool list.

## 3. Independent practitioners and writers

- **Simon Willison**, [simonwillison.net](https://simonwillison.net). The most consistent daily record of what models and agents can do. Recent: [2026 in LLMs (so far)](https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/) and [We're going to need default hard budget caps on pretty much everything](https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/), which bears directly on agent cost control.
- **Addy Osmani**, [Elevate newsletter](https://addyo.substack.com). Writes about keeping human judgment in an agent workflow. Recent: [The Code Nobody Reads](https://addyo.substack.com/p/the-code-nobody-reads) and [Mastery Still Comes From Doing the Reps](https://addyo.substack.com/p/agentic-skill-decay).
- **Gergely Orosz**, [The Pragmatic Engineer](https://newsletter.pragmaticengineer.com/archive). Reports on how real engineering orgs work with agents. Recent: [Inside OpenAI's agentic software factory](https://newsletter.pragmaticengineer.com/p/openai-software-factory) and [What is happening with code reviews?](https://newsletter.pragmaticengineer.com/p/what-is-happening-with-code-reviews).
- **Kieran Klaassen**, [Source Code at Every](https://every.to/source-code). Practical "compound engineering" workflow for coding agents, including [To Read—Or Not to Read the Code?](https://every.to/source-code/to-read-or-not-to-read-the-code).
- **Geoffrey Huntley**, [ghuntley.com](https://ghuntley.com). Opinionated essays on agent-driven development, such as [software doesn't need to be readable anymore. it needs to be explainable.](https://ghuntley.com/readable/)
- **Steve Yegge**, [yegge.ai](https://yegge.ai/essays/fences-not-sandboxes/). Argues for governing many autonomous agents with rules rather than containment alone in [Fences, not Sandboxes](https://yegge.ai/essays/fences-not-sandboxes/).
- **Armin Ronacher**, [lucumr.pocoo.org](https://lucumr.pocoo.org). Long-form reflections on working with agents. Browse the index for current posts.
- **Ethan Mollick**, [One Useful Thing](https://www.oneusefulthing.org). Useful for the non-programmer's view of what agents can do at work.

## 4. Tool and harness builders

People who build the tools around or beside Claude Code often explain the design trade-offs best.

- **Jesse Vincent**, [blog.fsck.com](https://blog.fsck.com). Maintains [Superpowers](https://github.com/obra/superpowers), a skills framework and methodology for coding agents. See [Superpowers 6.4](https://blog.fsck.com/2026/09/21/superpowers-6.4/).
- **Dex Horthy and HumanLayer**, [humanlayer.dev/blog](https://www.humanlayer.dev/blog). Context engineering and agent skills, e.g. [show-me](https://www.humanlayer.dev/blog/show-me-skill).
- **Thorsten Ball**, [thorstenball.com](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/). Co-founder of Amp and author of [What I believe about the future of software development](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/). Amp's own [chronicle](https://ampcode.com/chronicle) shows a competing harness's decisions.
- **Mario Zechner**, [mariozechner.at](https://mariozechner.at). Author of the Pi coding agent, a deliberately minimal harness. Pi 1.0 is covered in [Latent Space's AINews](https://www.latent.space/p/ainews-pi-10-pi-durable-and-aie-nyc).
- **LangChain**, [blog](https://www.langchain.com/blog). Harness and agent-framework engineering, written by Harrison Chase and colleagues.

## 5. Researchers and educators

- **Lilian Weng**, [Lil'Log](https://lilianweng.github.io). [Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/) (July 2026) is a clear map of what a harness is.
- **Hamel Husain**, [hamel.dev](https://hamel.dev). The practical voice on evals. Recent: [Claude's new auto eval tool](https://hamel.dev/blog/posts/claude-auto-evals/index.html).
- **Eugene Yan**, [eugeneyan.com](https://eugeneyan.com/writing/working-with-ai/). [How to Work and Compound with AI](https://eugeneyan.com/writing/working-with-ai/) treats verification as the way to earn autonomy.
- **Andrew Ng**, [The Batch](https://www.deeplearning.ai/the-batch/issue-372). Weekly letter that regularly covers coding agents; see issue 372 for evals and feedback in new versus mature projects.
- **Swyx**, [Latent Space](https://www.latent.space). Podcast and daily AI news digest for AI engineers.

## Keep up without drowning

You do not need all of this. Pick three to five:

1. **What's new** for Claude Code changes, read weekly. Skim the changelog only when something breaks.
2. **The Anthropic engineering blog**, for the few posts a year that explain why the harness works as it does.
3. **One daily or weekly generalist**, such as Simon Willison or Latent Space, to see what else changed.
4. **One voice that disagrees with your habits**, for example Addy Osmani on keeping judgment, or Steve Yegge on running many agents.
5. **One source close to your own stack**, such as Hamel Husain if you write evals.

Read the primary source before the thread about it. A release note, a changelog entry or the author's own post tells you what changed. Commentary tells you what someone thinks about it, and arrives later and louder. When a post claims a new feature or flag, check it against the docs or `claude --help` before you change your setup.

## Sources

All fetched 2026-10-04.

- Claude Code Docs, "What's new" and "Claude Code changelog", Anthropic. https://code.claude.com/docs/en/whats-new ; https://code.claude.com/docs/en/changelog
- Anthropic, Newsroom and Engineering index. https://www.anthropic.com/news ; https://www.anthropic.com/engineering
- Anthropic, "How we contain Claude across products", 2026-05-25. https://www.anthropic.com/engineering/how-we-contain-claude
- Anthropic, "Building effective agents", 2024-12-19. https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, "Product management on the AI exponential", 2026-03-19. https://claude.com/blog/product-management-on-the-ai-exponential
- Platformer, Boris Cherny interview, 2026-05-26. https://www.platformer.news/boris-cherny-interview-ai-jobs/
- Daring Fireball, "Boris Cherny on Trying to Get Claude Code to Rewrite the Claude App", 2026-08-02. https://daringfireball.net/linked/2026/08/02/cherny-claude-swift
- Simon Willison, 2026-09-27 and 2026-10-03 posts (URLs above).
- Lilian Weng, "Harness Engineering for Self-Improvement", 2026-07-04 (URL above).
- Remaining links are the authors' own sites, each loaded on 2026-10-04.
