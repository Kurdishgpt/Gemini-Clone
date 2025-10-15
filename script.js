// --- CONFIG IMPORT (optional external config.js) ---
import { CONFIG } from "./config.js";

// --- DOM ELEMENTS ---
const englishBtn = document.querySelector(".lang-buttons button:first-child");
const kurdishBtn = document.querySelector(".lang-buttons button:last-child");
const sidebar = document.getElementById("sidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");
const clipboardBtn = document.querySelector(".top-left .icon:first-child");
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)");
const speakerBtn = document.querySelector(".top-right .icon:first-child");
const themeBtn = document.querySelector(".top-right .icon:last-child");
const sendBtn = document.querySelector(".send-btn");
const inputField = document.querySelector(".input-area input");
const chatArea = document.querySelector("main");
const uploadBtn = document.querySelector(".mic-btn");

// ---------- SIDEBAR ----------
clipboardBtn?.addEventListener("click", () => {
  sidebar?.classList.add("active");
});
closeSidebarBtn?.addEventListener("click", () => {
  sidebar?.classList.remove("active");
});

// ---------- HOME BUTTON ----------
homeBtn?.addEventListener("click", () => {
  chatArea.innerHTML = `
    <div class="chat-icon">
      <svg viewBox="0 0 24 24" width="48" height="48">
        <path fill="currentColor" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>
    <h1>Welcome to Kurdish GPT</h1>
    <p>Start a conversation in English or Kurdish, or upload images to enhance them.</p>
    <button class="example-btn">💬 Tell me about Kurdish culture</button>
  `;
});

// ---------- THEME TOGGLE ----------
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ---------- SPEAKER ----------
speakerBtn?.addEventListener("click", () => {
  const lastMessage = document.querySelector(".ai-response:last-child");
  if (!lastMessage) return;
  const utterance = new SpeechSynthesisUtterance(lastMessage.textContent);
  speechSynthesis.speak(utterance);
});

// ---------- LANGUAGE SWITCH ----------
englishBtn?.addEventListener("click", () => {
  englishBtn.classList.add("active");
  kurdishBtn.classList.remove("active");
  updateLanguage("en");
});

kurdishBtn?.addEventListener("click", () => {
  kurdishBtn.classList.add("active");
  englishBtn.classList.remove("active");
  updateLanguage("ku");
});

function updateLanguage(lang) {
  const title = document.querySelector("h1");
  const desc = document.querySelector("p");
  if (!title || !desc) return;

  if (lang === "en") {
    title.textContent = "Welcome to Kurdish GPT";
    desc.textContent = "Start a conversation in English or Kurdish, or upload images to enhance them.";
  } else {
    title.textContent = "بەخێربێیت بۆ کوردیش GPT";
    desc.textContent = "گفتوگۆ بکە بە ئینگلیزی یان کوردی، یان وێنە باربکە بۆ چاککردن.";
  }
}

// ---------- SEND MESSAGE ----------
sendBtn?.addEventListener("click", async () => {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;
  appendMessage("user", userMessage);
  inputField.value = "";

  appendMessage("thinking", "🤔 Thinking...");

  // Simulate AI response (replace with API if needed)
  setTimeout(() => {
    document.querySelector(".thinking")?.remove();
    appendMessage("ai", `🧠 Kurdish GPT says: "${userMessage}" is an interesting question!`);
  }, 1500);
});

// ---------- APPEND MESSAGES ----------
function appendMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add(sender === "ai" ? "ai-response" : sender);
  message.textContent = text;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ---------- UPLOAD IMAGE (Replace mic with Upload) ----------
uploadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 5v14m-7-7h14"/></svg>`;
uploadBtn.title = "Upload image";

uploadBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    appendMessage("user", `📤 Uploaded: ${file.name}`);
    appendMessage("thinking", "🪄 Enhancing image...");
    setTimeout(() => {
      document.querySelector(".thinking")?.remove();
      appendMessage("ai", "✨ Image enhanced beautifully!");
    }, 2000);
  };
  input.click();
});
