document.getElementById("submit-btn").addEventListener("click", async () => {
  const qid  = document.getElementById("problem-id").value.trim();
  const lang = document.getElementById("language").value;
  const sol  = document.getElementById("code-editor").value.trim();

  const box = document.getElementById("feedback-box");
  box.textContent = "";

  // Basic client-side validation
  if (!qid) {
    box.textContent = "Please enter a problem ID.";
    return;
  }
  if (!sol) {
    box.textContent = "Please paste your solution before submitting.";
    return;
  }

  box.textContent = "Loading feedback…";

  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: qid, language: lang, solution: sol })
    });

    // Handle HTTP errors
    if (!res.ok) {
      if (res.status === 404) {
        box.textContent = `Problem ID "${qid}" not found. Please check and try again.`;
        return;
      }
      if (res.status === 400) {
        const err = await res.json();
        box.textContent = `Bad request: ${err.error || "Please check your inputs."}`;
        return;
      }
      box.textContent = `Server error (${res.status}): ${res.statusText}`;
      return;
    }

    // Parse JSON
    const data = await res.json();

    // Handle application-level errors
    if (data.error) {
      box.textContent = `Error: ${data.error}`;
      return;
    }

    // Handle empty feedback
    const fb = (data.feedback || "").trim();
    if (!fb) {
      box.textContent = "No feedback returned from server. Try again later.";
      return;
    }

    // Success!
    box.textContent = fb;

  } catch (err) {
    // Network or unexpected errors
    box.textContent = `Network error: ${err.message}. Please check your connection.`;
  }
});