// script.js
document.addEventListener("DOMContentLoaded", () => {
  // --- basic UI setup (same as before) ---
  const inputEl = document.querySelector(".input-area input");
  const sendBtn = document.querySelector(".send-btn");
  const chatBox = document.createElement("div");
  chatBox.classList.add("chat-box");
  chatBox.style.width = "90%";
  chatBox.style.maxWidth = "400px";
  chatBox.style.margin = "10px auto";
  chatBox.style.display = "flex";
  chatBox.style.flexDirection = "column";
  chatBox.style.gap = "8px";
  chatBox.style.fontSize = "0.95rem";
  document.querySelector("main").appendChild(chatBox);

  const API_KEY = CONFIG.apiKey;
  const MODEL = CONFIG.model;

  async function sendToGemini(message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: message }] }]
    };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "(no reply)";
      return reply;
    } catch (err) {
      console.error(err);
      return "⚠️ Connection error.";
    }
  }

  async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg) return;

    // user bubble
    const userMsg = document.createElement("div");
    userMsg.textContent = "🧑 " + msg;
    userMsg.style.textAlign = "right";
    userMsg.style.background = "#1e293b";
    userMsg.style.padding = "8px 10px";
    userMsg.style.borderRadius = "8px";
    chatBox.appendChild(userMsg);
    inputEl.value = "";

    // loading message
    const aiMsg = document.createElement("div");
    aiMsg.textContent = "🤖 typing...";
    aiMsg.style.textAlign = "left";
    aiMsg.style.background = "#172030";
    aiMsg.style.padding = "8px 10px";
    aiMsg.style.borderRadius = "8px";
    chatBox.appendChild(aiMsg);

    // send to Gemini
    const reply = await sendToGemini(msg);
    aiMsg.textContent = "🤖 " + reply;

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
