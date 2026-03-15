# Chapter 12: Browser MCP

## What Browser MCP Actually Is

Web development has a debugging problem. Your application lives in a browser. Your AI assistant lives in a terminal. Every time you want Claude to check how something renders, you have to copy screenshots manually, describe layout issues in words, or write elaborate descriptions of what the DOM looks like. Browser MCP closes that gap.

Browser MCP connects Claude Code directly to a real browser instance — usually via Playwright or a Chrome DevTools Protocol (CDP) bridge — so Claude can navigate pages, inspect elements, fill forms, take screenshots, run accessibility audits, and even execute JavaScript in the browser console. Claude can see your application the same way your users do.

This chapter covers the two most common browser MCP setups: the official Playwright MCP server and the Chrome DevTools-based approach. Both give Claude the ability to control a browser programmatically, but they differ in what they expose.

---

## Installing the Playwright MCP Server

The Playwright MCP server is the recommended starting point. It provides a well-maintained set of browser control tools and works on all platforms.

```bash
# Install the Playwright MCP server
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```

After adding it, verify it appears in your MCP list:

```bash
claude mcp list
# playwright    stdio    npx -y @playwright/mcp@latest
```

From within a Claude Code session, check that the tools are available:

```text
/mcp
# Should show playwright server with tools like: navigate, screenshot, click, fill, etc.
```

For projects where you want the browser MCP shared with your team, add it with project scope so it lands in `.mcp.json`:

```bash
claude mcp add --transport stdio --scope project playwright -- npx -y @playwright/mcp@latest
```

Commit `.mcp.json` and every team member gets the browser tools automatically.

---

## Navigating Pages

Once the Playwright MCP is connected, Claude can navigate the web as part of any task:

```text
Navigate to http://localhost:3000 and tell me what errors appear in the console.
```

```text
Go to https://staging.example.com/checkout and describe the current state
of the page. Take a screenshot.
```

Claude will use the `navigate` tool, then inspect the page state and take a screenshot. You can chain these naturally:

```text
Navigate to the login page at http://localhost:3000/login.
Fill in the email field with "testuser@example.com" and password "test123".
Click the submit button. Tell me what happens next.
```

This is dramatically faster than manually testing a flow and then describing the result to Claude.

---

## Taking and Analyzing Screenshots

Screenshots are one of the highest-leverage tools in browser MCP. Claude can take a screenshot and immediately reason about the visual result — spotting misalignments, broken layouts, missing elements, and rendering issues without you having to describe them.

```text
Take a screenshot of the dashboard at http://localhost:3000/dashboard.
Point out any layout issues or elements that look broken.
```

For visual regression during development:

```text
I am implementing the design from @designs/dashboard-v2.png.
Navigate to http://localhost:3000/dashboard and take a screenshot.
Compare the current state to the design and list the differences,
ordered by visual impact.
```

Claude will describe differences systematically: padding discrepancies, missing components, color mismatches, font size differences. This tight loop between implementation and visual verification speeds up front-end development substantially.

---

## Filling Forms and Clicking Elements

Form testing and interaction flows are where browser MCP saves the most time. You can ask Claude to walk through entire user journeys:

```text
Complete the user registration flow at http://localhost:3000/signup:
- First name: "Alex"
- Last name: "Rivera"
- Email: "alex.rivera@testdomain.com"
- Password: "SecurePass123"
- Accept the terms checkbox
- Click "Create Account"

Take a screenshot after each major step and report any errors.
```

Claude handles the form interaction step by step, reporting what it sees at each stage. If a field fails validation, Claude sees the error message and can diagnose the issue.

For more complex interactions:

```text
In the product configurator at http://localhost:3000/configure:
1. Select "Enterprise" plan
2. Set seat count to 25
3. Enable the "Advanced Analytics" add-on
4. Proceed to the pricing summary
5. Take a screenshot of the final price

If any step fails, describe the error.
```

---

## Running Lighthouse Audits

Playwright MCP can invoke Lighthouse directly for performance, accessibility, and SEO auditing:

```text
Run a Lighthouse audit on http://localhost:3000 and summarize the scores
for Performance, Accessibility, Best Practices, and SEO.
Highlight the top 3 issues to fix first.
```

For accessibility-focused development, target the accessibility audit specifically:

```text
Run a Lighthouse accessibility audit on http://localhost:3000/checkout.
List all failing rules, sorted by impact. For each failure, suggest
the specific HTML or CSS change needed to fix it.
```

You can also ask Claude to audit multiple pages and compare results:

```text
Run Lighthouse audits on these three pages and give me a comparison table:
- http://localhost:3000/ (homepage)
- http://localhost:3000/pricing
- http://localhost:3000/dashboard

Focus on Performance and Accessibility scores.
```

---

## E2E Testing with Browser MCP

One of the most powerful applications is using browser MCP to help write and debug end-to-end tests.

First, have Claude watch a flow and describe it in testable terms:

```text
Navigate to http://localhost:3000 and walk through the checkout flow
using test card 4242424242424242, exp 12/28, CVC 123.
As you do each step, describe it in terms of Playwright locators
and assertions I could use in a test.
```

Claude will produce something like:

```text
Step 1: Click the cart icon
  Locator: page.getByTestId('cart-icon')

Step 2: Click "Proceed to Checkout"
  Locator: page.getByRole('button', { name: 'Proceed to Checkout' })

Step 3: Fill shipping form
  await page.getByLabel('First Name').fill('Test')
  await page.getByLabel('Last Name').fill('User')
  ...
```

Then ask Claude to turn this into a full test:

```text
Write a Playwright test file at tests/e2e/checkout.spec.ts
that covers the full checkout flow we just walked through.
Use the page object model pattern. Include assertions for
the order confirmation page.
```

For debugging failing E2E tests, browser MCP is invaluable:

```text
The test in tests/e2e/checkout.spec.ts is failing at the payment step.
Navigate to http://localhost:3000 manually and try to reproduce the
checkout flow. Take screenshots at each step and identify where
the test expectation diverges from actual behavior.
```

---

## Practical Development Workflows

**Responsive design verification:**
```text
Take screenshots of http://localhost:3000/pricing at these viewport sizes:
- 375px wide (iPhone SE)
- 768px wide (iPad)
- 1280px wide (laptop)
- 1920px wide (desktop)

Identify any layout breakages or elements that overflow their containers.
```

**Console error monitoring:**
```text
Navigate to http://localhost:3000/dashboard with the browser console open.
Click through the main navigation links. Report any JavaScript errors
or network failures that appear in the console.
```

**Accessibility walk-through:**
```text
Navigate to http://localhost:3000 and check the page using keyboard
navigation only (Tab, Enter, Arrow keys). Can all interactive elements
be reached? Does focus indicator appear on each element?
Report any accessibility gaps.
```

---

## Security Considerations

Browser MCP gives Claude the ability to interact with any URL the browser can reach — including authenticated sessions, internal tools, and local services. A few precautions are worth enforcing:

Use local scope for browser MCP on projects that access sensitive internal tools — do not check credentials or internal URLs into `.mcp.json`:

```bash
# Keep sensitive browser MCP configurations local-only
claude mcp add --transport stdio --scope local internal-browser -- npx -y @playwright/mcp@latest
```

Be cautious about asking Claude to navigate to pages with user data in production environments. Browser MCP sessions can inadvertently expose session tokens in screenshots or command outputs.

For CI environments, run the Playwright MCP with a dedicated test user and never with production credentials.

---

**Next up:** [Chapter 13 — Database MCP](./13-database-mcp.md) — Direct database access from Claude Code.
