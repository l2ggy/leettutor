import questions from '../questions.js';

export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Allow': 'POST, OPTIONS' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const qid  = String(body.question_id ?? '').trim();
  const lang = (body.language ?? '').trim();
  const code = (body.solution ?? '').trim();

  if (!qid) {
    return new Response(JSON.stringify({ error: 'Missing question_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing solution code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Look up metadata for the requested problem
  const meta = questions[qid];

  if (!meta) {
    return new Response(JSON.stringify({ error: `Question ID "${qid}" not found` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const messages = [
    {
      role: 'system',
      content:
        "You are the leettutor. Your job is to review users' attempted solutions to LeetCode problems and provide brief, specific, and honest feedback. You must NEVER solve the problem yourself. Your response must ONLY include feedback on the user's submitted code — no extra commentary, no correct solution, and no general discussion of how to solve the problem."
    },
    {
      role: 'user',
      content: `Here is the problem metadata:\n- Problem ID: ${qid}\n- Title: ${meta.title}\n- Difficulty: ${meta.difficulty}\n- Topics: ${meta.topics}`
    },
    { role: 'assistant', content: "Understood. Ready to review the user's code submission." },
    {
      role: 'user',
      content: `The user's attempted solution in ${lang} is:\n>>>\n${code}\n<<<\n\nPlease provide **brief feedback only** on this exact submission. If it is incorrect, unclear, or unrelated to the problem, say so explicitly. **DO NOT solve the problem or give working code.**`
    }
  ];

  const apiKey = env.GROQ_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let resp;
  try {
    resp = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        messages,
        temperature: 0.6,
        max_completion_tokens: 4096,
        top_p: 0.95
      })
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Failed to reach Groq API: ${err.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  if (!resp.ok) {
    const text = await resp.text();
    return new Response(JSON.stringify({ error: `Groq API error: ${text}` }), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let payload;
  try {
    payload = await resp.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON from Groq API' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let feedback = payload.choices?.[0]?.message?.content || '';
  feedback = feedback.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  return new Response(JSON.stringify({ feedback }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
