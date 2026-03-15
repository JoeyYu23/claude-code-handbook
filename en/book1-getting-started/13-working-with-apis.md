# Chapter 13: Working with APIs

## What Is an API?

"API" stands for Application Programming Interface. That sounds technical, but the concept is straightforward once you have the right analogy.

Think about how a restaurant works. You sit at a table, you look at a menu, you tell the waiter what you want, and the food comes out. You never go into the kitchen. You never see how the chef prepares the food. You just use the menu as the defined interface between you and the kitchen.

APIs work exactly the same way. When your app wants data or functionality from another service — weather information, payment processing, user authentication, location data — it uses that service's API. The API is the "menu" of things you can request. You do not need to know how the other service works internally. You just need to know how to ask.

A few examples of APIs you probably use indirectly every day:
- Weather apps get their data from weather APIs
- "Sign in with Google" buttons use Google's authentication API
- The maps in apps use Google Maps or Apple Maps APIs
- Payment forms use Stripe or PayPal APIs

---

## How APIs Work in Practice

When your code calls an API, it sends an HTTP request — the same kind of request your browser sends when you visit a website. The request includes:

1. **A URL** — the address of the specific API endpoint you want (think: which item on the menu)
2. **A method** — usually GET (I want to read something) or POST (I want to send something)
3. **Headers** — metadata including authentication information
4. **A body** — data you are sending (for POST requests)

The API responds with data, usually formatted as JSON — a structured text format that both humans and computers can read.

A typical API response for weather data might look like:

```json
{
  "city": "Austin",
  "temperature": 78,
  "condition": "Partly Cloudy",
  "humidity": 65,
  "forecast": [
    {"day": "Monday", "high": 82, "low": 68},
    {"day": "Tuesday", "high": 79, "low": 65}
  ]
}
```

Your code receives this JSON and can use any of those values — display the temperature, show the condition, loop through the forecast.

---

## Authentication Basics

Most useful APIs require authentication — proof that you are allowed to use them. This prevents abuse and lets the API provider track usage.

The most common form of API authentication is an **API key**: a long string of letters and numbers that is unique to you. When you make a request, you include this key, and the API uses it to identify you.

API keys are secrets. Treat them like passwords:
- Never put them directly in your code (other people can read your code if you share it)
- Store them in a `.env` file (see Chapter 14)
- Never commit them to git
- Never share them in public channels

A `.env` file looks like this:

```
WEATHER_API_KEY=abc123def456ghi789
DATABASE_URL=postgresql://localhost/mydb
```

Your code reads these values from the environment rather than having them hardcoded.

---

## Tutorial: Building a Weather Dashboard

Let's build a real project together: a simple weather dashboard that shows the current weather and a 5-day forecast for any city.

We will use the OpenWeatherMap API, which has a free tier that is perfect for learning.

### Step 1: Get an API key

Visit openweathermap.org, create a free account, and get your API key. It takes about 2 minutes.

### Step 2: Set up the project

Open your terminal:

```bash
mkdir weather-dashboard
cd weather-dashboard
claude
```

In Claude Code:

```
I want to build a weather dashboard using the OpenWeatherMap API.
It should let users type a city name and see:
- Current temperature (in Fahrenheit)
- Weather condition (sunny, cloudy, etc.)
- Humidity percentage
- A 5-day forecast with high and low temperatures

Please create a simple HTML/CSS/JavaScript project for this.
Use a clean, minimal design with a blue and white color scheme.
```

Claude will create:
- `index.html` — the page structure and weather display
- `styles.css` — the visual design
- `app.js` — the JavaScript that calls the API and updates the page

### Step 3: Store your API key safely

```
I have my OpenWeatherMap API key. How should I store it safely for
this project?
```

Claude will explain `.env` files and likely suggest a simple approach for a client-side JavaScript project. For a beginner project where you are just running it locally, Claude will show you how to configure the API key in a way that works without exposing it.

### Step 4: Connect the API

```
My API key is stored. Can you update the app.js file to actually call
the OpenWeatherMap API and display the results?

The API endpoint for current weather is:
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=imperial

The endpoint for 5-day forecast is:
https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={key}&units=imperial
```

Claude will write the code that:
1. Takes the city name from the input field
2. Constructs the API URL
3. Makes the request
4. Parses the JSON response
5. Updates the page with the weather data

### Step 5: Handle errors gracefully

```
What happens if someone types an invalid city name, or if the API
is down? Can you add error handling so we show a friendly message
instead of crashing?
```

Good API handling always accounts for failures. Claude will add:
- A check for city-not-found responses
- A fallback message if the API request fails entirely
- Loading states so the user knows something is happening

### Step 6: Test it

Open `index.html` in your browser, type a city name, and see if it works.

If something goes wrong:

```
I typed "London" and clicked Search but nothing happened. No error
message, no data. Here's what I see in the browser console:
[paste the console output]
```

Claude will diagnose the issue and fix it.

---

## Common Patterns in API Work

### Making requests in different languages

Claude knows how to make API requests in virtually every programming language. You do not need to know the syntax — just describe what you want:

```
Show me how to call this same weather API using Python instead of JavaScript
```

```
How would I make this request using Node.js with the axios library?
```

### Handling rate limits

Most APIs limit how many requests you can make in a given time period. If you exceed the limit, you get an error. Claude can help you handle this gracefully:

```
The API limits me to 60 requests per minute. Can you add rate limit
handling that waits and retries instead of failing?
```

### Pagination

When an API returns a large list of results, it often does so in "pages" — giving you 20 results at a time and providing a way to request the next 20. Claude knows how to handle this:

```
The API returns results in pages of 20. Can you add a "Load More"
button that fetches the next page of results and adds them to the list?
```

### Transforming data

API responses often need to be reshaped before displaying. For example, the weather API returns temperatures in Kelvin by default — you would want to convert to Fahrenheit or Celsius. Or dates come back as Unix timestamps and you want to display them as "Monday, March 10":

```
The API returns the date as a Unix timestamp like 1710115200.
Can you convert that to a readable format like "Monday" for the
forecast display?
```

---

## A Note on Free vs. Paid APIs

Many APIs have a free tier that lets you make a limited number of requests per month. For learning and small projects, these free tiers are usually more than enough.

When choosing an API for a project, Claude can help you evaluate options:

```
I want to add a map to my website. What are the best mapping APIs?
I'd prefer something free or cheap for a personal project.
```

Claude will compare options — Google Maps, Mapbox, Leaflet with OpenStreetMap — and recommend based on your requirements.

---

## What You Built

The weather dashboard you built in this chapter demonstrates the full loop of API work:
1. Finding and signing up for an API
2. Understanding the API's documentation
3. Storing credentials safely
4. Writing code to make requests and handle responses
5. Displaying the data to a user
6. Handling errors gracefully

These are skills that apply to every API you will ever work with, whether it is weather data, financial data, social media, mapping, payment processing, or anything else. The specific endpoints change; the pattern stays the same.

---

**Next up:** [Chapter 14 — CLAUDE.md: Your AI's Instruction Manual](./14-claude-md.md) — How to give Claude persistent instructions so it behaves exactly how you want across every session.
