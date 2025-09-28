// ====== CONFIG (edit these) ======
let AI_KEY;
const AI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const AI_MODEL = "gpt-4o-mini"; // or a compatible model for your key
// =================================

fetch("./api_key.json")
  .then((response) => response.json())
  .then((api_key) => {
    AI_KEY = api_key.OPENAI_API_KEY;
  })
  .catch((err) => console.error(err));

console.log("AI Worker background loaded");

async function postJSON(url, body, headers = {}) {
  console.log("About to fetch:", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error?.message) msg += `: ${j.error.message}`;
    } catch {}
    throw new Error(msg);
  }
  return text ? JSON.parse(text) : {};
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    console.log("Received message:", msg);
    if (msg?.type !== "AI_EXPLAIN") return;

    if (!AI_KEY || !AI_KEY.startsWith("sk-")) {
      return;
    }

    const it = msg.item || {};
    const sys = `You are a senior accessibility engineer. Explain succinctly how to fix the issue.
Return a short markdown list (3–6 bullets) with concrete steps and, when relevant, a tiny code example. No preamble.`;
    const user = `Issue:
${JSON.stringify(
  {
    type: it.type,
    severity: it.severity,
    message: it.message,
    snippet: (it.snippet || "").slice(0, 300),
    tip: (it.tip || "").slice(0, 240),
  },
  null,
  2
)}
Write only the markdown bullet list.`;

    try {
      const data = await postJSON(
        AI_ENDPOINT,
        {
          model: AI_MODEL,
          messages: [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
          temperature: 0.25,
          max_tokens: 220,
        },
        { Authorization: `Bearer ${AI_KEY}` }
      );

      sendResponse({
        ok: true,
        details: data.choices?.[0]?.message?.content?.trim() || "",
      });
    } catch (e) {
      sendResponse({ ok: false, error: `AI request failed: ${e.message}` });
    }
  })();
  return true;
});
