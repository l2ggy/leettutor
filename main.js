/* ------------------------ CONFIG ------------------------ */
const GROQ_API_KEY = "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"; // <<–– paste yours
const MODEL = "qwen/qwen3-32b";

/* ------------------------ HELPERS ----------------------- */

/** Load leetcode.json once and cache it */
async function loadProblems() {
  if (loadProblems.cache) return loadProblems.cache;
  const res = await fetch("leetcode.json");
  if (!res.ok) throw new Error("Could not load leetcode.json");
  loadProblems.cache = await res.json();
  return loadProblems.cache;
}

function buildMessages(meta, language, userCode) {
  return [
    {
      role: "system",
      content:
        "You are the leettutor. Your job is to review users' attempted " +
        "solutions to LeetCode problems and provide brief, specific, and honest feedback. " +
        "You must NEVER solve the problem yourself. Your response must ONLY include feedback " +
        "on the user's submitted code."
    },
    {
      role: "user",
      content: `Here is the problem metadata:
- Problem ID: ${meta.id}
- Title: ${meta.title}
- Difficulty: ${meta.difficulty}
- Topics: ${meta.topics}`
    },
    {
      role: "assistant",
      content: "Understood. Ready to review the user's code submission."
    },
    {
      role: "user",
      content:
        `The user's attempted solution in ${language} is:\n>>>` +
        `\n${userCode}\n<<<\n\nPlease provide **brief feedback only** on this exact submission.`
    }
  ];
}

/* ------------------------ DOM HOOKS --------------------- */
const form = document.getElementById("review-form");
const output = document.getElementById("output");

form.addEventListener("submit", async e => {
  e.preventDefault();
  output.hidden = true;
  output.textContent = "Loading…";

  const questionId = document.getElementById("questionId").value.trim();
  const language = document.getElementById("language").value.trim();
  const userCode = document.getElementById("userCode").value;

  try {
    const problems = await loadProblems();
    const meta = problems[questionId];
    if (!meta) throw new Error(`Problem ID ${questionId} not found in leetcode.json`);

    const body = {
      model: MODEL,
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 1024,
      messages: buildMessages({ id: questionId, ...meta }, language, userCode)
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Groq API error ${res.status}`);
    }

    const data = await res.json();
    let text = data.choices?.[0]?.message?.content || "(no response)";
    // strip any <think></think>
    text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    output.textContent = text;
  } catch (err) {
    output.textContent = err.message || String(err);
  }

  output.hidden = false;
});