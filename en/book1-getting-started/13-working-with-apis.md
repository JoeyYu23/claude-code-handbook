# Working with APIs

> Verified on 2026-10-04 with Claude Code 2.1.289.

## What is an API?

API stands for Application Programming Interface. The restaurant analogy still works best: you sit at a table, read a menu, tell the waiter what you want, and food arrives. You never enter the kitchen. The menu is the agreed interface between you and the kitchen.

When your program needs weather data, a payment, a login or a map from another service, it uses that service's API: a menu of things you may ask for and the format to ask in. You do not need to know how the service works inside.

## How a call works

Your code sends an HTTP request, the same kind your browser sends to load a web page. A request has:

1. **A URL** (which "menu item").
2. **A method**: usually `GET` (read something) or `POST` (send something).
3. **Headers**: extra information, including who you are.
4. **A body**: the data you send, for `POST`.

The reply is usually *JSON*, a text format both people and programs can read:

```json
{
  "city": "Austin",
  "temperature": 78,
  "condition": "Partly Cloudy",
  "forecast": [
    {"day": "Monday", "high": 82, "low": 68},
    {"day": "Tuesday", "high": 79, "low": 65}
  ]
}
```

## Keys are secrets

Most APIs ask you to prove who you are with an **API key**, a long string that identifies your account (and often your bill). Treat it like a password:

- Do not paste it into code you share, or into a public repository.
- Keep it in an environment file, conventionally `.env`, and make sure `.env` is listed in `.gitignore` so git never saves it. Ask Claude to check: "Is `.env` in .gitignore? Confirm no key appears in any tracked file."
- If a key leaks, revoke it at the provider and create a new one. Deleting it from your code is not enough, because git remembers old versions.
- Be careful what you paste into the conversation. Anything in the chat goes to the model.

```text
WEATHER_API_KEY=your-key-here
```

One catch beginners hit: code that runs *in a web page* (browser JavaScript) is visible to every visitor, so a key placed there is not secret. That is fine for a toy project on your own computer, but for anything public, the key should live on a small server that makes the API call for the page. Ask Claude: "Where should this key live so visitors can't see it?"

## Tutorial: a weather dashboard

We will build a page that shows current weather and a forecast for any city typed in. The provider here is OpenWeatherMap, which has a free tier. Check its current documentation for endpoint details and free-tier limits, because providers change them.

### Step 1: get a key

Create a free account with the weather provider and copy your API key.

### Step 2: start the project

```bash
mkdir weather-dashboard
cd weather-dashboard
claude
```

```text
I want to build a weather dashboard using the OpenWeatherMap API. Users type a city name and see the current temperature in Fahrenheit, the conditions, humidity, and a 5-day forecast with highs and lows. Use plain HTML, CSS and JavaScript with a clean blue and white design.
```

Expect three files: `index.html`, `styles.css`, `app.js`.

### Step 3: store the key safely

```text
I have my API key. How should I store it for this project so it isn't committed to git? Set up .env and .gitignore for me, but don't write my key in any file; I'll add it myself.
```

Adding the key yourself keeps it out of the conversation.

### Step 4: connect the API

Give Claude the documentation rather than guessing:

```text
Read the OpenWeatherMap documentation for current weather and 5-day forecast at <paste the URL from their docs>, then update app.js to call them for the city typed in the input and display the results.
```

Claude can fetch web pages for documentation. If it cannot, paste the relevant part of the docs. For an API Claude does not know, a pattern from the official best-practices guide works well: "Use `foo-cli-tool --help` to learn about the tool", and its equivalent for web APIs, "read the docs at this URL".

### Step 5: handle failure

Real APIs fail: wrong city names, no internet, rate limits.

```text
What happens if someone types a city that doesn't exist, or the API is down? Add friendly error messages and a loading state.
```

### Step 6: test it

Open `index.html` in a browser, search for a city, and confirm that the numbers are plausible. If it fails, copy what is in the browser console (F12, then the Console tab) and paste it to Claude with what you typed and what happened.

## Common patterns

- **Another language.** "Show me the same call in Python." Claude knows the syntax in most languages.
- **Rate limits.** Many APIs limit requests per minute. "The API allows 60 requests a minute. Add handling that waits and retries."
- **Pagination.** Large result sets come in pages. "Add a Load More button that fetches the next page."
- **Reshaping data.** APIs return timestamps as numbers and temperatures in units you didn't ask for. "Convert this Unix timestamp to a weekday name."
- **Choosing an API.** "I want a map on my site; compare a few options that are free or cheap for a personal project." Verify prices and limits on each provider's own site.

## Connecting Claude itself to services

Everything above is about *your program* calling an API. A separate idea is letting *Claude* use outside services directly, such as GitHub, a database or a design tool. That is done with MCP servers (`claude mcp add ...`), covered in [MCP in Practice](/en/book2-advanced/12-mcp-in-practice). The CLI tools a service already provides (for example `gh` for GitHub) are often the simplest route: Anthropic's guide calls them the most context-efficient way for Claude to talk to external services.

### Check that it worked

1. Search for a city you know; compare the temperature with another weather source. It should be close.
2. Search for a nonsense city name; you should see a friendly message, not a blank page.
3. Run `git status` and `git diff --stat`; no file containing your key should appear in either. `git check-ignore .env` should print `.env`.
4. Search in the project files for the first characters of your key: nothing tracked should match.

## Sources

- Anthropic, "Best practices for Claude Code" (Use CLI tools; Provide rich content), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
- Anthropic, "Common workflows", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/common-workflows
- OpenWeatherMap, API documentation (endpoint details and limits, which change). https://openweathermap.org/api
