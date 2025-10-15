import config from "./config.js";

// Select UI elements
const langButtons = document.querySelectorAll(".lang-buttons button");
const englishBtn = langButtons[0];
const kurdishBtn = langButtons[1];
const sendBtn = document.querySelector(".send-btn");
const micBtn = document.querySelector(".mic-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const topBar = document.querySelector(".top-bar");
const themeToggle = topBar.querySelector(".icon:last-child");
const menuBtn = topBar.querySelector(".icon:first-child");

// ---------- SIDEBAR SETUP ----------
const sidebar = document.createElement("div");
sidebar.classList.add("sidebar");
sidebar.innerHTML = `
  <div class="sidebar-content">
    <h2>AI Chat</h2>
    <button class="side-btn">🌟 New Chat</button>
    <button class="side-btn">💾 Saved Chats</button>
    <button class="side-btn">⚙️ Settings</button>
    <button class="side-btn theme-toggle">🌙 Toggle Theme</button>
    <button class="side-btn lang-toggle">🌐 Change Language</button>
  </div>
`;
document.body.appendChild(sidebar);

// Overlay
const overlay = document.createElement("div");
overlay.classList.add("overlay");
document.body.appendChild(overlay);

// ---------- SIDEBAR STYLES ----------
const style = document.createElement("style");
style.textContent = `
.sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 240px;
  height: 100%;
  background-color: #11161d;
  border-right: 1px solid #222;
  padding: 20px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.4);
  transition: left 0.3s ease;
  z-index: 1001;
}
.sidebar.open {
  left: 0;
}
.sidebar h2 {
  color: #2563eb;
  margin-bottom: 16px;
  font-size: 1.2rem;
}
.side-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px;
  background: none;
  border: none;
  color: #ccc;
  font-size: 0.95rem;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.side-btn:hover {
  background-color: #1f2937;
  color: #fff;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  z-index: 1000;
}
.overlay.show {
  opacity: 1;
  visibility: visible;
}
`;
document.head.appendChild(style);

// ---------- SIDEBAR LOGIC ----------
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
});
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

// ---------- THEME TOGGLE ----------
let darkMode = true;
function toggleTheme() {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? "#0d1117" : "#f8fafc";
  document.body.style.color = darkMode ? "#fff" : "#111";
}
themeToggle.addEventListener("click", toggleTheme);
sidebar.querySelector(".theme-toggle").addEventListener("click", toggleTheme);

// ---------- LANGUAGE SWITCH ----------
let currentLang = "en";
function updateLanguage(lang) {
  currentLang = lang;
  if (lang === "ku") {
    englishBtn.classList.remove("active");
    kurdishBtn.classList.add("active");
    document.querySelector("h1").textContent = "بەخێربێیت بۆ چاتێکی AI";
    document.querySelector("p").textContent =
      "دەست بکە بە گفتوگۆکردن بە ئینگلیزی یان کوردی، بەکاربهێنە ئەمرە دەنگی، یان وێنە دروست بکە.";
    document.querySelector(".btn").textContent = "💬 پێم بڵێ دەربارەی کلتوری کوردی";
    input.placeholder = "نامەکەت بنووسە...";
  } else {
    kurdishBtn.classList.remove("active");
    englishBtn.classList.add("active");
    document.querySelector("h1").textContent = "Welcome to AI Chat";
    document.querySelector("p").textContent =
      "Start a conversation in English or Kurdish, use voice commands, or generate images";
    document.querySelector(".btn").textContent = "💬 Tell me about Kurdish culture";
    input.placeholder = "Type your message...";
  }
}
englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));
sidebar.querySelector(".lang-toggle").addEventListener("click", () => {
  updateLanguage(currentLang === "en" ? "ku" : "en");
});

// ---------- GEMINI AI CHAT ----------
async function sendToGemini(message) {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini.";
    return aiText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ Error connecting to Gemini API.";
  }
}

// ---------- MESSAGE HANDLING ----------
sendBtn.addEventListener("click", async () => {
  const userMsg = input.value.trim();
  if (!userMsg) return;
  addMessage("user", userMsg);
  input.value = "";
  const aiReply = await sendToGemini(userMsg);
  addMessage("bot", aiReply);
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ---------- MESSAGE DISPLAY ----------
function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.innerHTML = sender === "user" ? `🙂 ${text}` : `🤖 ${text}`;
  msgDiv.style.padding = "10px 14px";
  msgDiv.style.margin = "8px";
  msgDiv.style.borderRadius = "8px";
  msgDiv.style.backgroundColor =
    sender === "user" ? "#1f2937" : "#172030";
  msgDiv.style.alignSelf = sender === "user" ? "flex-end" : "flex-start";
  main.appendChild(msgDiv);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
}

// ---------- MIC PLACEHOLDER ----------
micBtn.addEventListener("click", () => {
  alert("🎤 Voice input coming soon!");
});
