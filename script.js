import config from "./config.js";

const chatBox = document.querySelector("#chat");
const promptInput = document.querySelector("#prompt");
const sendBtn = document.querySelector("#send-btn");

async function generateResponse(prompt) {
  const res = await fetch(
    `${config.API_BASE_URL}/models/${config.MODEL_NAME}:generateContent?key=${config.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.TEMPERATURE,
          maxOutputTokens: config.MAX_TOKENS,
        },
      }),
    }
  );

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response.";
}

async function speakKurdish(text) {
  const res = await fetch(config.KURDISHTTS_URL, {
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

  const blob = await res.blob();
  const audioURL = URL.createObjectURL(blob);
  const audio = new Audio(audioURL);
  audio.play();
}

sendBtn.addEventListener("click", async () => {
  const userText = promptInput.value.trim();
  if (!userText) return;

  chatBox.innerHTML += `<div class="user-msg">${userText}</div>`;
  promptInput.value = "";

  const reply = await generateResponse(userText);
  chatBox.innerHTML += `<div class="bot-msg">${reply}</div>`;

  // Play Kurdish voice
  await speakKurdish(reply);

  chatBox.scrollTop = chatBox.scrollHeight;
});
