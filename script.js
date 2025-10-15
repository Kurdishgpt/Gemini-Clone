import config from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const sidebarBtn = document.querySelector(".top-left .icon:first-child");
  const homeBtn = document.querySelector(".top-left .icon:last-child");
  const themeIcon = document.querySelector(".top-right .icon:last-child");
  const soundIcon = document.querySelector(".top-right .icon:first-child");
  const sendBtn = document.querySelector(".send-btn");
  const inputEl = document.querySelector(".input-area input");
  const mainSection = document.querySelector("main");
  const langBtns = document.querySelectorAll(".lang-buttons button");
  const uploadBtn = document.querySelector(".mic-btn");
  const body = document.body;

  // --- Sidebar ---
  const sidebar = document.createElement("div");
  sidebar.className = "sidebar";
  Object.assign(sidebar.style, {
    position: "fixed",
    top: "0",
    left: "-260px",
    width: "260px",
    height: "100vh",
    background: "#11161d",
    color: "#fff",
    transition: "left 0.3s ease",
    padding: "20px",
    boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
    zIndex: "9999",
  });
  sidebar.innerHTML = `
    <h2 style="margin-bottom:20px;">📁 Menu</h2>
    <button class="new-chat" style="display:block;width:100%;padding:10px;margin-bottom:10px;border:none;border-radius:6px;background:#2563eb;color:white;cursor:pointer;">New Chat</button>
    <button class="clear-chat" style="display:block;width:100%;padding:10px;margin-bottom:10px;border:none;border-radius:6px;background:#374151;color:white;cursor:pointer;">Clear Chat</button>
  `;
  document.body.appendChild(sidebar);

  let sidebarOpen = false;
  sidebarBtn.addEventListener("click", () => {
    sidebarOpen = !sidebarOpen;
    sidebar.style.left = sidebarOpen ? "0" : "-260px";
  });

  // --- Home button ---
  homeBtn.addEventListener("click", () => {
    window.location.reload();
  });

  // --- Theme toggle ---
  let dark = true;
  themeIcon.addEventListener("click", () => {
    dark = !dark;
    if (dark) {
      body.style.backgroundColor = "#0d1117";
      body.style.color = "#fff";
      themeIcon.textContent = "☀️";
    } else {
      body.style.backgroundColor = "#f4f4f4";
      body.style.color = "#000";
      themeIcon.textContent = "🌙";
    }
  });

  // --- Speaker toggle ---
  let soundOn = true;
  soundIcon.addEventListener("click", () => {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? "🔊" : "🔇";
  });

  // --- Chat box ---
  const chatBox = document.createElement("div");
  Object.assign(chatBox.style, {
    width: "90%",
    maxWidth: "420px",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  });
  mainSection.appendChild(chatBox);

  // --- Upload button for images ---
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.style.display = "none";
  document.body.appendChild(uploadInput);

  const styleSelect = document.createElement("select");
  Object.assign(styleSelect.style, {
    background: "none",
    color: "#fff",
    border: "1px solid #2f3541",
    borderRadius: "6px",
    padding: "4px 6px",
  });
  styleSelect.innerHTML = `
    <option value="enhance">Enhance</option>
    <option value="cartoon">Cartoon</option>
    <option value="painting">Painting</option>
    <option value="sketch">Sketch</option>
  `;
  uploadBtn.parentNode.insertBefore(styleSelect, uploadBtn.nextSibling);

  uploadBtn.addEventListener("click", () => {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgURL = URL.createObjectURL(file);

    // Show image in chat
    const imgEl = document.createElement("img");
    imgEl.src = imgURL;
    imgEl.style.maxWidth = "100%";
    imgEl.style.borderRadius = "8px";
    chatBox.appendChild(imgEl);

    // Show thinking...
    const thinking = document.createElement("div");
    thinking.textContent = "🤖 Thinking...";
    thinking.style.color = "#9ca3af";
    chatBox.appendChild(thinking);

    // Send to Gemini API
    const base64 = await toBase64(file);
    const style = styleSelect.value;
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `Please ${style} this image and return the new version.` },
                  { inline_data: { mime_type: file.type, data: base64 } },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      thinking.remove();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data) {
        const editedImg = document.createElement("img");
        editedImg.src =
          "data:image/png;base64," +
          data.candidates[0].content.parts[0].inline_data.data;
        editedImg.style.maxWidth = "100%";
        editedImg.style.borderRadius = "8px";
        chatBox.appendChild(editedImg);
      } else {
        const msg = document.createElement("div");
        msg.textContent = "⚠️ Couldn't edit image.";
        msg.style.color = "#f87171";
        chatBox.appendChild(msg);
        console.error(data);
      }
    } catch (err) {
      thinking.remove();
      const errMsg = document.createElement("div");
      errMsg.textContent = "❌ Error connecting to Gemini.";
      errMsg.style.color = "#f87171";
      chatBox.appendChild(errMsg);
      console.error(err);
    }
  });

  // --- Text chat send ---
  async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg) return;
    const userDiv = document.createElement("div");
    userDiv.textContent = "🧑 " + msg;
    userDiv.style.textAlign = "right";
    chatBox.appendChild(userDiv);
    inputEl.value = "";

    const thinking = document.createElement("div");
    thinking.textContent = "🤖 Thinking...";
    chatBox.appendChild(thinking);

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: msg }] }],
            generationConfig: {
              maxOutputTokens: config.MAX_TOKENS,
              temperature: config.TEMPERATURE,
            },
          }),
        }
      );

      const data = await response.json();
      thinking.remove();

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response.";
      const aiDiv = document.createElement("div");
      aiDiv.textContent = "🤖 " + aiText;
      aiDiv.style.textAlign = "left";
      aiDiv.style.background = dark ? "#172030" : "#dbeafe";
      aiDiv.style.padding = "8px";
      aiDiv.style.borderRadius = "8px";
      chatBox.appendChild(aiDiv);
    } catch (err) {
      thinking.remove();
      const errMsg = document.createElement("div");
      errMsg.textContent = "❌ Error connecting to Gemini.";
      errMsg.style.color = "#f87171";
      chatBox.appendChild(errMsg);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // --- Helpers ---
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});
