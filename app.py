import json
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
API_KEY = os.getenv("GROQ_KEY")
if not API_KEY:
    raise RuntimeError("Set GROQ_KEY in your .env")

# load questions once
with open("functions/leetcodequestions.json") as f:
    QUESTIONS = json.load(f)

app = Flask(__name__, template_folder=".")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/feedback", methods=["POST"])
def feedback():
    data = request.json
    qid = data.get("question_id", "").strip()
    lang = data.get("language", "").strip()
    code = data.get("solution", "").strip()

    meta = QUESTIONS.get(qid)
    if not meta:
        return jsonify({"error": f"Question ID {qid} not found"}), 404

    # build messages
    messages = [
        {
            "role": "system",
            "content": (
                "You are the leettutor. Your job is to review users' attempted solutions to LeetCode problems "
                "and provide brief, specific, and honest feedback. You must NEVER solve the problem yourself. "
                "Your response must ONLY include feedback on the user's submitted code — no extra commentary, "
                "no correct solution, and no general discussion of how to solve the problem. "
                "If the user's submission is nonsense or incomplete (e.g. 'hello'), you must say so clearly and briefly. "
                "DO NOT generate any actual solution code. DO NOT attempt to solve the problem. "
                "DO NOT restate the problem or describe how to solve it."
            )
        },
        {
            "role": "user",
            "content": (
                f"Here is the problem metadata:\n"
                f"- Problem ID: {qid}\n"
                f"- Title: {meta['title']}\n"
                f"- Difficulty: {meta['difficulty']}\n"
                f"- Topics: {meta['topics']}"
            )
        },
        {
            "role": "assistant",
            "content": "Understood. Ready to review the user's code submission."
        },
        {
            "role": "user",
            "content": (
                f"The user's attempted solution in {lang} is:\n"
                f">>>\n{code}\n<<<\n\n"
                "Please provide **brief feedback only** on this exact submission. "
                "If it is incorrect, unclear, or unrelated to the problem, say so explicitly. "
                "**DO NOT solve the problem. DO NOT include working code. DO NOT try to infer what the user meant.** "
                "Just give honest feedback based strictly on what they submitted."
            )
        }
    ]

    client = Groq(api_key=API_KEY)
    completion = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=messages,
        temperature=0.6,
        max_completion_tokens=4096,
        top_p=0.95,
        reasoning_effort="default",
        stream=False,
    )
    resp = completion.choices[0].message.content

    # strip any <think>…</think> tags
    start, end = resp.find("<think>"), resp.find("</think>")
    if start != -1 and end != -1:
        resp = (resp[:start] + resp[end+len("</think>"):]).strip()

    return jsonify({"feedback": resp})

if __name__ == "__main__":    app.run(debug=True)