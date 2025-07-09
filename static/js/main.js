document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit-btn");
  const problemInput = document.getElementById("problem-id");
  const languageSelect = document.getElementById("language");
  const codeEditor = document.getElementById("code-editor");
  const feedbackBox = document.getElementById("feedback-box");

  submitBtn.addEventListener("click", async () => {
    const qid  = problemInput.value.trim();
    const lang = languageSelect.value;
    const sol  = codeEditor.value.trim();

    // Clear previous feedback
    feedbackBox.textContent = "";

    // Client-side validation
    if (!qid) {
      feedbackBox.textContent = "Please enter a problem ID.";
      return;
    }
    if (!sol) {
      feedbackBox.textContent = "Please paste your solution before submitting.";
      return;
    }

    feedbackBox.textContent = "Loading feedback…";

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

      // HTTP error handling
      if (!res.ok) {
        if (res.status === 404) {
          feedbackBox.textContent = `Problem ID "${qid}" not found. Please check and try again.`;
          return;
        }
        if (res.status === 400) {
          const err = await res.json().catch(() => ({}));
          feedbackBox.textContent = `Bad request: ${err.error || "Please check your inputs."}`;
          return;
        }
        feedbackBox.textContent = `Server error (${res.status}): ${res.statusText}`;
        return;
      }

      // Parse JSON
      const data = await res.json();

      // Application-level errors
      if (data.error) {
        feedbackBox.textContent = `Error: ${data.error}`;
        return;
      }

      // Empty feedback
      const fb = (data.feedback || "").trim();
      if (!fb) {
        feedbackBox.textContent = "No feedback returned from server. Try again later.";
        return;
      }

      // Success
      feedbackBox.textContent = fb;

    } catch (err) {
      // Network or unexpected errors
      feedbackBox.textContent = `Network error: ${err.message}. Please check your connection.`;
    }
  });
});