/* main.js – minimal client logic (no key on the client) */

const form   = document.getElementById("review-form");
const output = document.getElementById("output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  output.hidden = true;
  output.textContent = "Loading…";

  const questionId = document.getElementById("questionId").value.trim();
  const language   = document.getElementById("language").value.trim();
  const userCode   = document.getElementById("userCode").value;

  try {
    const res  = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, language, userCode })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unexpected error");

    output.textContent = data.feedback;
  } catch (err) {
    output.textContent = err.message || String(err);
  }

  output.hidden = false;
});