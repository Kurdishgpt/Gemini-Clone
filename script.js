// ✅ Import config file
import { API_KEY, API_BASE_URL_TEXT, MODEL_NAME } from "./config.js";

// ✅ Markdown setup
const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true
});

// --- GLOBAL STATE ---
let chatHistory = [];
let isTyping = false;
let currentLanguage = "en"; // Default language

// ✅ Send message to Gemini API
async function sendMessageToAPI(message) {
  const url = `${API_BASE_URL_TEXT}/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: message }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API Error (${response.status})`);
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    return reply;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to get a response from the API. Please check the console for details.");
  }
}

// ✅ UI Logic
async function handleUserMessage() {
  const input = document.getElementById("user-input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  try {
    const aiReply = await sendMessageToAPI(userMessage);
    appendMessage("bot", aiReply);
  } catch (error) {
    appendMessage("error", error.message);
  }
}

// ✅ Add messages to chat
function appendMessage(sender, text) {
  const chatContainer = document.getElementById("chat-container");
  const messageEl = document.createElement("div");

  messageEl.classList.add(
    "p-3",
    "rounded-lg",
    "my-2",
    "max-w-[80%]"
  );

  if (sender === "user") {
    messageEl.classList.add("bg-blue-500", "text-white", "self-end");
  } else if (sender === "bot") {
    messageEl.classList.add("bg-gray-700", "text-white", "self-start");
  } else {
    messageEl.classList.add("bg-red-600", "text-white", "self-start");
  }

  messageEl.innerHTML = converter.makeHtml(text);
  chatContainer.appendChild(messageEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ✅ Event listener
document.getElementById("send-btn").addEventListener("click", handleUserMessage);
