# LeetTutor

**LeetTutor** is a minimal web utility that leverages large-language-model feedback to review LeetCode solutions.  
It is built with plain **HTML / CSS / JavaScript** on the front-end and a single **Cloudflare Pages Function** on the back-end, keeping the Groq API key secure in Cloudflare environment variables.

---

## Features
- **Instant AI code review** &nbsp;—&nbsp; powered by Groq’s `qwen/qwen3-32b` chat model  
- **Zero framework** front-end (no React, no bundlers)  
- **Serverless proxy** stores the Groq key safely; the browser never sees it  
- **Local JSON catalogue** (`leetcode.json`) with titles, topics and difficulty for rapid prompt construction  
- **One-command dev / deploy** via Wrangler and Cloudflare Pages  

---

## Screenshot

![Screenshot of LeetTutor](screenshots/demo.png)

---

## Getting Started

### Prerequisites
* **Node ≥ 18**  
* **Wrangler CLI**  
  ```bash
  npm install -g wrangler
  ```

### 1&nbsp;·&nbsp;Clone & install

```bash
git clone https://github.com/l2ggy/leettutor.git
cd leettutor
npm install    # installs wrangler if you keep it in package.json
```

### 2&nbsp;·&nbsp;Add your Groq key locally  
Create `.dev.vars` (ignored by git):

```dotenv
GROQ_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 3&nbsp;·&nbsp;Run the dev server

```bash
wrangler pages dev            # or: npm run dev
# opens http://localhost:8787
```

*(If you encounter a GLIBC error on older distros, install `wrangler@3` or use a newer container. Wrangler 3’s Miniflare works on Ubuntu 20.04.)*

---

## Deployment to Cloudflare Pages

1. Push the repo to GitHub and create a **Pages** project.  
2. In **Pages → Settings → Environment Variables** add  
   ```
   GROQ_API_KEY = sk-xxxxxxxxxxxx
   ```  
3. Build command → **N/A** (Pages detects Wrangler automatically).  
4. Press **Deploy** — your static site and `/api/review` Function go live.

---

## How It Works

1. **Browser** loads `index.html`, user chooses a problem ID and pastes code.  
2. `main.js` POSTs the data to `/api/review`.  
3. **Pages Function** (`functions/api/review.js`)  
   - reads metadata from `/public/leetcode.json`  
   - injects `env.GROQ_API_KEY` into a request to Groq  
   - sanitises `<think>` blocks and returns JSON `{ feedback }`  
4. Browser displays the feedback.

---

## File Structure

```
.
├── public/
│   ├── index.html      # UI
│   ├── styles.css
│   ├── main.js
│   └── leetcode.json   # metadata
├── functions/
│   └── api/
│       └── review.js   # serverless proxy
├── screenshots/        # README images
├── wrangler.toml       # Cloudflare config
├── .dev.vars           # local secrets (git-ignored)
└── .gitignore
```

---

## Dependencies

| Runtime | Purpose |
|---------|---------|
| **Wrangler 4** | Dev server & Pages deploy |
| **Groq API**   | LLM inference |

No other libraries or frameworks are required.

---

## Future Improvements
- Streaming token-by-token responses for faster UX  
- Syntax-highlighted code editor (Monaco / CodeMirror)  
- Rate-limiting or basic auth to prevent key abuse  
- Per-user submission history backed by D1 / KV  

---

## License
Licensed under the **MIT License** – see [`LICENSE`](LICENSE).