import config from "./config.js";

const messageForm = document.querySelector(".prompt__form");
const chatHistoryContainer = document.querySelector(".chats");
const themeToggleButton = document.getElementById("themeToggler");
const clearChatButton = document.getElementById("deleteButton");

// ========== State ==========
let currentUserMessage = null;
let isGeneratingResponse = false;

// ========== Initialize Highlight.js ==========
hljs.configure({
  languages: ["javascript", "python", "bash", "html", "css", "json"]
});
hljs.highlightAll();

// ========== API URL ==========
const API_REQUEST_URL = `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`;

// ========== Load saved chat history ==========
const loadSavedChatHistory = () => {
  const savedChats = JSON.parse(localStorage.getItem("saved-chats")) || [];
  const isLightTheme = localStorage.getItem("themeColor") === "light_mode";

  document.body.classList.toggle("light_mode", isLightTheme);
  themeToggleButton.innerHTML = isLightTheme
    ? '<i class="bx bx-moon"></i>'
    : '<i class="bx bx-sun"></i>';

  chatHistoryContainer.innerHTML = "";

  savedChats.forEach(({ userMessage, botResponse }) => {
    appendMessage(userMessage, "outgoing");
    appendMessage(botResponse, "incoming", true);
  });
};

// ========== Create message element ==========
const createMessageElement = (text, type) => {
  const message = document.createElement("div");
  message.classList.add("message", `message--${type}`);

  const avatar =
    type === "outgoing" ? "assets/profile.png" : "assets/gemini.svg";
  const content = `
    <div class="message__content">
      <img class="message__avatar" src="${avatar}" alt="${type} avatar" />
      <p class="message__text"></p>
    </div>
  `;
  message.innerHTML = content;
  message.querySelector(".message__text").innerText = text;
  return message;
};

// ========== Append message ==========
const appendMessage = (text, type, skipEffect = false) => {
  const msg = createMessageElement("", type);
  chatHistoryContainer.appendChild(msg);
  const textElement = msg.querySelector(".message__text");

  if (skipEffect) {
    textElement.innerHTML = marked.parse(text);
    hljs.highlightAll();
  } else {
    showTypingEffect(text, textElement);
  }

  chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;
};

// ========== Typing animation ==========
const showTypingEffect = (text, element) => {
  const words = text.split(" ");
  let index = 0;
  const interval = setInterval(() => {
    element.textContent += (index === 0 ? "" : " ") + words[index++];
    if (index >= words.length) clearInterval(interval);
  }, 50);
};

// ========== Fetch Gemini API ==========
const fetchGeminiResponse = async (userMessage) => {
  try {
    const res = await fetch(API_REQUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userMessage }] }]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "API error");

    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    return responseText;
  } catch (error) {
    console.error("API Error:", error);
    return "⚠️ Error: " + error.message;
  }
};

// ========== Handle form submit ==========
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = messageForm.querySelector(".prompt__form-input");
  const message = input.value.trim();
  if (!message || isGeneratingResponse) return;

  input.value = "";
  appendMessage(message, "outgoing");
  isGeneratingResponse = true;

  // Show loading message
  const loadingMsg = createMessageElement("Thinking...", "incoming");
  chatHistoryContainer.appendChild(loadingMsg);
  chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;

  const botResponse = await fetchGeminiResponse(message);

  loadingMsg.remove(); // Remove "Thinking..." message
  appendMessage(botResponse, "incoming");
  isGeneratingResponse = false;

  saveChat(message, botResponse);
});

// ========== Save chat ==========
const saveChat = (userMessage, botResponse) => {
  const savedChats = JSON.parse(localStorage.getItem("saved-chats")) || [];
  savedChats.push({ userMessage, botResponse });
  localStorage.setItem("saved-chats", JSON.stringify(savedChats));
};

// ========== Theme toggle ==========
themeToggleButton.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLight ? "light_mode" : "dark_mode");
  themeToggleButton.innerHTML = isLight
    ? '<i class="bx bx-moon"></i>'
    : '<i class="bx bx-sun"></i>';
});

// ========== Clear chat ==========
clearChatButton.addEventListener("click", () => {
  if (confirm("Clear all chat history?")) {
    localStorage.removeItem("saved-chats");
    chatHistoryContainer.innerHTML = "";
  }
});

// ========== Init ==========
loadSavedChatHistory();
