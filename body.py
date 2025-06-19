import csv
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

file = open('leetcodequestions.csv', 'r')
reader = csv.reader(file)
data = list(reader)
api_key = os.getenv("groq_key")

if not api_key:
    raise ValueError("API key not found. Please set the 'groqkey' environment variable.")

question_id = input("Enter the question ID: ")
programming_language = input("Enter the programming language: ")
user_solution = input("Enter the user's attempted solution: ")

for row in data:
    if str(row[0]) == question_id:
        question_name = row[1]
        question_topics = row[5]
        question_difficulty = row[6]

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
            f"- Problem ID: {question_id}\n"
            f"- Title: {question_name}\n"
            f"- Difficulty: {question_difficulty}\n"
            f"- Topics: {question_topics}"
        )
    },
    {
        "role": "assistant",
        "content": "Understood. Ready to review the user's code submission."
    },
    {
        "role": "user",
        "content": (
            f"The user's attempted solution in {programming_language} is:\n"
            f">>>\n{user_solution}\n<<<\n\n"
            "Please provide **brief feedback only** on this exact submission. "
            "If it is incorrect, unclear, or unrelated to the problem, say so explicitly. "
            "**DO NOT solve the problem. DO NOT include working code. DO NOT try to infer what the user meant.** "
            "Just give honest feedback based strictly on what they submitted."
        )
    }
]

client = Groq(api_key=api_key)
completion = client.chat.completions.create(
    model="qwen/qwen3-32b",
    messages=messages,
    temperature=0.6,
    max_completion_tokens=4096,
    top_p=0.95,
    reasoning_effort="default",
    stream=False,
    stop=None,
)
response = str(completion.choices[0].message.content)

start = response.find("<think>")
end = response.find("</think>")

if start != -1 and end != -1:
    think_content = response[start + len("<think>"):end].strip()
    rest_of_response = (response[:start] + response[end + len("</think>"):]).strip()
else:
    think_content = ""
    rest_of_response = response

print(rest_of_response)