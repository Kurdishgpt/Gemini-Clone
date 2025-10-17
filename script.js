import { CONFIG } from "./config.js";

// --- STATE ---
let chatHistory = [];
let isTyping = false;

// --- MESSAGE HANDLER ---
function handleSendMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || isTyping) return;

  // Hide home and show chat
  document.getElementById("home-screen").classList.add("hidden");
  const chat = document.getElementById("chat-container-scrollable");
  chat.classList.remove("hidden");

  appendMessage("user", text);
  input.value = "";
  checkInputStatus();

  // Fake AI response
  isTyping = true;
  appendMessage("ai", "typing...");
  setTimeout(() => simulateAI(text), 1000);
}

function simulateAI(prompt) {
  const aiReply = `You asked: **${prompt}**  
This is KurdishGPT — a demo version of ChatGPT UI with fake AI replies.`;
  const chat = document.getElementById("chat-container-scrollable");
  const lastMsg = chat.lastElementChild.querySelector(".markdown-content");
  lastMsg.innerHTML = "";
  let i = 0;
  const type = setInterval(() => {
    if (i < aiReply.length) {
      lastMsg.innerHTML += aiReply[i];
      i++;
    } else {
      clearInterval(type);
      isTyping = false;
    }
  }, 25);
}

// --- UI HELPERS ---
function appendMessage(sender, text) {
  const chat = document.getElementById("chat-container-scrollable");
  const msg = document.createElement("div");
  msg.className = `w-full flex ${sender === "user" ? "justify-end" : "justify-start"} mb-3`;
  const bubble = document.createElement("div");
  bubble.className = `p-3 rounded-2xl max-w-[80%] ${
    sender === "user" ? "bg-blue-600" : "bg-gray-800"
  } text-white`;
  bubble.innerHTML = `<div class="markdown-content">${text}</div>`;
  msg.appendChild(bubble);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function checkInputStatus() {
  const input = document.getElementById("chat-input");
  const send = document.getElementById("send-button");
  const mic = document.getElementById("mic-button");
  if (input.value.trim().length > 0) {
    send.classList.remove("hidden");
    mic.classList.add("hidden");
  } else {
    send.classList.add("hidden");
    mic.classList.remove("hidden");
  }
}

window.handleSendMessage = handleSendMessage;
window.checkInputStatus = checkInputStatus;
