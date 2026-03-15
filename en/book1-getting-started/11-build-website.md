# Chapter 11: Building a Simple Website — Hands-On Tutorial

## What We Are Building

This chapter is a complete walkthrough. You will build a personal portfolio website from scratch using only Claude Code — no prior web development experience required.

By the end, you will have:
- A real website with multiple pages
- Your own styling and content
- A responsive design that works on mobile
- A live URL you can share (via GitHub Pages)

We will build it step by step, with the full conversation shown so you can see exactly how to interact with Claude Code. You can follow along directly, substituting your own name and content.

---

## Before You Start

Make sure you have:
1. Claude Code installed (see Chapter 4)
2. A terminal open
3. Git installed (`git --version` to check)
4. A GitHub account (free at github.com)

You do not need to know HTML, CSS, or JavaScript. Claude will handle the code. Your job is to describe what you want.

---

## Step 1: Create a Folder and Start Claude Code

Open your terminal and run:

```bash
mkdir my-portfolio
cd my-portfolio
git init
claude
```

The last command starts Claude Code. You will see the prompt waiting for your first message.

---

## Step 2: Ask for the Basic Structure

Type this first message:

```
I want to build a personal portfolio website. It should have:
- A home page with my name, a brief intro, and a photo placeholder
- An "About Me" page with more detail about my background
- A "Projects" page showing 3 example projects
- A "Contact" page with a simple contact form

Please create the basic file structure and a home page to start.
Use clean, modern styling with a dark navy color scheme.
```

Claude will propose creating several files. The first will be `index.html` for the home page. Review what it shows and press `y` to approve each file.

You should end up with:
- `index.html` — the home page
- `about.html` — the about page skeleton
- `projects.html` — the projects page skeleton
- `contact.html` — the contact page skeleton
- `styles.css` — shared styles for all pages

---

## Step 3: Open It in Your Browser

Once the files are created, open the home page:

```
Open index.html in my browser
```

On Mac, Claude will run `open index.html`. On Windows, it will suggest you double-click the file. Take a look at what was generated.

You will have a functional, styled page with navigation links, a placeholder for your photo, and some default text. Now you start customizing.

---

## Step 4: Personalize the Content

Tell Claude about yourself:

```
Update the home page with my actual information:
- Name: Alex Rivera
- Title: Graphic Designer and Illustrator
- Intro: "Hi, I'm Alex. I create visual identities and illustrations that
  bring brands to life. Based in Austin, Texas."
- Change the color scheme from navy to a warm terra cotta with cream
  background
```

Claude will edit `index.html` and `styles.css` to reflect your content and updated colors. Review and approve each change.

If something looks wrong visually, just describe it:

```
The heading font is too large on mobile — can you reduce it?
```

```
The navigation links are too close together. Add more spacing.
```

Keep giving feedback until it looks right to you.

---

## Step 5: Build Out the Projects Page

Now let's give the projects page real content:

```
Fill out the projects page with 3 portfolio pieces:

1. "Sunrise Coffee Rebrand" — logo and identity system for a local
   coffee shop. Category: Brand Identity.

2. "WildCraft Magazine" — editorial illustrations for an outdoor
   lifestyle publication. Category: Illustration.

3. "Bloom Florist App" — UI design and illustration for a flower
   delivery app. Category: UI Design.

For each project, include a placeholder image area, the title,
category, and a brief 2-sentence description. Make the layout
a 3-column grid on desktop, single column on mobile.
```

Claude will update `projects.html` with this content and apply responsive grid styling. The "placeholder image area" will be a colored rectangle — you can replace these with real screenshots later.

---

## Step 6: Complete the About and Contact Pages

```
Update the about page with:
- A longer bio: "Alex Rivera is a graphic designer and illustrator
  with 5 years of experience working with small businesses and
  startups. She studied Visual Communication at UT Austin and has
  worked with clients across food, fitness, and tech industries."
- A "Skills" section listing: Brand Identity, Typography,
  Illustration, Figma, Adobe Suite, UI Design
- An "Experience" timeline with 2 previous roles
```

For the contact page:

```
Make the contact form functional with fields for: name, email,
subject, and message. Style it to match the rest of the site.
Add my email address "alex@example.com" and links to Instagram
and LinkedIn (use placeholder # links for now).
```

---

## Step 7: Make It Responsive

A responsive website looks good on phones, tablets, and desktops. Ask Claude to check and improve this:

```
Review the site for responsiveness. Check all four pages on a
narrow screen and fix any layout issues — text that overflows,
images that are too wide, navigation that breaks, etc.
```

Claude will read through the CSS and HTML, identify potential responsiveness issues, and propose fixes. It might add media queries (CSS rules that apply only at certain screen sizes) or restructure the layout of specific elements.

To actually test on mobile, you can open Chrome's developer tools (F12) and toggle the device simulation mode. Or just grab your phone and open the file if it is on a shared network.

---

## Step 8: Add Some Polish

Small details elevate a portfolio significantly:

```
Add smooth hover effects to the navigation links and project cards.
When hovering, the links should change color with a 0.2 second
transition, and project cards should lift slightly with a subtle shadow.
```

```
Add a favicon — a small icon that appears in the browser tab.
Use a simple circle with my initials "AR" in it.
```

```
Make the page transitions smooth by adding a subtle fade-in when
each page loads.
```

Each of these is a small change that makes the site feel more polished and professional.

---

## Step 9: Commit Your Work

Before deploying, save everything in git:

```
Commit everything I have built today with an appropriate message
```

Claude will stage all files and create a commit. Then:

```
Show me all the files in the project and confirm git is tracking everything
```

---

## Step 10: Deploy to GitHub Pages

GitHub Pages hosts static websites for free directly from a GitHub repository. Let's get your site live.

First, you need a GitHub repository. If you have the `gh` CLI installed:

```
Create a new GitHub repository called "portfolio" and push my site to it
```

Claude will create the repository, add the remote, and push your code.

If you do not have `gh` installed, you can:
1. Go to github.com and create a new repository called "portfolio"
2. Come back to Claude: "I created a repo at github.com/your-username/portfolio. Push my code there."

Once the code is on GitHub:

```
Set up GitHub Pages to host this site from the main branch
```

Claude will walk you through (or execute) the GitHub Pages setup. Within a few minutes, your site will be live at `https://your-username.github.io/portfolio`.

---

## Conversation Walkthrough: The Real Back-and-Forth

Here is how an actual exchange might look during the styling phase:

```
Me: The project cards look too plain. Can you add something to make
them more visually interesting?

Claude: I'll enhance the project cards. I'll add:
- A colored top border that uses your terra cotta accent color
- A subtle gradient background instead of flat white
- Better spacing between elements

Editing projects.html:
[shows diff]
Allow edit? y

Editing styles.css:
[shows diff with new CSS for card styling]
Allow edit? y

The cards now have more visual hierarchy. Take a look and let me
know if you want to adjust the colors or proportions.

Me: I like it but the gradient is too subtle — can you make it
slightly stronger?

Claude: I'll increase the gradient contrast.

Editing styles.css:
[shows diff — changes gradient from 5% opacity to 12%]
Allow edit? y

Done. The gradient is more visible now. Does that feel right?

Me: Perfect. Now the contact form looks different from the rest of
the site — the fonts don't match.

Claude: Good catch. The form is using the browser default font
instead of your site font. Let me fix that.

Editing styles.css:
[shows diff adding font-family to form elements]
Allow edit? y

Updated. The form now uses the same typography as the rest of your site.
```

This back-and-forth — Claude makes a change, you look at it, you give specific feedback, Claude adjusts — is the natural rhythm of using Claude Code for design work.

---

## What You Have Learned

By building this portfolio, you have practiced:
- Creating a project structure from scratch
- Iterating on design through conversation
- Giving feedback that Claude can act on
- Using git to save your progress
- Deploying a real website

These are the same skills you will use for every future project — the specific technology changes but the workflow stays the same. Describe what you want, review what Claude produces, give feedback, repeat.

Your portfolio now exists. Keep going: add your real projects, upload your real photo, write your real bio. The structure is done — the content is yours.

---

**Next up:** [Chapter 12 — Debugging Like a Pro](./12-debugging.md) — How to use Claude to diagnose and fix errors, read stack traces, and get unstuck.
