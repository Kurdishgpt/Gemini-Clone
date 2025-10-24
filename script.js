import config from "./config.js";

// --- GLOBAL STATE ---
let chatHistory = [];
let isTyping = false;
let currentLanguage = 'en'; // 'en' for English, 'ckb' for Kurdish Central, 'ar' for Arabic
let currentProvider = config.DEFAULT_PROVIDER; // Track current API provider

// --- CONFIG ---
const CONFIG = {
  GEMINI_API_KEY: config.GEMINI_API_KEY,
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
    coding: 'Create a simple HTML page with ',
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

// Language configurations with full UI translations
const LANGUAGES = {
  en: { 
    name: 'English', 
    code: 'en', 
    instruction: '',
    translations: {
      // Header
      languageButton: 'English',
      // Input
      inputPlaceholder: 'Ask KurdishGPT',
      // Home screen
      homeTitle: 'What can I help with?',
      // Suggestion buttons
      createImage: 'Create image',
      summarizeText: 'Summarize text',
      brainstorm: 'Brainstorm',
      more: 'More',
      // Sidebar
      search: 'Search',
      newChat: 'New chat',
      library: 'Library',
      gpts: 'GPTs',
      recentChats: 'Recent Chats',
      noRecentChats: 'No recent chats',
      // Tools modal
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
      // Messages
      languageChanged: 'Language changed to'
    }
  },
  ckb: { 
    name: 'Ú©ÙˆØ±Ø¯ÛŒÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ', 
    code: 'ckb', 
    instruction: 'Please respond in Kurdish (Central Kurdish/Sorani):',
    translations: {
      // Header
      languageButton: 'Ú©ÙˆØ±Ø¯ÛŒÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ',
      // Input
      inputPlaceholder: 'Ù¾Ø±Ø³ÛŒØ§Ø± Ù„Û• KurdishGPT Ø¨Ú©Û•',
      // Home screen
      homeTitle: 'Ú†Û†Ù† ÛŒØ§Ø±Ù…Û•ØªÛŒØª Ø¨Ø¯Û•Ù…ØŸ',
      // Suggestion buttons
      createImage: 'Ø¯Ø±ÙˆØ³ØªÚ©Ø±Ø¯Ù†ÛŒ ÙˆÛŽÙ†Û•',
      summarizeText: 'Ù¾ÙˆØ®ØªÛ•Ú©Ø±Ø¯Ù†ÛŒ Ø¯Û•Ù‚',
      brainstorm: 'Ø¨ÛŒØ±Ú©Ø±Ø¯Ù†Û•ÙˆÛ•',
      more: 'Ø²ÛŒØ§ØªØ±',
      // Sidebar
      search: 'Ú¯Û•Ú•Ø§Ù†',
      newChat: 'Ú¯ÙØªÙˆÚ¯Û†ÛŒ Ù†ÙˆÛŽ',
      library: 'Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•',
      gpts: 'GPTs',
      recentChats: 'Ú¯ÙØªÙˆÚ¯Û†ÛŒ Ø¦Û•Ù… Ø¯ÙˆØ§ÛŒÛŒÛ•',
      noRecentChats: 'Ú¯ÙØªÙˆÚ¯Û†ÛŒ Ø¦Û•Ù… Ø¯ÙˆØ§ÛŒÛŒÛ• Ù†ÛŒÛŒÛ•',
      // Tools modal
      camera: 'Ú©Ø§Ù…ÛŽØ±Ø§',
      photos: 'ÙˆÛŽÙ†Û•Ú©Ø§Ù†',
      files: 'ÙØ§ÛŒÙ„Û•Ú©Ø§Ù†',
      createImageTool: 'Ø¯Ø±ÙˆØ³ØªÚ©Ø±Ø¯Ù†ÛŒ ÙˆÛŽÙ†Û•',
      createImageDesc: 'Ù‡Û•Ø± Ø´ØªÛŽÚ© Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ø¨Ú©Û•',
      thinking: 'Ø¨ÛŒØ±Ú©Ø±Ø¯Ù†Û•ÙˆÛ•',
      thinkingDesc: 'Ø¨ÛŒØ±Ú©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ø²ÛŒØ§ØªØ± Ø¨Û† ÙˆÛ•ÚµØ§Ù…ÛŒ Ø¨Ø§Ø´ØªØ±',
      deepResearch: 'Ù„ÛŽÚ©Û†ÚµÛŒÙ†Û•ÙˆÛ•ÛŒ Ù‚ÙˆÙˆÚµ',
      deepResearchDesc: 'Ú•Ø§Ù¾Û†Ø±ØªÛŽÚ©ÛŒ ÙˆÙˆØ±Ø¯ØªØ± ÙˆÛ•Ø±Ø¨Ú¯Ø±Û•',
      webSearch: 'Ú¯Û•Ú•Ø§Ù†ÛŒ Ø¦ÛŒÙ†ØªÛ•Ø±Ù†ÛŽØª',
      webSearchDesc: 'Ù‡Û•ÙˆØ§Úµ Ùˆ Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ Ú©Ø§ØªÛŒ Ú•Ø§Ø³Øª Ø¨Ø¯Û†Ø²Û•Ø±Û•ÙˆÛ•',
      studyLearn: 'Ø®ÙˆÛŽÙ†Ø¯Ù† Ùˆ ÙÛŽØ±Ø¨ÙˆÙˆÙ†',
      studyLearnDesc: 'Ú†Û•Ù…Ú©ÛŽÚ©ÛŒ Ù†ÙˆÛŽ ÙÛŽØ±Ø¨Û•',
      exploreTools: 'Ú¯Û•Ú•Ø§Ù† Ù„Û• Ø¦Ø§Ù…Ø±Ø§Ø²Û•Ú©Ø§Ù†',
      // Messages
      languageChanged: 'Ø²Ù…Ø§Ù† Ú¯Û†Ú•Ø¯Ø±Ø§ Ø¨Û†'
    }
  },
  ar: { 
    name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©', 
    code: 'ar', 
    instruction: 'Please respond in Arabic:',
    translations: {
      // Header
      languageButton: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
      // Input
      inputPlaceholder: 'Ø§Ø³Ø£Ù„ KurdishGPT',
      // Home screen
      homeTitle: 'ÙƒÙŠÙ ÙŠÙ…ÙƒÙ†Ù†ÙŠ Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©ØŸ',
      // Suggestion buttons
      createImage: 'Ø¥Ù†Ø´Ø§Ø¡ ØµÙˆØ±Ø©',
      summarizeText: 'ØªÙ„Ø®ÙŠØµ Ø§Ù„Ù†Øµ',
      brainstorm: 'Ø¹ØµÙ Ø°Ù‡Ù†ÙŠ',
      more: 'Ø§Ù„Ù…Ø²ÙŠØ¯',
      // Sidebar
      search: 'Ø¨Ø­Ø«',
      newChat: 'Ù…Ø­Ø§Ø¯Ø«Ø© Ø¬Ø¯ÙŠØ¯Ø©',
      library: 'Ø§Ù„Ù…ÙƒØªØ¨Ø©',
      gpts: 'GPTs',
      recentChats: 'Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§Øª Ø§Ù„Ø£Ø®ÙŠØ±Ø©',
      noRecentChats: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø­Ø§Ø¯Ø«Ø§Øª Ø£Ø®ÙŠØ±Ø©',
      // Tools modal
      camera: 'ÙƒØ§Ù…ÙŠØ±Ø§',
      photos: 'Ø§Ù„ØµÙˆØ±',
      files: 'Ø§Ù„Ù…Ù„ÙØ§Øª',
      createImageTool: 'Ø¥Ù†Ø´Ø§Ø¡ ØµÙˆØ±Ø©',
      createImageDesc: 'ØªØµÙˆØ± Ø£ÙŠ Ø´ÙŠØ¡',
      thinking: 'Ø§Ù„ØªÙÙƒÙŠØ±',
      thinkingDesc: 'ÙÙƒØ± Ù„ÙØªØ±Ø© Ø£Ø·ÙˆÙ„ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¥Ø¬Ø§Ø¨Ø§Øª Ø£ÙØ¶Ù„',
      deepResearch: 'Ø¨Ø­Ø« Ø¹Ù…ÙŠÙ‚',
      deepResearchDesc: 'Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ ØªÙ‚Ø±ÙŠØ± Ù…ÙØµÙ„',
      webSearch: 'Ø§Ù„Ø¨Ø­Ø« Ø¹Ù„Ù‰ Ø§Ù„ÙˆÙŠØ¨',
      webSearchDesc: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø£Ø®Ø¨Ø§Ø± ÙˆÙ…Ø¹Ù„ÙˆÙ…Ø§Øª ÙÙŠ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„ÙØ¹Ù„ÙŠ',
      studyLearn: 'Ø§Ù„Ø¯Ø±Ø§Ø³Ø© ÙˆØ§Ù„ØªØ¹Ù„Ù…',
      studyLearnDesc: 'ØªØ¹Ù„Ù… Ù…ÙÙ‡ÙˆÙ…Ø§Ù‹ Ø¬Ø¯ÙŠØ¯Ø§Ù‹',
      exploreTools: 'Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø£Ø¯ÙˆØ§Øª',
      // Messages
      languageChanged: 'ØªÙ… ØªØºÙŠÙŠØ± Ø§Ù„Ù„ØºØ© Ø¥Ù„Ù‰'
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

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(CONFIG.MESSAGES.action_copy_success);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Copied';
      lucide.createIcons();
      setTimeout(() => {
        button.innerHTML = originalText;
        lucide.createIcons();
      }, 2000);
    }
  });
}

function detectCodeLanguage(code) {
  code = code.trim();
  if (code.startsWith('<!DOCTYPE html>') || code.startsWith('<html')) return 'html';
  if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'javascript';
  if (code.includes('{') && code.includes('}') && (code.includes(':') || code.includes('px'))) return 'css';
  if (code.startsWith('import ') || code.startsWith('from ')) return 'python';
  return 'code';
}

function isHTMLCode(code) {
  const htmlPatterns = [
    /<!DOCTYPE\s+html>/i,
    /<html[\s>]/i,
    /<head[\s>]/i,
    /<body[\s>]/i,
    /<div[\s>]/i,
    /<p[\s>]/i,
    /<h[1-6][\s>]/i
  ];
  return htmlPatterns.some(pattern => pattern.test(code.trim()));
}

function previewHTML(code) {
  const modal = document.getElementById('html-preview-modal');
  const iframe = document.getElementById('preview-iframe');
  
  iframe.srcdoc = code;
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closePreviewModal() {
  const modal = document.getElementById('html-preview-modal');
  modal.classList.add('hidden');
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

    if (!isThinking) {
      const codeBlocks = contentDiv.querySelectorAll('pre code');
      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        const code = codeBlock.textContent;
        const language = detectCodeLanguage(code);
        const isHTML = isHTMLCode(code);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'code-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-action-btn';
        copyBtn.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i> Copy';
        copyBtn.onclick = (e) => {
          e.stopPropagation();
          copyToClipboard(code, copyBtn);
        };
        actionsDiv.appendChild(copyBtn);
        
        if (isHTML) {
          const previewBtn = document.createElement('button');
          previewBtn.className = 'code-action-btn';
          previewBtn.innerHTML = '<i data-lucide="eye" class="w-3 h-3"></i> Preview';
          previewBtn.onclick = (e) => {
            e.stopPropagation();
            previewHTML(code);
          };
          actionsDiv.appendChild(previewBtn);
        }
        
        pre.style.position = 'relative';
        pre.insertBefore(actionsDiv, pre.firstChild);
        lucide.createIcons();
      });
    }

    const footer = document.createElement("div");
    footer.className =
      "ai-bubble-footer pt-2 flex justify-end text-xs space-x-3 text-gray-400 hidden";

    const actions = [
      { icon: "copy", fn: (btn) => copyToClipboard(content, btn) },
      {
        icon: "volume-2",
        fn: () => showToast(CONFIG.MESSAGES.action_tts),
      },
      {
        icon: "rotate-cw",
        fn: () => showToast(CONFIG.MESSAGES.action_regenerate),
      },
      {
        icon: "thumbs-up",
        fn: () => showToast(CONFIG.MESSAGES.action_like),
      },
      {
        icon: "thumbs-down",
        fn: () => showToast(CONFIG.MESSAGES.action_dislike),
      },
    ];

    actions.forEach(({ icon, fn }) => {
      const btn = document.createElement("button");
      btn.className = "hover:text-white transition-colors p-1";
      btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i>`;
      btn.onclick = () => fn(btn);
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

// --- GEMINI API CALL ---
async function callGeminiAPI(prompt) {
  try {
    const languageInstruction = LANGUAGES[currentLanguage].instruction;
    const fullPrompt = languageInstruction ? `${languageInstruction}\n\n${prompt}` : prompt;
    
    const providerConfig = config.API_KEYS[currentProvider];
    
    if (currentProvider === 'GEMINI') {
      const response = await fetch(
        `${providerConfig.apiBaseUrl}/models/${providerConfig.modelName}:generateContent?key=${providerConfig.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          }),
        }
      );

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        CONFIG.MESSAGES.error_api_call_failed
      );
    } else if (currentProvider === 'OPENAI') {
      const response = await fetch(
        `${providerConfig.apiBaseUrl}/chat/completions`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${providerConfig.key}`
          },
          body: JSON.stringify({
            model: providerConfig.modelName,
            messages: [{ role: "user", content: fullPrompt }],
            temperature: CONFIG.TEMPERATURE,
            max_tokens: CONFIG.MAX_TOKENS
          }),
        }
      );

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      return (
        data?.choices?.[0]?.message?.content ||
        CONFIG.MESSAGES.error_api_call_failed
      );
    }
  } catch (err) {
    return "âŒ " + err.message;
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

  // Call Gemini API
  const reply = await callGeminiAPI(message);

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

// --- UI FUNCTIONS ---
function showFeatureNotAvailable(featureName) {
  const message = CONFIG.MESSAGES.action_feature_not_available(featureName);
  showToast(message);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-menu');
  const backdrop = document.getElementById('sidebar-backdrop');
  const isOpen = sidebar.classList.contains('translate-x-0');

  if (isOpen) {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  } else {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
  }
}

function setPrompt(prompt) {
  document.getElementById('chat-input').value = prompt;
  document.getElementById('chat-input').focus();
  checkInputStatus();
}

function openAddToolsModal() {
  document.getElementById('add-tools-modal').classList.remove('hidden');
}

function closeAddToolsModal() {
  document.getElementById('add-tools-modal').classList.add('hidden');
}

function handleToolAction(tool, prompt = '') {
  closeAddToolsModal();
  if (prompt) {
    setPrompt(prompt);
  } else {
    showFeatureNotAvailable(tool);
  }
}

function updateUILanguage() {
  const t = LANGUAGES[currentLanguage].translations;
  
  const elements = {
    'language-label': t.languageButton,
    'chat-input': { placeholder: t.inputPlaceholder },
    'home-title': t.homeTitle,
    'search-input': { placeholder: t.search },
    'sidebar-new-chat': t.newChat,
    'sidebar-library': t.library,
    'sidebar-gpts': t.gpts,
    'sidebar-recent-title': t.recentChats,
    'sidebar-no-chats': t.noRecentChats,
    'btn-create-image': t.createImage,
    'btn-summarize': t.summarizeText,
    'btn-brainstorm': t.brainstorm,
    'btn-more': t.more,
    'tool-camera': t.camera,
    'tool-photos': t.photos,
    'tool-files': t.files,
    'tool-create-image': t.createImageTool,
    'tool-create-image-desc': t.createImageDesc,
    'tool-thinking': t.thinking,
    'tool-thinking-desc': t.thinkingDesc,
    'tool-research': t.deepResearch,
    'tool-research-desc': t.deepResearchDesc,
    'tool-search': t.webSearch,
    'tool-search-desc': t.webSearchDesc,
    'tool-study': t.studyLearn,
    'tool-study-desc': t.studyLearnDesc,
    'tool-explore': t.exploreTools
  };
  
  for (const [id, value] of Object.entries(elements)) {
    const element = document.getElementById(id);
    if (element) {
      if (typeof value === 'object') {
        Object.assign(element, value);
      } else {
        element.textContent = value;
      }
    }
  }
  
  if (currentLanguage === 'ar') {
    document.body.style.direction = 'rtl';
  } else {
    document.body.style.direction = 'ltr';
  }
}

function toggleLanguage() {
  const languageOrder = ['en', 'ckb', 'ar'];
  const currentIndex = languageOrder.indexOf(currentLanguage);
  const nextIndex = (currentIndex + 1) % languageOrder.length;
  currentLanguage = languageOrder[nextIndex];
  
  updateUILanguage();
  
  const t = LANGUAGES[currentLanguage].translations;
  showToast(`${t.languageChanged} ${LANGUAGES[currentLanguage].name}`);
}

function openGPTsModal() {
  document.getElementById('gpts-modal').classList.remove('hidden');
  updateAPIKeyUI();
  lucide.createIcons();
}

function closeGPTsModal() {
  document.getElementById('gpts-modal').classList.add('hidden');
}

function updateAPIKeyUI() {
  const geminiBtn = document.getElementById('api-btn-gemini');
  const openaiBtn = document.getElementById('api-btn-openai');
  const checkGemini = document.getElementById('check-gemini');
  const checkOpenai = document.getElementById('check-openai');
  
  if (currentProvider === 'GEMINI') {
    geminiBtn.style.borderColor = '#6d28d9';
    geminiBtn.style.backgroundColor = 'rgba(109, 40, 217, 0.1)';
    openaiBtn.style.borderColor = '#374151';
    openaiBtn.style.backgroundColor = 'transparent';
    checkGemini.setAttribute('data-lucide', 'check-circle');
    checkGemini.className = 'w-6 h-6 text-purple-400';
    checkOpenai.setAttribute('data-lucide', 'circle');
    checkOpenai.className = 'w-6 h-6 text-gray-600';
  } else {
    openaiBtn.style.borderColor = '#6d28d9';
    openaiBtn.style.backgroundColor = 'rgba(109, 40, 217, 0.1)';
    geminiBtn.style.borderColor = '#374151';
    geminiBtn.style.backgroundColor = 'transparent';
    checkOpenai.setAttribute('data-lucide', 'check-circle');
    checkOpenai.className = 'w-6 h-6 text-purple-400';
    checkGemini.setAttribute('data-lucide', 'circle');
    checkGemini.className = 'w-6 h-6 text-gray-600';
  }
  lucide.createIcons();
}

function selectAPIKey(provider) {
  currentProvider = provider;
  updateAPIKeyUI();
  const providerName = config.API_KEYS[provider].displayName;
  showToast(`Switched to ${providerName}`);
  setTimeout(() => {
    closeGPTsModal();
  }, 500);
}

// Make functions globally accessible
window.clearChat = clearChat;
window.showFeatureNotAvailable = showFeatureNotAvailable;
window.toggleSidebar = toggleSidebar;
window.setPrompt = setPrompt;
window.openAddToolsModal = openAddToolsModal;
window.closeAddToolsModal = closeAddToolsModal;
window.handleToolAction = handleToolAction;
window.handleSendMessage = handleSendMessage;
window.checkInputStatus = checkInputStatus;
window.toggleLanguage = toggleLanguage;
window.previewHTML = previewHTML;
window.closePreviewModal = closePreviewModal;
window.openGPTsModal = openGPTsModal;
window.closeGPTsModal = closeGPTsModal;
window.selectAPIKey = selectAPIKey;

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("chat-input")
    .addEventListener("input", checkInputStatus);
  document
    .getElementById("chat-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSendMessage();
    });
  lucide.createIcons();
  updateUILanguage();
});
