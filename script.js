import { CONFIG } from "./config.js";

let isTyping = false;

// --- Toggle Send/Mic ---
window.checkInputStatus = function () {
  const input = document.getElementById("chat-input");
  const send = document.getElementById("send-button");
  const mic = document.getElementById("mic-button");
  if (input.value.trim()) {
    send.classList.remove("hidden");
    mic.classList.add("hidden");
  } else {
    send.classList.add("hidden");
    mic.classList.remove("hidden");
  }
};

// --- Send Message ---
window.handleSendMessage = async function () {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || isTyping) return;

  const chatContainer = document.getElementById("chat-container-scrollable");
  document.getElementById("home-screen").classList.add("hidden");
  chatContainer.classList.remove("hidden");

  appendMessage("user", text);
  input.value = "";
  checkInputStatus();

  isTyping = true;
  appendMessage("ai", "Thinking...");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        CONFIG.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      }
    );

    const data = await response.json();
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Error: No response from Gemini.";

    updateLastAiMessage(aiText);
  } catch (err) {
    updateLastAiMessage("❌ Error connecting to Gemini API.");
    console.error(err);
  }

  isTyping = false;
};

// --- Helper: Append Message ---
function appendMessage(sender, text) {
  const chat = document.getElementById("chat-container-scrollable");
  const wrapper = document.createElement("div");
  wrapper.className = `flex mb-3 ${
    sender === "user" ? "justify-end" : "justify-start"
  }`;

  const bubble = document.createElement("div");
  bubble.className = `p-3 rounded-2xl max-w-[80%] ${
    sender === "user" ? "bg-blue-600 text-white" : "bg-[#2e2e2e] text-gray-100"
  }`;
  bubble.innerHTML = `<div class="markdown-content">${text}</div>`;
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

// --- Helper: Replace “Thinking...” with AI text ---
function updateLastAiMessage(text) {
  const chat = document.getElementById("chat-container-scrollable");
  const last = chat.lastElementChild.querySelector(".markdown-content");
  last.innerText = "";
  let i = 0;
  const typing = setInterval(() => {
    if (i < text.length) {
      last.innerText += text[i];
      i++;
    } else {
      clearInterval(typing);
    }
  }, 20);
}
