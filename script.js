import config from "./config.js";

// ---------- ELEMENTS ----------
const micBtn = document.querySelector("#micBtn");
const voiceMenu = document.querySelector("#voiceMenu");
const maleBtn = document.querySelector("#maleVoice");
const femaleBtn = document.querySelector("#femaleVoice");
const closeBtn = document.querySelector("#closeMenu");
const chatContainer = document.querySelector("#chatContainer");
const sendBtn = document.querySelector("#sendBtn");
const inputField = document.querySelector("#userInput");
const uploadBtn = document.querySelector("#uploadImage");
const homeBtn = document.querySelector("#homeBtn");
const themeToggle = document.querySelector("#themeToggle");

let selectedVoice = "male"; // default
let currentLang = "ku"; // Kurdish default
let lastBotMessage = "";

// ======================
// 🎙️ Kurdish TTS Function
// ======================
async function playKurdishTTS(text) {
  try {
    const res = await fetch("https://api.kurdishtts.com/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.KURDISHTTS_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        voice: selectedVoice,
        format: "mp3",
      }),
    });
    const data = await res.json();

    if (data.audio_url) {
      new Audio(data.audio_url).play();
    } else if (data.audio_base64) {
      new Audio(`data:audio/mp3;base64,${data.audio_base64}`).play();
    } else {
      console.error("⚠️ No audio returned:", data);
    }
  } catch (err) {
    console.error("⚠️ Kurdish TTS error:", err);
  }
}

// ======================
// 🎤 Voice Menu Toggle
// ======================
micBtn.addEventListener("click", () => {
  voiceMenu.classList.toggle("hidden");
});
closeBtn.addEventListener("click", () => {
  voiceMenu.classList.add("hidden");
});

maleBtn.addEventListener("click", () => {
  selectedVoice = "male";
  voiceMenu.classList.add("hidden");
  playKurdishTTS("Slaw! Dengê nêrîn hate hilbijartin.");
});

femaleBtn.addEventListener("click", () => {
  selectedVoice = "female";
  voiceMenu.classList.add("hidden");
  playKurdishTTS("Silav! Dengê mê hate hilbijartin.");
});

// ======================
// 💬 Add Chat Message
// ======================
function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = role === "user" ? "user-msg" : "bot-msg";
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
  if (role === "bot") lastBotMessage = text;
}

// ======================
// 🧠 Gemini AI Reply
// ======================
async function sendToGemini(prompt) {
  try {
    const res = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt} (Answer in Kurdish)` }] }],
        }),
      }
    );
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini."
    );
  } catch (err) {
    console.error("Gemini error:", err);
    return "⚠️ Error connecting to Gemini.";
  }
}

// ======================
// 📤 Send Button
// ======================
sendBtn.addEventListener("click", async () => {
  const text = inputField.value.trim();
  if (!text) return;

  addMessage("user", text);
  inputField.value = "";

  const thinking = document.createElement("div");
  thinking.className = "bot-msg";
  thinking.textContent = "🤔 Thinking...";
  chatContainer.appendChild(thinking);

  const reply = await sendToGemini(text);
  thinking.remove();

  addMessage("bot", reply);
  playKurdishTTS(reply);
});

// ======================
// 🏠 Home Button
// ======================
homeBtn.addEventListener("click", () => {
  chatContainer.innerHTML = `
    <h2>Welcome to Kurdish GPT</h2>
    <p>Start chatting or use the mic for voice options.</p>
  `;
});

// ======================
// 🖼️ Upload Image
// ======================
uploadBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.className = "uploaded-image";
      chatContainer.appendChild(img);
    }
  };
});

// ======================
// 🌙 Theme Toggle
// ======================
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
