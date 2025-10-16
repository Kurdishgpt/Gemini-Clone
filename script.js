import config from "./config.js";

// ---------- ELEMENTS ----------
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const uploadBtn = document.querySelector(".mic-btn");
const sidebarBtn = document.querySelector(".top-left .icon:nth-child(1)");
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)");
const speakerBtn = document.querySelector(".top-right .icon:nth-child(1)");
const themeBtn = document.querySelector(".top-right .icon:nth-child(2)");
const body = document.body;

let currentLang = "en";
let isDarkMode = true;
let lastBotMessage = "";
let savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]");
let selectedVoice = "SIDAR";
let selectedGender = "male";

// ---------- STYLE ----------
const style = document.createElement("style");
style.textContent = `
.voice-options {
  padding: 10px;
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 12px;
  margin: 10px;
  text-align: center;
}
.voice-options button {
  background: #374151;
  color: #fff;
  border: none;
  margin: 4px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
}
.voice-options button.active {
  background: #3b82f6;
}
`;
document.head.appendChild(style);

// ---------- TRANSLATIONS ----------
const translations = {
  en: {
    title: "Welcome to Kurdish GPT",
    description: "Start chatting, upload images, or generate Kurdish voice!",
    placeholder: "Type your message...",
  },
  ku: {
    title: "بەخێربێیت بۆ کوردیش GPT",
    description: "گفتوگۆیەک دەستپێبکە، وێنە بەرز بکە یان دەنگێکی کوردی دروست بکە.",
    placeholder: "پەیامەکت بنووسە...",
  },
};

// ---------- SIDEBAR ----------
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
document.body.appendChild(sidebar);

const overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);

function renderSidebar() {
  const items = ["🌟 New Chat", "💾 Saved Chats", "⚙️ Settings", "🌙 Toggle Theme", "🌐 Change Language"];
  sidebar.innerHTML = `<h2>Kurdish GPT</h2>
  <ul>${items.map((i, idx) => `<li data-action="${idx}">${i}</li>`).join("")}</ul>`;
}
renderSidebar();

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
      <div class="voice-options">
        <h3>Select Voice:</h3>
        <div>
          <button class="gender male active">Male (38)</button>
          <button class="gender female">Female (27)</button>
        </div>
        <div class="voice-list">
          <button class="voice active">SÎDAR</button>
          <button class="voice">RÊBAZ</button>
          <button class="voice">ŞAHO</button>
          <button class="voice">MÎRZA</button>
        </div>
      </div>
    </div>
  `;
  initVoiceOptions();
}

// ---------- VOICE OPTIONS ----------
function initVoiceOptions() {
  const genderButtons = document.querySelectorAll(".gender");
  const voiceButtons = document.querySelectorAll(".voice");

  genderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      genderButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedGender = btn.classList.contains("male") ? "male" : "female";
    });
  });

  voiceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      voiceButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedVoice = btn.textContent.trim();
    });
  });
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

// ---------- KURDISHTTS ----------
async function playKurdishTTS(text) {
  try {
    const response = await fetch("https://api.kurdishtts.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ed527b648f5b06abc7e2a566c9501c795467a1e4"
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        gender: selectedGender
      })
    });
    const data = await response.json();
    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();
    } else {
      alert("⚠️ Voice generation failed.");
    }
  } catch (err) {
    alert("⚠️ Error connecting to KurdishTTS API.");
  }
}

// ---------- SPEAKER (VOICE) ----------
speakerBtn.textContent = "🎙️";
speakerBtn.addEventListener("click", () => {
  if (!lastBotMessage) {
    alert("No text to speak.");
    return;
  }
  playKurdishTTS(lastBotMessage);
});

// ---------- THEME ----------
function toggleTheme() {
  isDarkMode = !isDarkMode;
  body.style.backgroundColor = isDarkMode ? "#0d1117" : "#f8fafc";
  body.style.color = isDarkMode ? "#fff" : "#111";
  themeBtn.textContent = isDarkMode ? "☀️" : "🌙";
}
themeBtn.addEventListener("click", toggleTheme);
