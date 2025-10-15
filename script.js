import config from "./config.js";

// ---------- ELEMENTS ----------
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const micBtn = document.querySelector(".mic-btn");
const body = document.body;

// ---------- LANGUAGE SUPPORT ----------
let currentLang = "en";

const translations = {
  en: {
    title: "Welcome to AI Chat",
    description: "Start a conversation in English or Kurdish, use voice commands, or generate images",
    buttonText: "💬 Tell me about Kurdish culture",
    placeholder: "Type your message..."
  },
  ku: {
    title: "بەخێربێیت بۆ چاتی AI",
    description: "گفتوگۆیەک دەستپێبکە بە ئینگلیزی یان کوردی، بەدەنگ قسە بکە یان وێنە دروست بکە",
    buttonText: "💬 پێم بڵێ سەبارەت بە کەلتووری کوردی",
    placeholder: "پەیامەکت بنووسە..."
  }
};

function updateLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.querySelector("h1").textContent = t.title;
  document.querySelector("p").textContent = t.description;
  document.querySelector(".btn").textContent = t.buttonText;
  input.placeholder = t.placeholder;

  englishBtn.classList.toggle("active", lang === "en");
  kurdishBtn.classList.toggle("active", lang === "ku");
}

englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));

// ---------- SIDEBAR ----------
const sidebar = document.createElement("div");
sidebar.className = "sidebar";
sidebar.innerHTML = `
  <h2>AI Chat</h2>
  <ul>
    <li>🌟 New Chat</li>
    <li>💾 Saved Chats</li>
    <li>⚙️ Settings</li>
    <li>🌙 Toggle Theme</li>
    <li>🌐 Change Language</li>
  </ul>
`;
document.body.appendChild(sidebar);

const menuBtn = document.querySelector(".top-left .icon:first-child");
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// ---------- SIDEBAR STYLE ----------
const style = document.createElement("style");
style.textContent = `
.sidebar {
  position: fixed;
  top: 0; left: -260px;
  width: 240px;
  height: 100%;
  background-color: #0f172a;
  color: #fff;
  padding: 20px;
  transition: left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.4);
  z-index: 1000;
}
.sidebar.open {
  left: 0;
}
.sidebar h2 {
  color: #3b82f6;
  margin-bottom: 20px;
}
.sidebar ul {
  list-style: none;
}
.sidebar li {
  margin: 15px 0;
  cursor: pointer;
  font-size: 16px;
}
.sidebar li:hover {
  color: #3b82f6;
}
`;
document.head.appendChild(style);

// ---------- CHAT MESSAGES ----------
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;
  msg.style.margin = "8px";
  msg.style.textAlign = role === "user" ? "right" : "left";
  msg.style.color = role === "user" ? "#60a5fa" : "#ccc";
  main.appendChild(msg);
  main.scrollTo({ top: main.scrollHeight, behavior: "smooth" });
}

// ---------- SEND MESSAGE ----------
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";

  const aiReply = await sendToGemini(text);
  addMessage("bot", aiReply);
});

// ---------- GEMINI TEXT API ----------
async function sendToGemini(userText) {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${userText} (${currentLang})` }] }],
        }),
      }
    );

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response received.";
    return aiText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ Error connecting to AI.";
  }
}

// ---------- IMAGE UPLOAD FEATURE ----------
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Change mic icon to 📷
micBtn.textContent = "📷";

micBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imgURL = URL.createObjectURL(file);
  const imgPreview = document.createElement("img");
  imgPreview.src = imgURL;
  imgPreview.style.maxWidth = "180px";
  imgPreview.style.borderRadius = "10px";
  imgPreview.style.margin = "8px";
  addMessage("user", "🖼️ Uploaded an image:");
  main.appendChild(imgPreview);

  const base64 = await fileToBase64(file);
  const aiReply = await sendImageToGemini(base64);
  addMessage("bot", aiReply);
});

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
}

async function sendImageToGemini(base64Image) {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `Describe this image in ${currentLang === "ku" ? "Kurdish" : "English"}:` },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No description received.";
    return aiText;
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    return "⚠️ Error analyzing image.";
  }
}
