# LeetTutor

A Cloudflare Pages project that uses Groq's API to give feedback on LeetCode submissions.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GROQ_KEY` environment variable with your Groq API key (via `wrangler.toml` or the Cloudflare dashboard).
3. Deploy or test with Wrangler:
   ```bash
   wrangler pages dev
   ```

## Data

`functions/leetcodequestions.json` contains the problem metadata. It was generated once with `node scripts/csv-to-json.js` and normally doesn't need to be regenerated.

## API

Send a `POST` request to `/api/feedback` with JSON:

```json
{
  "question_id": "1",
  "language": "Python",
  "solution": "# your code"
}
```

The response will be `{ "feedback": "..." }`.
