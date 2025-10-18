import config from "./config.js";

// --- GLOBAL STATE ---
let chatHistory = [];
let isTyping = false;

// --- MARKDOWN SETUP ---
const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  simpleLineBreaks: true,
});

// --- TOAST ---
function showToast(message) {
  let toast = document.getElementById("chat-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "chat-toast";
    toast.className =
      "fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-700 text-white text-sm rounded-full shadow-lg transition-opacity duration-300 z-50 opacity-0";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("opacity-0");
  toast.classList.add("opacity-100");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
  }, 3000);
}

// --- UI UTILITIES ---
function checkInputStatus() {
  const input = document.getElementById("chat-input");
  const sendButton = document.getElementById("send-button");
  const micButton = document.getElementById("mic-button");
  if (input.value.trim()) {
    sendButton.classList.remove("hidden");
    micButton.classList.add("hidden");
  } else {
    sendButton.classList.add("hidden");
    micButton.classList.remove("hidden");
  }
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-container-scrollable");
  container.scrollTop = container.scrollHeight;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(CONFIG.MESSAGES.action_copy_success);
  });
}

// --- RENDER MESSAGES ---
function renderMessage(role, content, isThinking = false) {
  const chatContainer = document.getElementById("chat-container-scrollable");
  const wrapper = document.createElement("div");
  wrapper.className = `flex mb-4 ${
    role === "user" ? "justify-end" : "justify-start"
  }`;

  const bubble = document.createElement("div");
  bubble.className =
    "rounded-xl p-3 max-w-[85%] sm:max-w-[70%] shadow-lg text-sm whitespace-pre-wrap";
  bubble.style.backgroundColor =
    role === "user" ? "var(--user-bubble)" : "var(--ai-bubble)";
  bubble.style.color = "var(--text-light)";

  if (role === "user") {
    bubble.innerHTML = `<p>${content}</p>`;
  } else {
    const contentDiv = document.createElement("div");
    contentDiv.className = "markdown-content pb-2";
    contentDiv.innerHTML = isThinking
      ? `<span class='typing-cursor'></span>`
      : converter.makeHtml(content);
    bubble.appendChild(contentDiv);

    const footer = document.createElement("div");
    footer.className =
      "ai-bubble-footer pt-2 flex justify-end text-xs space-x-3 text-gray-400 hidden";

    const actions = [
      { icon: "copy", fn: () => copyToClipboard(content) },
      {
        icon: "volume-2",
        fn: () => showToast(CONFIG.MESSAGES.action_tts),
      },
      {
        icon: "rotate-cw",
        fn: () => showToast(CONFIG.MESSAGES.action_regenerate),
      },
      {
        icon: "thumbs-up",
        fn: () => showToast(CONFIG.MESSAGES.action_like),
      },
      {
        icon: "thumbs-down",
        fn: () => showToast(CONFIG.MESSAGES.action_dislike),
      },
    ];

    actions.forEach(({ icon, fn }) => {
      const btn = document.createElement("button");
      btn.className = "hover:text-white transition-colors p-1";
      btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i>`;
      btn.onclick = fn;
      footer.appendChild(btn);
    });

    bubble.appendChild(footer);
  }

  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);
  lucide.createIcons();
  scrollChatToBottom();
  return wrapper;
}

// --- GEMINI API CALL ---
async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      CONFIG.MESSAGES.error_api_call_failed
    );
  } catch (err) {
    return "❌ " + err.message;
  }
}

// --- HANDLE SEND ---
async function handleSendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message || isTyping) return;

  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById("chat-container-scrollable").classList.remove("hidden");

  chatHistory.push({ role: "user", content: message });
  renderMessage("user", message);

  input.value = "";
  checkInputStatus();
  input.disabled = true;
  isTyping = true;

  const aiBubble = renderMessage("model", "", true);
  const contentDiv = aiBubble.querySelector(".markdown-content");

  // Call Gemini API
  const reply = await callGeminiAPI(message);

  // Replace thinking bubble with AI response
  contentDiv.innerHTML = converter.makeHtml(reply);
  const footer = aiBubble.querySelector(".ai-bubble-footer");
  if (footer) footer.classList.remove("hidden");

  chatHistory.push({ role: "model", content: reply });
  input.disabled = false;
  input.focus();
  isTyping = false;
  scrollChatToBottom();
}

// --- CLEAR CHAT ---
function clearChat() {
  chatHistory = [];
  document.getElementById("chat-container-scrollable").innerHTML = "";
  document.getElementById("home-screen").classList.remove("hidden");
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("chat-input")
    .addEventListener("input", checkInputStatus);
  document
    .getElementById("chat-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSendMessage();
    });
  lucide.createIcons();
});
