import config from "./config.js";

// ---------- ELEMENTS ----------
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const uploadBtn = document.querySelector(".mic-btn"); // now for images
const sidebarBtn = document.querySelector(".top-left .icon:nth-child(1)"); // 📋
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)"); // 🏠
const speakerBtn = document.querySelector(".top-right .icon:nth-child(1)");
const themeBtn = document.querySelector(".top-right .icon:nth-child(2)");
const body = document.body;

let currentLang = "en";
let isDarkMode = true;
let lastBotMessage = "";
let savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]");

// ---------- ADD STYLES ----------
const style = document.createElement("style");
style.textContent = `
.message {
  padding: 10px 14px;
  border-radius: 14px;
  margin: 8px;
  max-width: 85%;
  line-height: 1.5;
  word-wrap: break-word;
  animation: fadeIn 0.3s ease;
}
.message.user {
  background: #2563eb;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.message.bot {
  background: #1f2937;
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
}
.thinking {
  background: transparent;
  margin: 10px;
  display: flex;
  align-items: center;
}
.dot {
  width: 8px;
  height: 8px;
  background-color: #9ca3af;
  border-radius: 50%;
  margin: 0 3px;
  opacity: 0.3;
  animation: blink 1.4s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.sidebar {
  position: fixed;
  top: 0; left: -260px;
  width: 240px;
  height: 100%;
  background-color: #111827;
  color: #fff;
  transition: left 0.3s ease;
  padding: 20px;
  z-index: 9999;
  box-shadow: 3px 0 10px rgba(0,0,0,0.3);
}
.sidebar.open { left: 0; }
.sidebar h2 { color: #3b82f6; margin-bottom: 20px; }
.sidebar ul { list-style: none; padding: 0; }
.sidebar li { margin: 12px 0; cursor: pointer; }
.sidebar li:hover { color: #3b82f6; transform: translateX(4px); transition: 0.2s; }

.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  z-index: 9998;
}
.overlay.active {
  opacity: 1;
  visibility: visible;
}
`;
document.head.appendChild(style);

// ---------- TRANSLATIONS ----------
const translations = {
  en: {
    title: "Welcome to AI Chat",
    description: "Start a conversation, upload images, or use the menu.",
    placeholder: "Type your message...",
  },
  ku: {
    title: "بەخێربێیت بۆ چاتی AI",
    description: "گفتوگۆیەک دەستپێبکە، وێنە بەرز بکە یان لیستی لاوەکە بەکاربەرە.",
    placeholder: "پەیامەکت بنووسە...",
  },
};

// ---------- SIDEBAR + OVERLAY ----------
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
document.body.appendChild(sidebar);

const overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

function renderSidebar() {
  const items = ["🌟 New Chat", "💾 Saved Chats", "⚙️ Settings", "🌙 Toggle Theme", "🌐 Change Language"];
  sidebar.innerHTML = `
    <h2>AI Chat</h2>
    <ul>${items.map((i, idx) => `<li data-action="${idx}">${i}</li>`).join("")}</ul>
  `;
}
renderSidebar();

// Open/Close sidebar
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("active");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
}

sidebarBtn.addEventListener("click", openSidebar);
overlay.addEventListener("click", closeSidebar);

// ---------- HOME ----------
homeBtn.addEventListener("click", () => {
  closeSidebar();
  renderWelcome();
});

// Sidebar actions
sidebar.addEventListener("click", (e) => {
  if (e.target.tagName !== "LI") return;
  const idx = parseInt(e.target.dataset.action);
  closeSidebar();
  if (idx === 0) main.innerHTML = "";
  if (idx === 1) showSavedChats();
  if (idx === 2) addMessage("bot", "⚙️ Settings coming soon...");
  if (idx === 3) toggleTheme();
  if (idx === 4) updateLanguage(currentLang === "en" ? "ku" : "en");
});

// ---------- LANGUAGE ----------
function updateLanguage(lang) {
  currentLang = lang;
  englishBtn.classList.toggle("active", lang === "en");
  kurdishBtn.classList.toggle("active", lang === "ku");
  renderWelcome();
}
englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));

// ---------- WELCOME ----------
function renderWelcome() {
  const t = translations[currentLang];
  main.innerHTML = `
    <div class="welcome">
      <h1>${t.title}</h1>
      <p>${t.description}</p>
    </div>
  `;
}
renderWelcome();

// ---------- CHAT ----------
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  main.appendChild(div);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
  if (role === "bot") lastBotMessage = text;
}

function showThinking() {
  const think = document.createElement("div");
  think.className = "thinking";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    think.appendChild(dot);
  }
  main.appendChild(think);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
  return think;
}

async function typeText(el, text, delay = 20) {
  el.textContent = "";
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await new Promise((r) => setTimeout(r, delay));
  }
}

// ---------- GEMINI ----------
async function sendToGemini(prompt) {
  try {
    const res = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt} (${currentLang})` }] }],
        }),
      }
    );
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini."
    );
  } catch (err) {
    console.error(err);
    return "⚠️ Error connecting to Gemini.";
  }
}

// ---------- SEND ----------
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";

  const thinking = showThinking();
  const reply = await sendToGemini(text);
  thinking.remove();

  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  main.appendChild(botMsg);
  await typeText(botMsg, reply);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
  savedChats.push(reply);
  localStorage.setItem("savedChats", JSON.stringify(savedChats));
});

// ---------- SAVED CHATS ----------
function showSavedChats() {
  if (!savedChats.length) {
    addMessage("bot", "💾 No saved chats yet.");
    return;
  }
  const html = savedChats
    .map((msg, i) => `<div>💬 <b>${i + 1}.</b> ${msg}</div>`)
    .join("");
  addMessage("bot", `Saved Chats:\n${html}`);
}

// ---------- IMAGE UPLOAD ----------
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

uploadBtn.textContent = "📷";
uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  addMessage("user", "🖼️ Image uploaded...");
  const base64 = await fileToBase64(file);
  const reply = await sendImageToGemini(base64);
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  main.appendChild(botMsg);
  await typeText(botMsg, reply);
});

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(",")[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

async function sendImageToGemini(base64) {
  const res = await fetch(
    `${config.API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Describe this image in ${
                  currentLang === "ku" ? "Kurdish" : "English"
                }:`,
              },
              { inline_data: { mime_type: "image/jpeg", data: base64 } },
            ],
          },
        ],
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No description.";
}

// ---------- SPEAKER ----------
speakerBtn.addEventListener("click", () => {
  if (!lastBotMessage) return;
  const utter = new SpeechSynthesisUtterance(lastBotMessage);
  utter.lang = currentLang === "ku" ? "ckb" : "en-US";
  speechSynthesis.speak(utter);
});

// ---------- THEME ----------
function toggleTheme() {
  isDarkMode = !isDarkMode;
  body.style.backgroundColor = isDarkMode ? "#0d1117" : "#f8fafc";
  body.style.color = isDarkMode ? "#fff" : "#111";
  themeBtn.textContent = isDarkMode ? "☀️" : "🌙";
}
themeBtn.addEventListener("click", toggleTheme);
