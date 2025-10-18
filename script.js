import config from "./config.js";

// --- GLOBAL STATE ---
let chatHistory = [];
let isTyping = false;
let currentLanguage = 'en'; // 'en' for English, 'ckb' for Kurdish Central, 'ar' for Arabic

// --- CONFIG ---
const CONFIG = {
  CLAUDE_API_KEY: config.CLAUDE_API_KEY,
  API_BASE_URL: config.API_BASE_URL,
  MODEL_NAME: config.MODEL_NAME,
  PROMPTS: {
    image: 'Generate a high-quality image of ',
    summarize: 'Summarize the plot of ',
    brainstorm: 'Brainstorm 5 ideas for a startup in Erbil.',
    more: 'What are some fun facts about the Kurdistan Region of Iraq?',
    thinking: 'Analyze the historical significance of the Medes.',
    research: 'Write a deep report on the future of Kurdish language technology.',
    search: 'What is the current price of oil?',
    study: 'Explain the concept of neural networks in simple terms.',
  },
  MESSAGES: {
    action_copy_success: 'Content copied to clipboard!',
    action_copied: 'Copied.',
    action_tts: 'Text-to-Speech is playing the response now.',
    action_regenerate: 'Regenerating response...',
    action_like: 'Thanks for the feedback!',
    action_dislike: 'Thanks for the feedback. We will improve.',
    action_feature_not_available: (feature) => `${feature} feature is not yet available in this clone.`,
    error_api_call_failed: 'Failed to get a response from the API.',
  }
};

// --- LANGUAGE SUPPORT ---
const LANGUAGES = {
  en: { 
    name: 'English', 
    code: 'en', 
    instruction: '',
    translations: {
      languageButton: 'English',
      inputPlaceholder: 'Ask KurdishGPT',
      homeTitle: 'What can I help with?',
      createImage: 'Create image',
      summarizeText: 'Summarize text',
      brainstorm: 'Brainstorm',
      more: 'More',
      search: 'Search',
      newChat: 'New chat',
      library: 'Library',
      gpts: 'GPTs',
      recentChats: 'Recent Chats',
      noRecentChats: 'No recent chats',
      camera: 'Camera',
      photos: 'Photos',
      files: 'Files',
      createImageTool: 'Create image',
      createImageDesc: 'Visualize anything',
      thinking: 'Thinking',
      thinkingDesc: 'Think longer for better answers',
      deepResearch: 'Deep research',
      deepResearchDesc: 'Get a detailed report',
      webSearch: 'Web search',
      webSearchDesc: 'Find real-time news and info',
      studyLearn: 'Study and learn',
      studyLearnDesc: 'Learn a new concept',
      exploreTools: 'Explore tools',
      languageChanged: 'Language changed to'
    }
  },
  ckb: { 
    name: 'کوردیی ناوەندی', 
    code: 'ckb', 
    instruction: 'Please respond in Kurdish (Central Kurdish/Sorani):',
    translations: {
      languageButton: 'کوردیی ناوەندی',
      inputPlaceholder: 'پرسیار لە KurdishGPT بکە',
      homeTitle: 'چۆن یارمەتیت بدەم؟',
      createImage: 'دروستکردنی وێنە',
      summarizeText: 'پوختەکردنی دەق',
      brainstorm: 'بیرکردنەوە',
      more: 'زیاتر',
      search: 'گەڕان',
      newChat: 'گفتوگۆی نوێ',
      library: 'کتێبخانە',
      gpts: 'GPTs',
      recentChats: 'گفتوگۆی ئەم دواییە',
      noRecentChats: 'گفتوگۆی ئەم دواییە نییە',
      camera: 'کامێرا',
      photos: 'وێنەکان',
      files: 'فایلەکان',
      createImageTool: 'دروستکردنی وێنە',
      createImageDesc: 'هەر شتێک بینینی بکە',
      thinking: 'بیرکردنەوە',
      thinkingDesc: 'بیرکردنەوەی زیاتر بۆ وەڵامی باشتر',
      deepResearch: 'لێکۆڵینەوەی قووڵ',
      deepResearchDesc: 'ڕاپۆرتێکی ووردتر وەربگرە',
      webSearch: 'گەڕانی ئینتەرنێت',
      webSearchDesc: 'هەواڵ و زانیاری کاتی ڕاست بدۆزەرەوە',
      studyLearn: 'خوێندن و فێربوون',
      studyLearnDesc: 'چەمکێکی نوێ فێربە',
      exploreTools: 'گەڕان لە ئامرازەکان',
      languageChanged: 'زمان گۆڕدرا بۆ'
    }
  },
  ar: { 
    name: 'العربية', 
    code: 'ar', 
    instruction: 'Please respond in Arabic:',
    translations: {
      languageButton: 'العربية',
      inputPlaceholder: 'اسأل KurdishGPT',
      homeTitle: 'كيف يمكنني المساعدة؟',
      createImage: 'إنشاء صورة',
      summarizeText: 'تلخيص النص',
      brainstorm: 'عصف ذهني',
      more: 'المزيد',
      search: 'بحث',
      newChat: 'محادثة جديدة',
      library: 'المكتبة',
      gpts: 'GPTs',
      recentChats: 'المحادثات الأخيرة',
      noRecentChats: 'لا توجد محادثات أخيرة',
      camera: 'كاميرا',
      photos: 'الصور',
      files: 'الملفات',
      createImageTool: 'إنشاء صورة',
      createImageDesc: 'تصور أي شيء',
      thinking: 'التفكير',
      thinkingDesc: 'فكر لفترة أطول للحصول على إجابات أفضل',
      deepResearch: 'بحث عميق',
      deepResearchDesc: 'احصل على تقرير مفصل',
      webSearch: 'البحث على الويب',
      webSearchDesc: 'ابحث عن أخبار ومعلومات في الوقت الفعلي',
      studyLearn: 'الدراسة والتعلم',
      studyLearnDesc: 'تعلم مفهوماً جديداً',
      exploreTools: 'استكشف الأدوات',
      languageChanged: 'تم تغيير اللغة إلى'
    }
  }
};

// Make CONFIG globally accessible
window.CONFIG = CONFIG;

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
      { icon: "volume-2", fn: () => showToast(CONFIG.MESSAGES.action_tts) },
      { icon: "rotate-cw", fn: () => showToast(CONFIG.MESSAGES.action_regenerate) },
      { icon: "thumbs-up", fn: () => showToast(CONFIG.MESSAGES.action_like) },
      { icon: "thumbs-down", fn: () => showToast(CONFIG.MESSAGES.action_dislike) },
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

// --- CLAUDE API CALL ---
async function callClaudeAPI(prompt) {
  try {
    const languageInstruction = LANGUAGES[currentLanguage].instruction;
    const fullPrompt = languageInstruction ? `${languageInstruction}\n\n${prompt}` : prompt;

    const response = await fetch(`${CONFIG.API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CONFIG.MODEL_NAME,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        messages: [
          { role: "user", content: fullPrompt }
        ],
      }),
    });

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data?.content?.[0]?.text || CONFIG.MESSAGES.error_api_call_failed;
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

  // Call Claude API
  const reply = await callClaudeAPI(message);

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
  document.getElementById("chat-container-scrollable").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("chat-input").value = "";
  checkInputStatus();
}

// --- LANGUAGE + SIDEBAR + TOOLS ---
function toggleLanguage() {
  const order = ['en', 'ckb', 'ar'];
  const next = (order.indexOf(currentLanguage) + 1) % order.length;
  currentLanguage = order[next];
  updateUILanguage();
  const t = LANGUAGES[currentLanguage].translations;
  showToast(`${t.languageChanged} ${LANGUAGES[currentLanguage].name}`);
}

function updateUILanguage() {
  const t = LANGUAGES[currentLanguage].translations;
  document.getElementById('chat-input').placeholder = t.inputPlaceholder;
  document.getElementById('home-title').textContent = t.homeTitle;
  if (currentLanguage === 'ar') document.body.style.direction = 'rtl';
  else document.body.style.direction = 'ltr';
}

// --- EXPORT UI FUNCTIONS ---
window.handleSendMessage = handleSendMessage;
window.checkInputStatus = checkInputStatus;
window.clearChat = clearChat;
window.toggleLanguage = toggleLanguage;

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("chat-input").addEventListener("input", checkInputStatus);
  document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
  lucide.createIcons();
  updateUILanguage();
});
