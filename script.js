const input = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");
const chatBox = document.querySelector("#chatBox");

async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("You", userMessage);
  input.value = "";

  try {
    const res = await fetch("https://your-backend-url.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await res.json();
    const botMessage = data.choices?.[0]?.message?.content || "Error: No response.";
    appendMessage("Bot", botMessage);
  } catch (err) {
    appendMessage("Bot", "Sorry, I encountered an error. Please try again.");
    console.error(err);
  }
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(div);
}

sendBtn.addEventListener("click", sendMessage);
