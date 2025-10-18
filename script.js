// ✅ KurdishGPT Browser Script (works 100%)
import config from "./config.js";

const chatBox = document.querySelector("#chat");
const promptInput = document.querySelector("#prompt");
const sendBtn = document.querySelector("#send-btn");

async function generateResponse(prompt) {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: config.TEMPERATURE,
            maxOutputTokens: config.MAX_TOKENS,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}`);
    }

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from Gemini API."
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return "❌ Failed to connect to Gemini API. Check your API key or internet connection.";
  }
}

async function speakKurdish(text) {
  try {
    const response = await fetch(config.KURDISHTTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.KURDISHTTS_API_KEY}`,
      },
      body: JSON.stringify({
        text,
        voice: "female",
        language: "ckb",
      }),
    });

    if (!response.ok) throw new Error("TTS request failed");

    const blob = await response.blob();
    const audioURL = URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    audio.play();
  } catch (err) {
    console.error("KurdishTTS error:", err);
  }
}

sendBtn.addEventListener("click", async () => {
  const input = promptInput.value.trim();
  if (!input) return;

  chatBox.innerHTML += `<div class="user-msg">${input}</div>`;
  promptInput.value = "";

  const reply = await generateResponse(input);
  chatBox.innerHTML += `<div class="bot-msg">${reply}</div>`;

  await speakKurdish(reply);

  chatBox.scrollTop = chatBox.scrollHeight;
});
