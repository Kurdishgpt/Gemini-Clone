// script.js

// ----- LOAD CONFIG -----
if (typeof CONFIG !== "undefined") {
  console.log(`✅ ${CONFIG.appName} v${CONFIG.version} loaded`);
} else {
  console.error("❌ Config not found!");
}

// ----- LANGUAGE TOGGLE -----
const langButtons = document.querySelectorAll(".lang-buttons button");

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    langButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    console.log(`🌐 Language changed to: ${btn.textContent}`);
  });
});

// ----- DARK / LIGHT MODE -----
const themeIcon = document.querySelector(".top-right .icon:last-child");
let darkMode = CONFIG.darkMode;

function updateTheme() {
  if (darkMode) {
    document.body.style.backgroundColor = "#0d1117";
    document.body.style.color = "#fff";
    themeIcon.textContent = "☀️";
  } else {
    document.body.style.backgroundColor = "#f4f4f4";
    document.body.style.color = "#000";
    themeIcon.textContent = "🌙";
  }
}

themeIcon.addEventListener("click", () => {
  darkMode = !darkMode;
  updateTheme();
  console.log(`🎨 Theme changed: ${darkMode ? "Dark" : "Light"}`);
});

updateTheme(); // Apply default

// ----- SOUND ICON -----
const soundIcon = document.querySelector(".top-right .icon:first-child");
let soundOn = true;

soundIcon.addEventListener("click", () => {
  soundOn = !soundOn;
  soundIcon.textContent = soundOn ? "🔊" : "🔇";
  console.log(`🔈 Sound ${soundOn ? "On" : "Off"}`);
});

// ----- MIC BUTTON -----
const micBtn = document.querySelector(".mic-btn svg");
let listening = false;

document.querySelector(".mic-btn").addEventListener("click", () => {
  listening = !listening;
  micBtn.style.stroke = listening ? "#2563eb" : "#9ca3af";
  console.log(`🎤 Mic ${listening ? "On (listening...)" : "Off"}`);
});

// ----- SEND MESSAGE -----
const sendBtn = document.querySelector(".send-btn");
const inputField = document.querySelector(".input-area input");

sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = inputField.value.trim();
  if (!message) return;

  console.log(`💬 You: ${message}`);
  inputField.value = "";
}

// ----- MAIN BUTTON -----
const mainButton = document.querySelector(".btn");

mainButton.addEventListener("click", () => {
  console.log("🧠 Button clicked: Tell me about Kurdish culture");
  alert("Feature coming soon: AI will tell you about Kurdish culture!");
});

// ----- HOME + MENU ICONS -----
const topLeftIcons = document.querySelectorAll(".top-left .icon");
topLeftIcons[0].addEventListener("click", () => {
  console.log("📋 Menu button clicked");
});
topLeftIcons[1].addEventListener("click", () => {
  console.log("🏠 Home button clicked");
});
