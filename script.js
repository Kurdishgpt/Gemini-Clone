import config from "./config.js";

// ---------- ELEMENTS ----------
const englishBtn = document.querySelector(".lang-buttons button:nth-child(1)");
const kurdishBtn = document.querySelector(".lang-buttons button:nth-child(2)");
const sendBtn = document.querySelector(".send-btn");
const input = document.querySelector(".input-area input");
const main = document.querySelector("main");
const micBtn = document.querySelector(".mic-btn");
const body = document.body;

// ---------- LANGUAGE ----------
let currentLang = "en";

const translations = {
  en: {
    title: "Welcome to AI Chat",
    description: "Start a conversation in English or Kurdish, upload images, or use AI tools below.",
    placeholder: "Type your message...",
    buttons: [
      { icon: "🖼️", text: "Create Image", action: "createImage" },
      { icon: "🧾", text: "Summarize Text", action: "summarizeText" },
      { icon: "👁️", text: "Analyze Images", action: "analyzeImage" },
      { icon: "⚙️", text: "More", action: "moreOptions" }
    ]
  },
  ku: {
    title: "بەخێربێیت بۆ چاتی AI",
    description: "گفتوگۆیەک دەستپێبکە بە ئینگلیزی یان کوردی، وێنە بەرز بکە یان ئەم ئامرازانە بەکاربەرە:",
    placeholder: "پەیامەکت بنووسە...",
    buttons: [
      { icon: "🖼️", text: "دروستکردنی وێنە", action: "createImage" },
      { icon: "🧾", text: "پوختەکردنی دەق", action: "summarizeText" },
      { icon: "👁️", text: "شیکردنەوەی وێنە", action: "analyzeImage" },
      { icon: "⚙️", text: "زیاتر", action: "moreOptions" }
    ]
  }
};

// ---------- UI BUILD ----------
function renderWelcome() {
  const t = translations[currentLang];
  main.innerHTML = `
    <h1>${t.title}</h1>
    <p>${t.description}</p>
    <div class="feature-buttons"></div>
  `;
  const featureContainer = main.querySelector(".feature-buttons");
  t.buttons.forEach(btn => {
    const b = document.createElement("button");
    b.className = "feature-btn";
    b.textContent = `${btn.icon} ${btn.text}`;
    b.dataset.action = btn.action;
    featureContainer.appendChild(b);
  });
}

// ---------- STYLES ----------
const style = document.createElement("style");
style.textContent = `
.feature-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}
.feature-btn {
  border: 1px solid #333;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
}
.feature-btn:hover {
  background: #3b82f6;
  color: white;
}
`;
document.head.appendChild(style);

// ---------- LANGUAGE SWITCH ----------
function updateLanguage(lang) {
  currentLang = lang;
  englishBtn.classList.toggle("active", lang === "en");
  kurdishBtn.classList.toggle("active", lang === "ku");
  renderWelcome();
}

englishBtn.addEventListener("click", () => updateLanguage("en"));
kurdishBtn.addEventListener("click", () => updateLanguage("ku"));

// ---------- INITIAL LOAD ----------
renderWelcome();

// ---------- CHAT ----------
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

// ---------- FEATURE BUTTON ACTIONS ----------
main.addEventListener("click", (e) => {
  if (e.target.classList.contains("feature-btn")) {
    const action = e.target.dataset.action;
    handleFeature(action);
  }
});

function handleFeature(action) {
  if (action === "createImage") {
    addMessage("bot", "🖼️ Type a description and I’ll create an image for you.");
  } else if (action === "summarizeText") {
    addMessage("bot", "🧾 Paste text and I’ll summarize it.");
  } else if (action === "analyzeImage") {
    addMessage("bot", "👁️ Upload an image and I’ll analyze it.");
  } else if (action === "moreOptions") {
    addMessage("bot", "⚙️ More features coming soon...");
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
      "⚠️ No response from Gemini"
    );
  } catch (err) {
    console.error(err);
    return "⚠️ Error contacting Gemini API.";
  }
}

// ---------- INPUT SEND ----------
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  const reply = await sendToGemini(text);
  addMessage("bot", reply);
  lastBotMessage = reply;
});

// ---------- IMAGE UPLOAD ----------
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

  const base64 = await fileToBase64(file);
  addMessage("user", "🖼️ Image uploaded");
  const reply = await sendImageToGemini(base64);
  addMessage("bot", reply);
  lastBotMessage = reply;
});

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
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
              { text: `Describe this image in ${currentLang === "ku" ? "Kurdish" : "English"}:` },
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
let lastBotMessage = "";
const speakerBtn = document.createElement("button");
speakerBtn.textContent = "🔊";
speakerBtn.className = "speaker-btn";
document.body.appendChild(speakerBtn);

speakerBtn.addEventListener("click", () => {
  if (!lastBotMessage) return;
  const utter = new SpeechSynthesisUtterance(lastBotMessage);
  utter.lang = currentLang === "ku" ? "ckb" : "en-US";
  speechSynthesis.speak(utter);
});
