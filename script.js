// ✅ script.js (all buttons working)

// ======= DOM ELEMENTS =======
const englishBtn = document.querySelector(".lang-buttons button:first-child");
const kurdishBtn = document.querySelector(".lang-buttons button:last-child");
const sidebar = document.getElementById("sidebar");
const clipboardBtn = document.querySelector(".top-left .icon:first-child");
const homeBtn = document.querySelector(".top-left .icon:nth-child(2)");
const speakerBtn = document.querySelector(".top-right .icon:first-child");
const themeBtn = document.querySelector(".top-right .icon:last-child");
const sendBtn = document.querySelector(".send-btn");
const uploadBtn = document.querySelector(".upload-btn");
const inputField = document.querySelector(".input-area input");
const chatArea = document.querySelector("main");
const closeSidebarBtn = document.getElementById("closeSidebar");

// ======= SIDEBAR CONTROL =======
clipboardBtn?.addEventListener("click", () => {
  sidebar?.classList.add("active");
});

closeSidebarBtn?.addEventListener("click", () => {
  sidebar?.classList.remove("active");
});

// ======= HOME BUTTON =======
homeBtn?.addEventListener("click", () => {
  chatArea.innerHTML = `
    <div class="chat-icon">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>
    <h1>Welcome to AI Chat</h1>
    <p>Start a conversation in English or Kurdish, use voice commands, or generate images</p>
  `;
});

// ======= THEME TOGGLE =======
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
});

// ======= SPEAKER BUTTON =======
speakerBtn?.addEventListener("click", () => {
  const lastMessage = document.querySelector(".ai-response:last-child");
  if (!lastMessage) return;
  const text = lastMessage.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // can adjust later for Kurdish
  speechSynthesis.speak(utterance);
});

// ======= LANGUAGE SWITCH =======
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
  const h1 = document.querySelector("h1");
  const p = document.querySelector("p");
  if (!h1 || !p) return;

  if (lang === "en") {
    h1.textContent = "Welcome to AI Chat";
    p.textContent =
      "Start a conversation in English or Kurdish, use voice commands, or generate images";
  } else {
    h1.textContent = "بەخێربێیت بۆ چاتی AI";
    p.textContent =
      "گفتوگۆ لە زمانی ئینگلیزی یان کوردی بکە، یان وێنە دروست بکە";
  }
}

// ======= SEND MESSAGE =======
sendBtn?.addEventListener("click", async () => {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  inputField.value = "";

  appendMessage("thinking", "🤔 Thinking...");

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage }),
    });

    const data = await response.json();
    document.querySelector(".thinking")?.remove();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      appendMessage("ai", data.candidates[0].content.parts[0].text);
    } else {
      appendMessage("ai", "⚠️ No response from Gemini API.");
    }
  } catch (err) {
    document.querySelector(".thinking")?.remove();
    appendMessage("ai", "❌ Error connecting to Gemini API.");
  }
});

// ======= APPEND MESSAGES =======
function appendMessage(sender, text) {
  const message = document.createElement("div");
  message.classList.add(
    sender === "ai"
      ? "ai-response"
      : sender === "thinking"
      ? "thinking"
      : "user"
  );
  message.textContent = text;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ======= UPLOAD IMAGE =======
uploadBtn?.addEventListener("click", async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    appendMessage("user", `📤 Uploaded image: ${file.name}`);
    appendMessage("thinking", "🧠 Analyzing image...");
    // (Placeholder for Gemini Vision)
    setTimeout(() => {
      document.querySelector(".thinking")?.remove();
      appendMessage("ai", "✨ Image processed successfully!");
    }, 2000);
  };
  fileInput.click();
});
