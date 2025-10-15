import config from "./config.js";

// ----------------- ELEMENTS -----------------
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const micBtn = document.querySelector(".mic-btn");
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)");
const speakerBtn = document.querySelector(".top-right .icon:nth-child(1)");
const themeBtn = document.querySelector(".top-right .icon:nth-child(2)");
const body = document.body;

// ----------------- STATE -----------------
let currentLang = "en";
let isDarkMode = true;
let lastBotMessage = "";
let savedChats = JSON.parse(localStorage.getItem("savedChats") || "[]");

// ----------------- TRANSLATIONS -----------------
const translations = {
  en: {
    title: "Welcome to AI Chat",
    description:
      "Start a conversation in English or Kurdish, upload images, or use AI tools below.",
    placeholder: "Type your message...",
    buttons: [
      { icon: "🖼️", text: "Create Image", action: "createImage" },
      { icon: "🧾", text: "Summarize Text", action: "summarizeText" },
      { icon: "👁️", text: "Analyze Image", action: "analyzeImage" },
      { icon: "⚙️", text: "More", action: "moreOptions" },
    ],
    sidebar: ["🌟 New Chat", "💾 Saved Chats", "⚙️ Settings", "🌙 Toggle Theme", "🌐 Change Language"]
  },
  ku: {
    title: "بەخێربێیت بۆ چاتی AI",
    description:
      "گفتوگۆیەک دەستپێبکە بە ئینگلیزی یان کوردی، وێنە بەرز بکە یان ئەم ئامرازانە بەکاربەرە:",
    placeholder: "پەیامەکت بنووسە...",
    buttons: [
      { icon: "🖼️", text: "دروستکردنی وێنە", action: "createImage" },
      { icon: "🧾", text: "پوختەکردنی دەق", action: "summarizeText" },
      { icon: "👁️", text: "شیکردنەوەی وێنە", action: "analyzeImage" },
      { icon: "⚙️", text: "زیاتر", action: "moreOptions" },
    ],
    sidebar: ["🌟 گفتوگۆی نوێ", "💾 گفتوگۆی پارێزراو", "⚙️ ڕێکخستن", "🌙 گۆڕینی ڕووکار", "🌐 گۆڕینی زمان"]
  },
};

// ----------------- SIDEBAR -----------------
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
document.body.appendChild(sidebar);

const sidebarStyle = document.createElement("style");
sidebarStyle.textContent = `
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
}
.sidebar.open { left: 0; }
.sidebar h2 { color: #3b82f6; margin-bottom: 20px; }
.sidebar ul { list-style: none; padding: 0; }
.sidebar li { margin: 12px 0; cursor: pointer; }
.sidebar li:hover { color: #3b82f6; }
`;
document.head.appendChild(sidebarStyle);

function renderSidebar() {
  const t = translations[currentLang];
  sidebar.innerHTML = `
    <h2>AI Chat</h2>
    <ul>
      ${t.sidebar.map((item, i) => `<li data-action="${i}">${item}</li>`).join("")}
    </ul>
  `;
}
renderSidebar();

homeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

sidebar.addEventListener("click", (e) => {
  if (e.target.tagName !== "LI") return;
  const action = e.target.dataset.action;
  sidebar.classList.remove("open");
  handleSidebarAction(parseInt(action));
});

function handleSidebarAction(i) {
  switch (i) {
    case 0: // New Chat
      main.innerHTML = "";
      lastBotMessage = "";
      addMessage("bot", "🆕 New chat started.");
      break;
    case 1: // Saved Chats
      showSavedChats();
      break;
    case 2: // Settings
      addMessage("bot", "⚙️ Settings are currently default.");
      break;
    case 3: // Toggle Theme
      toggleTheme();
      break;
    case 4: // Change Language
      updateLanguage(currentLang === "en" ? "ku" : "en");
      break;
  }
}

// ----------------- LANGUAGE -----------------
function renderWelcome() {
  const t = translations[currentLang];
  main.innerHTML = `
    <h1>${t.title}</h1>
    <p>${t.description}</p>
    <div class="feature-buttons"></div>
  `;
  const container = main.querySelector(".feature-buttons");
  t.buttons.forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "feature-btn";
    btn.dataset.action = b.action;
    btn.textContent = `${b.icon} ${b.text}`;
    container.appendChild(btn);
  });
  renderSidebar();
}

function updateLanguage(lang) {
  currentLang = lang;
  englishBtn.classList.toggle("active", lang === "en");
  kurdishBtn.classList.toggle("active", lang === "ku");
  renderWelcome();
}
englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));
renderWelcome();

// ----------------- FEATURE BUTTONS -----------------
main.addEventListener("click", (e) => {
  if (e.target.classList.contains("feature-btn")) {
    const action = e.target.dataset.action;
    if (action === "createImage")
      addMessage("bot", "🖼️ Type what image you want me to create.");
    if (action === "summarizeText")
      addMessage("bot", "🧾 Paste text for summarization.");
    if (action === "analyzeImage")
      addMessage("bot", "👁️ Upload an image to analyze.");
    if (action === "moreOptions")
      addMessage("bot", "⚙️ More features coming soon...");
  }
});

// ----------------- CHAT -----------------
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = role;
  div.textContent = text;
  div.style.textAlign = role === "user" ? "right" : "left";
  div.style.margin = "8px";
  div.style.color = role === "user" ? "#60a5fa" : "#ccc";
  main.appendChild(div);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });

  if (role === "bot" && text && text.length > 10) {
    savedChats.push(text);
    localStorage.setItem("savedChats", JSON.stringify(savedChats));
  }
}

// ----------------- SAVED CHATS -----------------
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

// ----------------- GEMINI -----------------
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
    return "⚠️ Error contacting Gemini.";
  }
}

// ----------------- SEND MESSAGE -----------------
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  const reply = await sendToGemini(text);
  addMessage("bot", reply);
  lastBotMessage = reply;
});

// ----------------- IMAGE UPLOAD -----------------
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

micBtn.textContent = "📷";
micBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  addMessage("user", "🖼️ Image uploaded...");
  const base64 = await fileToBase64(file);
  const reply = await sendImageToGemini(base64);
  addMessage("bot", reply);
  lastBotMessage = reply;
});

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => res(reader.result.split(",")[1]);
    reader.onerror = rej;
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

// ----------------- SPEAKER -----------------
speakerBtn.addEventListener("click", () => {
  if (!lastBotMessage) return;
  const utter = new SpeechSynthesisUtterance(lastBotMessage);
  utter.lang = currentLang === "ku" ? "ckb" : "en-US";
  speechSynthesis.speak(utter);
});

// ----------------- THEME TOGGLE -----------------
function toggleTheme() {
  isDarkMode = !isDarkMode;
  body.style.backgroundColor = isDarkMode ? "#0d1117" : "#f8fafc";
  body.style.color = isDarkMode ? "#fff" : "#111";
  themeBtn.textContent = isDarkMode ? "☀️" : "🌙";
}
themeBtn.addEventListener("click", toggleTheme);
