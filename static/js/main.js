document.getElementById("submit-btn").addEventListener("click", async () => {
  const qid  = document.getElementById("problem-id").value.trim();
  const lang = document.getElementById("language").value;
  const sol  = document.getElementById("code-editor").value;

  const box = document.getElementById("feedback-box");
  box.textContent = "Loading…";

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: qid,
        language: lang,
        solution: sol
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    box.textContent = data.feedback;
  } catch (err) {
    box.textContent = "Error: " + err.message;
  }
});