// functions/feedback.js
import questions from './leetcodequestions.json' assert { type: 'json' }
 
export async function onRequest(context) {
  const { request, env } = context

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS'
      }
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const qid  = (body.question_id  || '').trim()
  const lang = (body.language     || '').trim()
  const code = (body.solution     || '').trim()

  if (!qid) {
    return new Response(JSON.stringify({ error: 'Missing question_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing solution code' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const meta = questions[qid]
  if (!meta) {
    return new Response(JSON.stringify({ error: `Question ID "${qid}" not found` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // Build the messages exactly as in your Python version
  const messages = [
    {
      role: 'system',
      content: `You are the leettutor. Your job is to review users' attempted solutions to LeetCode problems and provide brief, specific, and honest feedback. You must NEVER solve the problem yourself. Your response must ONLY include feedback on the user's submitted code — no extra commentary, no correct solution, and no general discussion of how to solve the problem. If the user's submission is nonsense or incomplete (e.g. 'hello'), you must say so clearly and briefly. DO NOT generate any actual solution code. DO NOT attempt to solve the problem. DO NOT restate the problem or describe how to solve it.`
    },
    {
      role: 'user',
      content: `Here is the problem metadata:
- Problem ID: ${qid}
- Title: ${meta.title}
- Difficulty: ${meta.difficulty}
- Topics: ${meta.topics}`
    },
    { role: 'assistant', content: 'Understood. Ready to review the user\'s code submission.' },
    {
      role: 'user',
      content: `The user's attempted solution in ${lang} is:
>>>
${code}
<<<

Please provide **brief feedback only** on this exact submission. If it is incorrect, unclear, or unrelated to the problem, say so explicitly. **DO NOT solve the problem. DO NOT include working code. DO NOT try to infer what the user meant.** Just give honest feedback based strictly on what they submitted.`
    }
  ]

  const apiKey = env.GROQ_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  // Call Groq’s REST API
  const groqResp = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-32b',
      messages,
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95
    })
  })

  if (!groqResp.ok) {
    const text = await groqResp.text()
    return new Response(JSON.stringify({ error: `Groq API error: ${text}` }), {
      status: groqResp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }

  const payload = await groqResp.json()
  let feedback = payload.choices?.[0]?.message?.content || ''

  // Strip any <think>…</think> tags
  feedback = feedback.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  return new Response(JSON.stringify({ feedback }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}