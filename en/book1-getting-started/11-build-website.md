# Building a Simple Website

> Verified on 2026-10-04 with Claude Code 2.1.289.

## What we are building

This chapter is a complete walkthrough. You will build a personal portfolio website from scratch, using only Claude Code and a browser. You do not need to know HTML, CSS or JavaScript. Your job is to describe what you want and to look at the result.

By the end you will have a multi-page site, with your own content and colors, that works on a phone, is saved in git, and (optionally) is online at a shareable address.

The skill this chapter practices is the loop that every Claude Code project uses: **describe, look, give feedback, repeat.** Looking is the step people skip, so this chapter spends time on the different ways you can see what Claude built.

## Before you start

You need:

1. Claude Code installed ([Installation](/en/book1-getting-started/04-installation)).
2. A terminal.
3. Git (`git --version` should print a version).
4. For the optional last step, a free GitHub account.

## Step 1: Create a folder and start Claude Code

```bash
mkdir my-portfolio
cd my-portfolio
git init
claude
```

## Step 2: Ask for the structure

Be concrete about pages, content and style:

```text
I want to build a personal portfolio website with:
- A home page with my name, a short intro and a photo placeholder
- An About page with more detail about my background
- A Projects page showing 3 example projects
- A Contact page with a simple contact form

Create the file structure and a home page to start.
Use clean, modern styling with a dark navy color scheme.
```

Claude proposes several files. Expect something like `index.html`, `about.html`, `projects.html`, `contact.html` and `styles.css`. Review them as described in the [editing chapter](/en/book1-getting-started/08-editing-files) and approve.

## Step 3: See it

There are four ways to look at what Claude built. Use whichever matches your setup, and mix them.

**Open the file in your browser.** The simplest way: "Open index.html in my browser." On a Mac Claude can run `open index.html`. On Windows you can double-click the file. A plain HTML file needs no server.

**Use the Browser pane in the Claude desktop app.** If you use the Code tab of the Claude desktop app, Claude can start a dev server and open it in a built-in Browser pane next to the conversation. According to the docs, Claude takes screenshots, inspects the page, clicks elements and fills forms to verify its own changes, and it does this after every edit by default ("auto-verify"). The Browser pane can also open static HTML files from your project, so you can click an `.html` path in the chat. Press Cmd+Shift+B (macOS) or Ctrl+Shift+B (Windows) to open the Browser. It is a separate browser profile with none of your saved logins. The Browser pane arrived in the desktop app in July 2026, and it is not part of the terminal version.

**Ask for a screenshot.** Whatever surface you use, you can ask Claude to check how the page looks and report back with evidence. In the desktop app that uses the Browser pane. In the terminal, ask Claude to use whatever it has available (for example the Claude in Chrome extension if you have it connected), and be skeptical if it only reasons about the code without looking at the page. The next chapter, [Check the Work](/en/book1-getting-started/12-check-the-work), is about making that demand habitual.

**Publish it as an artifact.** If you are signed in with `/login` on a Pro, Max, Team or Enterprise plan, you can ask Claude for an *artifact*: a live page published to a private link on claude.ai that updates in place as the session works. You can share it from the page header. Artifacts are a good fit for a design preview you want a friend to see, but they are one self-contained page, not a multi-page site, so they are not a place to host the portfolio itself. For example:

```text
Make an artifact that shows the home page of my portfolio as a single page, so I can send the link to a friend for feedback.
```

Artifacts are not available on Amazon Bedrock, Google Cloud's Agent Platform or Microsoft Foundry, or when you use an API key instead of a claude.ai login. If Claude answers that it cannot publish, that is usually why.

## Step 3b (optional): Explore the design first with `/design`

If you would rather choose a look before building, Claude Code has a `/design` command, introduced as a research preview in August 2026. It drafts the design as artboards on one canvas and publishes it as a Claude Design artifact:

```text
/design a personal portfolio site for a graphic designer: home, projects grid, contact
```

Open the published link in a desktop browser to review the artboards. Select an element to change it; edits save automatically, and you can export each artboard as PNG or PDF. When you like one, tell Claude to build that one as real files. Requirements, from the docs: Claude Code v2.1.265 or later, a session where artifacts are available, and (on Enterprise plans) the Design template turned on by an Owner. Since it is a preview, behavior may change.

If `/design` is missing or does not draft designs, you can skip it; the chapter works without it.

## Step 4: Personalize the content

```text
Update the home page with my real information:
- Name: Alex Rivera
- Title: Graphic Designer and Illustrator
- Intro: "Hi, I'm Alex. I create visual identities and illustrations that bring brands to life. Based in Austin, Texas."
- Change the color scheme from navy to warm terra cotta on a cream background
```

Review, approve, then look again. If something is wrong, describe it the way you would to a human designer:

```text
The heading is too large on mobile. Reduce it.
```

```text
The navigation links are too close together. Add spacing.
```

If you cannot describe it in words, take a screenshot and paste it into the prompt (`Ctrl+V` in the terminal; on macOS the docs list `Cmd+V` in iTerm2) or drag the image in. Then say what you want changed.

## Step 5: Fill in the Projects page

```text
Fill out the projects page with 3 portfolio pieces:
1. "Sunrise Coffee Rebrand": logo and identity for a local coffee shop. Category: Brand Identity.
2. "WildCraft Magazine": editorial illustrations for an outdoor magazine. Category: Illustration.
3. "Bloom Florist App": UI design for a flower delivery app. Category: UI Design.

For each, include a placeholder image area, the title, the category and a two-sentence description. Use a 3-column grid on desktop and one column on mobile.
```

The "placeholder image area" will be a colored box. Replace those with real images later.

## Step 6: About and Contact pages

```text
Update the About page with a longer bio, a Skills section (Brand Identity, Typography, Illustration, Figma, UI Design) and an Experience section with two previous roles.
```

```text
Style the contact form to match the site, with name, email, subject and message fields. Add my email address and placeholder links for Instagram and LinkedIn.
```

One honest limit: a form on a static website has nowhere to send its messages unless you connect it to a form service, and `mailto:` links are the simplest option. Ask Claude: "What are my options for making this form actually deliver messages?"

## Step 7: Check it on a phone-sized screen

```text
Review all four pages on a narrow screen and fix layout problems: overflowing text, images that are too wide, a navigation that breaks.
```

Then verify it yourself. In a browser, open the developer tools (F12 in most browsers) and switch on the device or responsive mode, or open the page on your phone. Or ask Claude to take a screenshot at phone width.

## Step 8: Polish

```text
Add hover effects to navigation links and project cards: links change color over 0.2 seconds, cards lift slightly with a subtle shadow.
```

```text
Add a favicon (the small icon in the browser tab): a circle with the initials "AR".
```

## Step 9: Commit

```text
Commit everything with an appropriate message
```

See the [git chapter](/en/book1-getting-started/10-git-workflows) for branches and pull requests. For a personal site, committing to a `main` branch while you learn is fine. Commit once when the site works, so you can always return to it.

## Step 10 (optional): Put it online

GitHub Pages hosts static sites for free from a repository. Ask Claude to do the git part and to explain the rest:

```text
Create a new public GitHub repository called "portfolio" and push this site to it. Then explain how to turn on GitHub Pages for it.
```

Claude can use the `gh` command-line tool if it is installed and logged in. Turning on Pages is a setting on GitHub's website; GitHub's own documentation is the reference for the current steps, and Claude can walk you through them. A few minutes later the site is usually available at an address like `https://your-username.github.io/portfolio`.

Warning before you publish anything: it will be public. Do not include a private phone number, address or anything you would not put on a business card.

## The real rhythm

Here is how the loop sounds in practice:

```text
You:    The project cards look plain. Make them more interesting.
Claude: [adds an accent border, a subtle gradient and better spacing]
You:    [looks at the page] Good, but the gradient is too faint.
Claude: [strengthens it]
You:    The contact form fonts don't match the site.
Claude: [applies the site font to the form]
```

Each round is one request, one look, one correction.

### Check that it worked

1. Open the site: every page loads, and each navigation link goes to the right page.
2. Narrow the browser window (or open it on your phone): nothing overflows, and the text is readable.
3. Run `git status`: it should say "nothing to commit, working tree clean", and `git log --oneline` shows your commit.
4. If you published: open the public address in a private browser window and confirm it loads without your logins.

## Sources

- Anthropic, "Share session output as artifacts" (availability, `/design`, page constraints), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/artifacts
- Anthropic, "Claude Code Desktop" (Browser pane, app preview, auto-verify), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/desktop
- Anthropic, "What's new" Weeks 25, 28, 34, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
- Anthropic, "Common workflows: Work with images", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/common-workflows
- GitHub, GitHub Pages documentation (for current setup steps). https://docs.github.com/en/pages
