// --- script.js ---

// 1. IMPORT CONFIGURATION
import config from "./config.js"; // ✅ Direct import

// Markdown converter (optional)
const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true
});

// --- GLOBAL STATE ---
let isTyping = false;

// --- MAIN SEND FUNCTION ---
window.handleSendMessage = async function () {
  const inputEl = document.getElementById("chat-input");
  const userPrompt = inputEl.value.trim();

  if (userPrompt === "" || isTyping) return;

  addMessage("user", userPrompt);
  inputEl.value = "";
  isTyping = true;

  const aiBubble = addMessage("model", "Thinking...");

  try {
    const reply = await callGeminiAPI(userPrompt);
    aiBubble.innerHTML = converter.makeHtml(reply);
  } catch (err) {
    console.error(err);
    aiBubble.innerHTML = `<p class="text-red-400">⚠️ Error: ${err.message}</p>`;
  } finally {
    isTyping = false;
  }
};

// --- CALL GEMINI API ---
async function callGeminiAPI(prompt) {
  const apiUrl = `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
    },
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API Error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
}

// --- ADD MESSAGE TO CHAT ---
function addMessage(role, text) {
  const chatContainer = document.getElementById("chat-container");

  const msgDiv = document.createElement("div");
  msgDiv.className =
    role === "user"
      ? "self-end bg-blue-600 text-white px-3 py-2 rounded-xl my-2 max-w-[80%]"
      : "self-start bg-gray-800 text-white px-3 py-2 rounded-xl my-2 max-w-[80%]";

  msgDiv.innerHTML = converter.makeHtml(text);
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return msgDiv;
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-button");

  sendBtn.addEventListener("click", handleSendMessage);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
});
