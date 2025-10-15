import config from "./config.js";

const englishBtn = document.querySelector('.lang-buttons button:first-child');
const kurdishBtn = document.querySelector('.lang-buttons button:last-child');
const themeIcon = document.querySelector('.top-right .icon:last-child');
const title = document.querySelector('h1');
const subtitle = document.querySelector('main p');
const cultureBtn = document.querySelector('.btn');
const body = document.body;
const micIcon = document.querySelector('.mic');
const inputField = document.querySelector('.chat-input input');
const sendIcon = document.querySelector('.send');
const chatContainer = document.querySelector('.chat-messages');

let recognizing = false;
let recognition;
let isLight = false;
let language = "en";

// === Language toggle ===
englishBtn.addEventListener('click', () => {
  englishBtn.classList.add('active');
  kurdishBtn.classList.remove('active');
  language = "en";

  title.textContent = 'Welcome to AI Chat';
  subtitle.textContent = 'Start a conversation in English or Kurdish, use voice commands, or generate images';
  cultureBtn.textContent = '💬 Tell me about Kurdish culture';
});

kurdishBtn.addEventListener('click', () => {
  kurdishBtn.classList.add('active');
  englishBtn.classList.remove('active');
  language = "ckb";

  title.textContent = 'بەخێربێیت بۆ چاتی AI';
  subtitle.textContent = 'گفتوگۆیەک دەست پێبکە بە ئینگلیزی یان کوردی، بە دەنگ قسە بکە یان وێنە دروست بکە';
  cultureBtn.textContent = '💬 پێم بڵێ دەربارەی کەلتوری کوردی';
});

// === Theme toggle ===
themeIcon.addEventListener('click', () => {
  isLight = !isLight;
  if (isLight) {
    body.style.backgroundColor = '#f9fafb';
    body.style.color = '#111';
    themeIcon.textContent = '🌙';
  } else {
    body.style.backgroundColor = '#0d1117';
    body.style.color = '#fff';
    themeIcon.textContent = '☀️';
  }
});

// === Optional click sound ===
document.querySelectorAll('.icon, .btn').forEach((el) => {
  el.addEventListener('click', () => {
    const audio = new Audio('https://assets.mixkit.co/sfx/download/mixkit-select-click-1109.wav');
    audio.volume = 0.3;
    audio.play();
  });
});

// === Speech recognition ===
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    recognizing = true;
    micIcon.classList.add('recording');
    micIcon.textContent = '🎙️';
  };

  recognition.onend = () => {
    recognizing = false;
    micIcon.classList.remove('recording');
    micIcon.textContent = '🎤';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputField.value = transcript;
  };
}

micIcon.addEventListener('click', () => {
  if (!recognition) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  if (recognizing) {
    recognition.stop();
  } else {
    recognition.lang = language === "en" ? "en-US" : "ckb-IQ";
    recognition.start();
  }
});

// === Send message ===
sendIcon.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  displayMessage(userMessage, "user");
  inputField.value = "";

  const loadingMessage = displayMessage("Typing...", "ai", true);
  try {
    const res = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }]
        }),
      }
    );

    const data = await res.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    loadingMessage.remove();
    displayMessage(aiText, "ai");
  } catch (err) {
    console.error(err);
    loadingMessage.remove();
    displayMessage("Error connecting to Gemini API.", "ai");
  }
}

// === Display chat message ===
function displayMessage(text, sender, isLoading = false) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender === "user" ? "outgoing" : "incoming");
  msg.textContent = text;
  if (isLoading) msg.classList.add("loading");
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg;
}
