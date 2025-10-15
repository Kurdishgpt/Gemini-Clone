// script.js

document.addEventListener("DOMContentLoaded", () => {

  // --- Elements ---
  const langBtns = document.querySelectorAll(".lang-buttons button");
  const engBtn = document.querySelector(".lang-buttons button:first-child");
  const kurdBtn = document.querySelector(".lang-buttons button:last-child");
  const titleEl = document.querySelector("main h1");
  const descEl = document.querySelector("main p");
  const mainBtn = document.querySelector(".btn");
  const inputEl = document.querySelector(".input-area input");
  const themeIcon = document.querySelector(".top-right .icon:last-child");
  const soundIcon = document.querySelector(".top-right .icon:first-child");
  const micBtnWrap = document.querySelector(".mic-btn");
  const micSvg = micBtnWrap ? micBtnWrap.querySelector("svg") : null;
  const sendBtn = document.querySelector(".send-btn");
  const topLeftIcons = document.querySelectorAll(".top-left .icon");

  // --- Config fallback ---
  const APP_CONFIG = typeof CONFIG !== "undefined" ? CONFIG : {
    defaultLanguage: "English",
    darkMode: true,
    appName: "AI Chat"
  };

  // --- Text content for languages ---
  const TEXT = {
    English: {
      dir: "ltr",
      title: "Welcome to AI Chat",
      desc: "Start a conversation in English or Kurdish, use voice commands, or generate images",
      button: "💬 Tell me about Kurdish culture",
      placeholder: "Type your message..."
    },
    Kurdish: {
      dir: "rtl",
      title: "بەخێربێیت بۆ چاتی AI",
      desc: "دەست بکە بە گفتوگۆکردن بە ئینگلیزی یان کوردی، بەکاربەرە دەنگ یا وێنە دروست بکە",
      button: "💬 پێم بڵێ لەسەر کەلتووری کوردی",
      placeholder: "پەیامێکت بنووسە..."
    }
  };

  // --- Helpers ---
  function setLanguage(lang) {
    if (!TEXT[lang]) return;
    langBtns.forEach(b =>
      b.classList.toggle("active", b.textContent.trim() === (lang === "English" ? "English" : "کوردی"))
    );
    const t = TEXT[lang];
    titleEl.textContent = t.title;
    descEl.textContent = t.desc;
    mainBtn.textContent = t.button;
    inputEl.placeholder = t.placeholder;
    document.documentElement.lang = lang === "English" ? "en" : "ku";
    document.documentElement.dir = t.dir;
    document.body.dir = t.dir;
    try { localStorage.setItem("ai-chat-lang", lang); } catch (e) {}
  }

  function loadLanguageFromStorageOrConfig() {
    let stored = null;
    try { stored = localStorage.getItem("ai-chat-lang"); } catch (e) { stored = null; }
    if (stored && TEXT[stored]) return stored;
    return APP_CONFIG.defaultLanguage === "Kurdish" ? "Kurdish" : "English";
  }

  const initialLang = loadLanguageFromStorageOrConfig();
  setLanguage(initialLang);
  engBtn.addEventListener("click", () => setLanguage("English"));
  kurdBtn.addEventListener("click", () => setLanguage("Kurdish"));

  // --- THEME TOGGLE ---
  let darkMode = APP_CONFIG.darkMode;
  function applyTheme() {
    if (darkMode) {
      document.body.style.backgroundColor = "#0d1117";
      document.body.style.color = "#fff";
      themeIcon.textContent = "☀️";
    } else {
      document.body.style.backgroundColor = "#f4f4f4";
      document.body.style.color = "#000";
      themeIcon.textContent = "🌙";
    }
    try { localStorage.setItem("ai-chat-theme", darkMode ? "dark" : "light"); } catch (e) {}
  }
  themeIcon.addEventListener("click", () => {
    darkMode = !darkMode;
    applyTheme();
  });
  (function loadTheme() {
    try {
      const saved = localStorage.getItem("ai-chat-theme");
      if (saved === "dark") darkMode = true;
      else if (saved === "light") darkMode = false;
    } catch (e) {}
    applyTheme();
  })();

  // --- SOUND ICON toggle ---
  let soundOn = true;
  soundIcon.addEventListener("click", () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
  });

  // --- MIC animation toggle ---
  let listening = false;
  micBtnWrap.addEventListener("click", () => {
    listening = !listening;
    micSvg.style.stroke = listening ? "#ef4444" : "#9ca3af";
    console.log("Mic listening:", listening);
  });

  // --- CHAT BOX (create dynamically) ---
  const chatBox = document.createElement("div");
  chatBox.classList.add("chat-box");
  chatBox.style.width = "90%";
  chatBox.style.maxWidth = "400px";
  chatBox.style.margin = "10px auto";
  chatBox.style.display = "flex";
  chatBox.style.flexDirection = "column";
  chatBox.style.gap = "8px";
  chatBox.style.fontSize = "0.95rem";
  document.querySelector("main").appendChild(chatBox);

  // --- SEND MESSAGE ---
  function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg) return;

    const userMsg = document.createElement("div");
    userMsg.textContent = "🧑 " + msg;
    userMsg.style.textAlign = document.body.dir === "rtl" ? "left" : "right";
    userMsg.style.background = darkMode ? "#1e293b" : "#e0e7ff";
    userMsg.style.padding = "8px 10px";
    userMsg.style.borderRadius = "8px";
    chatBox.appendChild(userMsg);

    inputEl.style.borderColor = "#2563eb";
    setTimeout(() => (inputEl.style.borderColor = ""), 300);
    inputEl.value = "";

    // Fake AI response
    const aiMsg = document.createElement("div");
    aiMsg.textContent = document.body.dir === "rtl" ? "🤖 سوپاس بۆ پەیامەکەت!" : "🤖 Got it!";
    aiMsg.style.textAlign = document.body.dir === "rtl" ? "right" : "left";
    aiMsg.style.background = darkMode ? "#172030" : "#dbeafe";
    aiMsg.style.padding = "8px 10px";
    aiMsg.style.borderRadius = "8px";
    setTimeout(() => chatBox.appendChild(aiMsg), 600);
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // --- main button ---
  mainBtn.addEventListener("click", () => {
    const lang = localStorage.getItem("ai-chat-lang") === "Kurdish" ? "Kurdish" : "English";
    if (lang === "Kurdish") {
      alert("پێشکەشکردن: زانیاری لەبارەی کەلتووری کوردی بە زوویی دەگات.");
    } else {
      alert("Coming soon: AI will tell you about Kurdish culture!");
    }
  });

  // --- top-left icons ---
  if (topLeftIcons.length >= 2) {
    topLeftIcons[0].addEventListener("click", () => alert("📋 Menu clicked"));
    topLeftIcons[1].addEventListener("click", () => alert("🏠 Home clicked"));
  }

});
