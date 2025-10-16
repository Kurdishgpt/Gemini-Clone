// ---------- IMPORT CONFIG ----------
import config from "./config.js";

// ---------- ELEMENTS ----------
const menuBtn = document.querySelector(".top-left .icon:nth-child(1)");
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)");
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const micBtn = document.querySelector(".top-right .icon:nth-child(1)");
const themeBtn = document.querySelector(".top-right .icon:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const uploadBtn = document.querySelector(".mic-btn");
const main = document.querySelector("main");
const body = document.body;

let currentLang = "en";
let isDarkMode = true;
let lastBotMessage = "";

// ---------- TRANSLATIONS ----------
const translations = {
  en: {
    title: "Welcome to Kurdish GPT",
    description: "Start a conversation, upload images, or use the menu.",
    placeholder: "Type your message...",
  },
  ku: {
    title: "بەخێربێیت بۆ Kurdish GPT",
    description: "گفتوگۆیەک دەستپێبکە، وێنە بەرز بکە یان لیستی لاوەکە بەکاربەرە.",
    placeholder: "پەیامەکت بنووسە...",
  },
};

// ---------- RENDER WELCOME ----------
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

// ---------- LANGUAGE TOGGLE ----------
function updateLanguage(lang) {
  currentLang = lang;
  englishBtn.classList.toggle("active", lang === "en");
  kurdishBtn.classList.toggle("active", lang === "ku");
  input.placeholder = translations[lang].placeholder;
  renderWelcome();
}
englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));

// ---------- THEME TOGGLE ----------
function toggleTheme() {
  isDarkMode = !isDarkMode;
  body.style.backgroundColor = isDarkMode ? "#0d1117" : "#f8fafc";
  body.style.color = isDarkMode ? "#fff" : "#111";
  themeBtn.textContent = isDarkMode ? "☀️" : "🌙";
}
themeBtn.addEventListener("click", toggleTheme);

// ---------- HOME ----------
homeBtn.addEventListener("click", renderWelcome);

// ---------- SIDEBAR ----------
menuBtn.addEventListener("click", () => {
  alert("📋 Sidebar: Coming soon!");
});

// ---------- CHAT ----------
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  main.appendChild(div);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
  if (role === "bot") lastBotMessage = text;
}

// ---------- SIMPLE BOT REPLY (for demo) ----------
async function getBotReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes("hi") || lower.includes("hello"))
    return "Hi there! 👋 How can I help you today?";
  if (lower.includes("kurdish"))
    return "Kurdish is a beautiful language! 🏔️";
  if (lower.includes("how are you"))
    return "I'm doing great, thanks for asking! 💫";
  return "That's interesting! Tell me more. 💬";
}

// ---------- SEND MESSAGE ----------
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";

  addMessage("bot", "🤔 Thinking...");
  const reply = await getBotReply(text);

  const last = main.querySelector(".message.bot:last-child");
  last.textContent = reply;
});

// ---------- IMAGE UPLOAD ----------
uploadBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) addMessage("user", `🖼️ Image uploaded: ${file.name}`);
  };
  fileInput.click();
});

// ---------- TTS MENU ----------
let voiceMenu;
micBtn.addEventListener("click", toggleVoiceMenu);

function toggleVoiceMenu() {
  if (voiceMenu) {
    voiceMenu.remove();
    voiceMenu = null;
    return;
  }
  voiceMenu = document.createElement("div");
  voiceMenu.className = "voice-menu";
  Object.assign(voiceMenu.style, {
    position: "fixed",
    right: "10px",
    top: "60px",
    background: "#1f2937",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: "1000",
  });

  const male = document.createElement("button");
  male.textContent = "🔊 Male Voice";
  styleVoiceBtn(male);
  male.onclick = () => playTTS("male");

  const female = document.createElement("button");
  female.textContent = "🎤 Female Voice";
  styleVoiceBtn(female);
  female.onclick = () => playTTS("female");

  const close = document.createElement("button");
  close.textContent = "❌ Close";
  styleVoiceBtn(close);
  close.onclick = toggleVoiceMenu;

  voiceMenu.append(male, female, close);
  document.body.appendChild(voiceMenu);
}

function styleVoiceBtn(btn) {
  Object.assign(btn.style, {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "15px",
  });
  btn.onmouseover = () => (btn.style.opacity = "0.8");
  btn.onmouseleave = () => (btn.style.opacity = "1");
}

// ---------- PLAY KURDISH TTS ----------
async function playTTS(voiceType) {
  if (!lastBotMessage) {
    addMessage("bot", "⚠️ No message to read aloud yet!");
    return;
  }
  try {
    addMessage("bot", `🎧 Playing ${voiceType} voice...`);
    const res = await fetch(
      `https://api.kurdishtts.com/v1/speak?voice=${voiceType}&text=${encodeURIComponent(
        lastBotMessage
      )}&key=${config.KURDISH_TTS_API}`
    );
    if (!res.ok) throw new Error("TTS failed");
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error(err);
    addMessage("bot", "⚠️ Kurdish TTS not available right now.");
  }
}
