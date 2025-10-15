// --- Optional: import config if you have config.js ---
import { CONFIG } from "./config.js";

// --- DOM Elements ---
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

// ========== SIDEBAR ==========
clipboardBtn?.addEventListener("click", () => {
  sidebar?.classList.add("active");
});
closeSidebarBtn?.addEventListener("click", () => {
  sidebar?.classList.remove("active");
});

// ========== HOME BUTTON ==========
homeBtn?.addEventListener("click", showHomeScreen);

function showHomeScreen() {
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
}

// ========== THEME TOGGLE ==========
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ========== SPEAKER ==========
speakerBtn?.addEventListener("click", () => {
  const lastMessage = document.querySelector(".ai-response:last-child");
  if (!lastMessage) return;
  const text = lastMessage.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
});

// ========== LANGUAGE SWITCH ==========
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
  const h1 = document.querySelector("h1");
  const p = document.querySelector("p");
  if (!h1 || !p) return;
  if (lang === "en") {
    h1.textContent = "Welcome to Kurdish GPT";
    p.textContent = "Start a conversation in English or Kurdish, or upload images to enhance them.";
  } else {
    h1.textContent = "بەخێربێیت بۆ کوردیش GPT";
    p.textContent = "گفتوگۆ بکە بە ئینگلیزی یان کوردی، یان وێنە باربکە بۆ چاککردن.";
  }
}

// ========== SEND MESSAGE ==========
sendBtn?.addEventListener("click", async () => {
  const message = inputField.value.trim();
  if (!message) return;
  appendMessage("user", message);
  inputField.value = "";

  // thinking animation
  const thinkingDiv = appendMessage("thinking", "🤔 Thinking...");
  await fakeThinking();
  thinkingDiv.remove();

  // AI response simulation
  appendMessage("ai", `🧠 Kurdish GPT: "${message}" is an interesting thought!`);
});

function appendMessage(type, text) {
  const div = document.createElement("div");
  div.classList.add(type === "ai" ? "ai-response" : type);
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
  return div;
}

function fakeThinking() {
  return new Promise((resolve) => setTimeout(resolve, 1500));
}

// ========== UPLOAD IMAGE BUTTON ==========
uploadBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 5v14m-7-7h14"/></svg>`;
uploadBtn.title = "Upload Image";

uploadBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    appendMessage("user", `📤 Uploaded: ${file.name}`);
    const thinkingDiv = appendMessage("thinking", "🪄 Enhancing image...");
    setTimeout(() => {
      thinkingDiv.remove();
      appendMessage("ai", "✨ Image enhanced beautifully!");
    }, 2000);
  };
  input.click();
});

// ========== INITIAL HOME SCREEN ==========
showHomeScreen();
