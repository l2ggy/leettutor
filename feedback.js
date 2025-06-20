// functions/feedback.js
import { json } from '@cloudflare/pages-runtime';

export async function onRequest(context) {
  const { request, env } = context;

  // Always allow CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Allow': 'POST, OPTIONS' }
    });
  }

  const data = await request.json();
  const { question_id: qid, language: lang, solution: code } = data;
  // Lookup your CSV however you like here (or move it to KV)
  // For brevity let's assume you have a QUESTIONS map in KV or import

  const meta = QUESTIONS[qid];
  if (!meta) {
    return json({ error: `Question ID ${qid} not found` }, { status: 404 });
  }

  // Build your Groq messages
  const messages = [
    /* …same as your Python version… */
  ];

  const apiKey = env.GROQ_KEY;
  if (!apiKey) {
    return json({ error: 'Groq key not configured' }, { status: 500 });
  }

  // Call Groq
  const groqResp = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-32b',
      messages,
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
    }),
  });
  const payload = await groqResp.json();
  let feedback = payload.choices[0].message.content;
  // strip <think> tags if needed…
  const result = { feedback };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}