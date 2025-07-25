# LeetTutor

**LeetTutor** is a lightweight client-side web application that uses large language models to review user-submitted LeetCode solutions. It provides concise, code-focused feedback without solving the problem itself. The application is implemented entirely in HTML, CSS, and vanilla JavaScript, with no frameworks or build tooling.

The project integrates with the Groq API to query the Qwen-32B language model and includes a local `leetcode.json` file containing problem metadata.

---

## Features

- AI-generated code feedback using [Groq’s](https://groq.com/) `qwen/qwen3-32b` model  
- Local problem metadata file (`leetcode.json`) containing titles, topics, and difficulty  
- No server-side backend required — fully static and self-contained  
- Optional `.env.local` integration for managing sensitive API keys  
- Runs locally via [`lite-server`](https://github.com/johnpapa/lite-server) or a minimal Express server

---

## Screenshot

![Screenshot](screenshots/demo.png)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/l1ggy/leettutor.git
cd leettutor
npm install
```

### 2. Add your Groq API key

Create a `.env.local` file in the project root:

```dotenv
GROQ_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Note: In this minimal version, the API key is still sent to the browser and is visible to users. Do not expose this version publicly without securing the key via a backend proxy.

---

### 3. Start the development server

To run using the included Express server:

```bash
npm run dev
```

This starts the app at:

```
http://localhost:3000
```

---

## How It Works

1. The user selects a LeetCode problem by its ID and submits a solution.
2. The app retrieves metadata from the local `leetcode.json` file.
3. A structured prompt is constructed and sent to Groq’s `chat/completions` endpoint.
4. The model responds with brief, rule-compliant feedback.
5. The response is displayed below the form.

---

## File Structure

```
.
├── index.html         # Main UI structure
├── styles.css         # Minimal styling
├── main.js            # App logic and Groq API integration
├── leetcode.json      # Problem metadata
├── .env.local         # Environment variables (ignored by git)
├── server.js          # Express-based development server (optional)
└── screenshots/       # Optional folder for UI screenshots
```

---

## Dependencies

- [Groq API](https://console.groq.com/)
- [lite-server](https://github.com/johnpapa/lite-server) *(optional)*
- [dotenv](https://www.npmjs.com/package/dotenv) *(used in `server.js`)*
- [Express](https://expressjs.com/) *(used in `server.js`)*

---

## Limitations

- The Groq API key is exposed in the client; this is not suitable for production.
- No persistent storage or backend validation.
- Response formatting is minimal and lacks syntax highlighting or rich UI.

---

## Potential Improvements

- Proxy API requests through a secure backend (e.g., Vercel, Netlify functions)
- Add syntax highlighting (e.g., Prism or Monaco)
- Improve feedback presentation and user input validation
- Add usage quotas or token limits

---

## License

This project is open source and available under the MIT License.