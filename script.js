import { CONFIG } from "./config.js";

let chatHistory = [];
let isTyping = false;

// Markdown converter (for nice formatted responses)
const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true,
});

// 🧠 --- Send Message Handler ---
window.handleSendMessage = async function () {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || isTyping) return;

  const chatContainer = document.getElementById("chat-container-scrollable");
  const home = document.getElementById("home-screen");
  home.classList.add("hidden");
  chatContainer.classList.remove("hidden");

  appendMessage("user", text);
  input.value = "";
  checkInputStatus();

  isTyping = true;
  const thinking = appendMessage("ai", "Thinking...");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      }
    );

    const data = await response.json();
    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini.";

    updateLastAiMessage(aiText);
  } catch (err) {
    console.error(err);
    updateLastAiMessage("❌ Error connecting to Gemini API.");
  }

  isTyping = false;
};

// 🧩 --- Append Message to Chat ---
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
  return wrapper;
}

// 💬 --- Typing Animation (AI Text Appears Smoothly) ---
function updateLastAiMessage(text) {
  const chat = document.getElementById("chat-container-scrollable");
  const last = chat.lastElementChild.querySelector(".markdown-content");
  last.innerHTML = "";
  let i = 0;

  const typing = setInterval(() => {
    if (i < text.length) {
      last.innerHTML += text[i];
      i++;
    } else {
      clearInterval(typing);
      // Convert Markdown after finished
      last.innerHTML = converter.makeHtml(text);
    }
  }, 15);
}

// 🧭 --- Input Toggle (Mic ↔ Send Button) ---
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

// 🧹 --- Clear Chat ---
window.clearChat = function () {
  const chat = document.getElementById("chat-container-scrollable");
  chat.innerHTML = "";
  document.getElementById("home-screen").classList.remove("hidden");
  chat.classList.add("hidden");
};

// ⚙️ --- Feature Placeholder ---
window.showFeatureNotAvailable = function (feature) {
  alert(`${feature} feature not available yet.`);
};

// 🎯 --- Set Prompt (Suggestion Buttons) ---
window.setPrompt = function (prompt) {
  const input = document.getElementById("chat-input");
  input.value = prompt;
  input.focus();
  checkInputStatus();
};

// 🪟 --- Initialize Icons & Enter Key ---
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  document
    .getElementById("chat-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("send-button").click();
      }
    });
});
