import config from "./config.js";

// Elements
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menu-btn");
const closeSidebarBtn = document.getElementById("closeSidebar");
const homeBtn = document.getElementById("home-btn");
const themeToggle = document.getElementById("theme-toggle");
const speakerBtn = document.getElementById("speaker-btn");
const uploadBtn = document.getElementById("upload-btn");
const languageEnglish = document.getElementById("lang-en");
const languageKurdish = document.getElementById("lang-ku");

// Global state
let darkMode = true;
let currentLanguage = "en";
let isSpeaking = false;

// ------------------ Sidebar Controls ------------------
menuBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
});

closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

homeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  chatBox.innerHTML = `
    <div class="welcome">
      <h2>Welcome to AI Chat</h2>
      <p>Start a conversation in English or Kurdish, or upload an image.</p>
    </div>
  `;
});

// ------------------ Theme Toggle ------------------
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("light-theme", !darkMode);
});

// ------------------ Language Switch ------------------
languageEnglish.addEventListener("click", () => {
  currentLanguage = "en";
  alert("Language changed to English 🇬🇧");
});

languageKurdish.addEventListener("click", () => {
  currentLanguage = "ku";
  alert("زمان بە کوردی گۆڕدرا 🇹🇯");
});

// ------------------ Text to Speech ------------------
function speakText(text) {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage === "ku" ? "ku" : "en-US";
  utterance.rate = 1;
  isSpeaking = true;
  utterance.onend = () => (isSpeaking = false);
  window.speechSynthesis.speak(utterance);
}

speakerBtn.addEventListener("click", () => {
  const lastMessage = chatBox.querySelector(".ai-message:last-child");
  if (lastMessage) speakText(lastMessage.textContent);
});

// ------------------ Image Upload ------------------
uploadBtn.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result.split(",")[1];
    addMessage("user", "📷 Image uploaded. Analyzing...");
    const response = await queryGemini(`Analyze this image: ${file.name}`, base64Image);
    addMessage("ai", response);
  };
  reader.readAsDataURL(file);
});

// ------------------ Send Message ------------------
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  addThinking();
  const response = await queryGemini(message);
  removeThinking();
  addMessage("ai", response);
});

// ------------------ Display Messages ------------------
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add(`${sender}-message`);
  div.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addThinking() {
  const div = document.createElement("div");
  div.classList.add("thinking");
  div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeThinking() {
  const t = chatBox.querySelector(".thinking");
  if (t) t.remove();
}

// ------------------ Gemini API Request ------------------
async function queryGemini(prompt, imageBase64 = null) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, imageBase64, lang: currentLanguage }),
    });

    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    if (data.error) return `⚠️ Error: ${data.error}`;
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response received from Gemini.";

    return text;
  } catch (err) {
    console.error(err);
    return "❌ Failed to connect to Gemini AI. Please check your configuration.";
  }
}
