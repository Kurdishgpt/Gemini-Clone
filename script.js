// --- Import Gemini config ---
import config from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  // --- Elements ---
  const engBtn = document.querySelector(".lang-buttons button:first-child");
  const kurdBtn = document.querySelector(".lang-buttons button:last-child");
  const themeIcon = document.querySelector(".top-right .icon:last-child");
  const soundIcon = document.querySelector(".top-right .icon:first-child");
  const micBtn = document.querySelector(".mic-btn");
  const micSvg = micBtn?.querySelector("svg");
  const inputEl = document.querySelector(".input-area input");
  const sendBtn = document.querySelector(".send-btn");
  const mainBtn = document.querySelector(".btn");
  const titleEl = document.querySelector("main h1");
  const descEl = document.querySelector("main p");

  // --- Language data ---
  const TEXT = {
    English: {
      dir: "ltr",
      title: "Welcome to AI Chat",
      desc: "Start a conversation in English or Kurdish, use voice commands, or generate images.",
      button: "💬 Tell me about Kurdish culture",
      placeholder: "Type your message...",
      error: "⚠️ No response from Gemini.",
    },
    Kurdish: {
      dir: "rtl",
      title: "بەخێربێیت بۆ چاتی AI",
      desc: "دەست بکە بە گفتوگۆکردن بە ئینگلیزی یان کوردی، بەکاربەرە دەنگ یان وێنە دروست بکە.",
      button: "💬 پێم بڵێ لەسەر کەلتووری کوردی",
      placeholder: "پەیامێکت بنووسە...",
      error: "⚠️ وەڵامێک نەهاتوو لە Gemini.",
    }
  };

  // --- Language state ---
  function setLanguage(lang) {
    const t = TEXT[lang];
    document.documentElement.dir = t.dir;
    titleEl.textContent = t.title;
    descEl.textContent = t.desc;
    mainBtn.textContent = t.button;
    inputEl.placeholder = t.placeholder;
    engBtn.classList.toggle("active", lang === "English");
    kurdBtn.classList.toggle("active", lang === "Kurdish");
    localStorage.setItem("ai-chat-lang", lang);
  }

  const savedLang = localStorage.getItem("ai-chat-lang") || "English";
  setLanguage(savedLang);

  engBtn.onclick = () => setLanguage("English");
  kurdBtn.onclick = () => setLanguage("Kurdish");

  // --- Theme toggle ---
  let darkMode = true;
  function applyTheme() {
    document.body.className = darkMode ? "dark" : "light";
    themeIcon.textContent = darkMode ? "☀️" : "🌙";
    localStorage.setItem("ai-theme", darkMode ? "dark" : "light");
  }
  themeIcon.onclick = () => { darkMode = !darkMode; applyTheme(); };
  if (localStorage.getItem("ai-theme") === "light") darkMode = false;
  applyTheme();

  // --- Sound toggle ---
  let soundOn = true;
  soundIcon.onclick = () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
  };

  // --- Mic button animation ---
  let listening = false;
  micBtn.onclick = () => {
    listening = !listening;
    if (micSvg) micSvg.style.stroke = listening ? "#ef4444" : "#9ca3af";
  };

  // --- Chat Box ---
  const chatBox = document.createElement("div");
  chatBox.className = "chat-box";
  chatBox.style.display = "flex";
  chatBox.style.flexDirection = "column";
  chatBox.style.gap = "8px";
  chatBox.style.margin = "10px auto";
  chatBox.style.maxWidth = "400px";
  document.querySelector("main").appendChild(chatBox);

  // --- Message render helper ---
  function addMessage(text, sender = "ai") {
    const div = document.createElement("div");
    div.textContent = (sender === "user" ? "🧑 " : "🤖 ") + text;
    div.style.padding = "8px 10px";
    div.style.borderRadius = "8px";
    div.style.maxWidth = "85%";
    div.style.alignSelf = sender === "user" ? "flex-end" : "flex-start";
    div.style.background = sender === "user" ? "#1e40af" : "#1e293b";
    div.style.color = "#fff";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // --- Gemini API ---
  async function sendToGemini(prompt) {
    const lang = localStorage.getItem("ai-chat-lang") || "English";
    addMessage(prompt, "user");
    const sysPrompt = lang === "Kurdish"
      ? "تکایە بە زمانی کوردی (سۆرانی) وەڵام بدە."
      : "Please respond in English.";

    try {
      const res = await fetch(
        `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: sysPrompt }] },
              { parts: [{ text: prompt }] }
            ],
            generationConfig: {
              temperature: config.TEMPERATURE,
              maxOutputTokens: config.MAX_TOKENS
            }
          })
        }
      );

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || TEXT[lang].error;
      addMessage(reply, "ai");
    } catch (e) {
      console.error("Gemini Error:", e);
      addMessage(TEXT[lang].error, "ai");
    }
  }

  // --- Send message events ---
  function handleSend() {
    const msg = inputEl.value.trim();
    if (!msg) return;
    sendToGemini(msg);
    inputEl.value = "";
  }

  sendBtn.onclick = handleSend;
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });

  // --- Main button click ---
  mainBtn.onclick = () => {
    const lang = localStorage.getItem("ai-chat-lang") || "English";
    const text = lang === "Kurdish"
      ? "پێشکەشکردن: زانیاری لەبارەی کەلتووری کوردی بە زوویی دەگات."
      : "Coming soon: AI will tell you about Kurdish culture!";
    alert(text);
  };
});
