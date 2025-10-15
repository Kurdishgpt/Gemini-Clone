// ✅ script.js
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

// ---------- SIDEBAR CONTROL ----------
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
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>
    <h1>Welcome to Kurdish GPT</h1>
    <p>Start a conversation in English or Kurdish, or upload images to enhance them.</p>
  `;
});

// ---------- THEME TOGGLE ----------
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ---------- SPEAKER BUTTON ----------
speakerBtn?.addEventListener("click", () => {
  const lastMessage = document.querySelector(".ai-response:last-child");
  if (!lastMessage) return;
  const text = lastMessage.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
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
  if (lang === "en") {
    document.querySelector("h1").textContent = "Welcome to Kurdish GPT";
    document.querySelector("p").textContent =
      "Start a conversation in English or Kurdish, or upload images to enhance them.";
  } else {
    document.querySelector("h1").textContent = "بەخێربێیت بۆ کوردیش GPT";
    document.querySelector("p").textContent =
      "گفتوگۆ بکە بە ئینگلیزی یان کوردی، یان وێنە باربکە بۆ چاککردن.";
  }
}

// ---------- SEND MESSAGE ----------
sendBtn?.addEventListener("click", async () => {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  inputField.value = "";

  appendMessage("thinking", "🤔 Thinking...");

  const aiText = await sendMessageToGemini(userMessage);
  document.querySelector(".thinking")?.remove();
  appendMessage("ai", aiText);
});

// ---------- APPEND MESSAGES ----------
function appendMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add(sender === "ai" ? "ai-response" : sender);
  message.textContent = text;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ---------- SEND TO GEMINI ----------
async function sendMessageToGemini(prompt) {
  try {
    const res = await fetch(
      `${CONFIG.API_BASE_URL}/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from AI.";
  } catch (err) {
    console.error(err);
    return "❌ Error connecting to Gemini AI.";
  }
}

// ---------- UPLOAD IMAGE (Replace mic button with upload) ----------
const uploadBtn = document.querySelector(".mic-btn");
uploadBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>`;
uploadBtn.addEventListener("click", handleImageUpload);

async function handleImageUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    appendMessage("user", `📤 Uploaded image: ${file.name}`);
    appendMessage("thinking", "🧠 Enhancing image...");

    // Simulate edit process (replace with real API if desired)
    setTimeout(() => {
      document.querySelector(".thinking")?.remove();
      appendMessage("ai", "✨ Image enhanced beautifully!");
    }, 2000);
  };
  fileInput.click();
}
