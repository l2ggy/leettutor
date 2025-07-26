// functions/api/review.js
// Cloudflare Pages Function – keeps API key server-side

export async function onRequestPost({ request, env }) {
  try {
    /* ----- 1. Read body ----- */
    const { questionId, language, userCode } = await request.json();
    if (!questionId || !language || !userCode) {
      return json({ error: "questionId, language, and userCode are required." }, 400);
    }

    /* ----- 2. Load metadata from public/leetcode.json ----- */
    const metaURL = new URL("/leetcode.json", request.url);
    const problems = await fetch(metaURL).then((r) => r.json());
    const meta = problems[questionId];

    if (!meta) {
      return json({ error: `Problem ID ${questionId} not found.` }, 404);
    }

    /* ----- 3. Build messages for Groq ----- */
    const messages = [
      {
        role: "system",
        content:
          "You are the leettutor. Your job is to review users' attempted " +
          "solutions to LeetCode problems and provide brief, specific, and honest feedback. " +
          "You must NEVER solve the problem yourself. Response must ONLY include feedback."
      },
      {
        role: "user",
        content: `Here is the problem metadata:
- Problem ID: ${questionId}
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
          `\n${userCode}\n<<<\n\nPlease provide **brief feedback only** on this submission.`
      }
    ];

    /* ----- 4. Call Groq API ----- */
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,   // ← secret from Pages
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-32b",
          messages,
          temperature: 0.6,
          top_p: 0.95,
          max_tokens: 1024
        })
      }
    );

    if (!groqRes.ok) {
      return json({ error: `Groq error ${groqRes.status}` }, 500);
    }

    const groqData = await groqRes.json();
    let feedback = groqData.choices?.[0]?.message?.content || "";
    feedback = feedback.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    /* ----- 5. Return feedback to the browser ----- */
    return json({ feedback });
  } catch (err) {
    console.error(err);
    return json({ error: "Server error" }, 500);
  }
}

/* Helper to build JSON responses */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}