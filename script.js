// --- GEMINI API CONFIGURATION ---
const API_KEY = ""; // Placeholder. Canvas runtime injects the actual key.
const API_MODEL = 'gemini-2.5-flash-preview-09-2025';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${API_KEY}`;


// --- GLOBAL CONFIGURATION ---
const config = {
    PROMPTS: {
        image: 'Generate a high-quality image of ',
        summarize: 'Summarize the plot of ',
        brainstorm: 'Brainstorm 5 ideas for a startup in Erbil.',
        more: 'What are some fun facts about the Kurdistan Region of Iraq?',
        thinking: 'Analyze the historical significance of the Medes.',
        research: 'Write a deep report on the future of Kurdish language technology.',
        search: 'Find real-time news about the price of oil.',
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


// --- GLOBAL STATE, AND LANGUAGE DATA ---
let chatHistory = [];
let isTyping = false;
let currentLanguage = 'EN'; // Default language

// Language Data for UI elements (Sorani Kurdish using Latin script)
const LANG_DATA = {
    'EN': {
        button: 'کوردی',
        header_title: 'What can I help with?',
        input_placeholder: 'Ask KurdishGPT',
        new_chat: 'New chat',
        search_placeholder: 'Search',
        create_image: 'Create image',
        summarize_text: 'Summarize text',
        brainstorm: 'Brainstorm',
        more: 'More',
    },
    'KU': {
        button: 'English',
        header_title: 'چۆن دەتوانم یارمەتیت بدەم؟',
        input_placeholder: 'پرسیار لە کوردی جی پی تی بکە',
        new_chat: 'وتووێژی نوێ',
        search_placeholder: 'گەڕان',
        create_image: 'دروستکردنی وێنە',
        summarize_text: 'پوختەکردنی دەق',
        brainstorm: 'بیرکردنەوە',
        more: 'زیاتر',
    }
};

// Markdown Converter Setup (Requires Showdown library, loaded in HTML head)
const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    simpleLineBreaks: true
});


// --- UTILITY FUNCTIONS ---

function updateUIForLanguage(lang) {
    const data = LANG_DATA[lang];

    // document.getElementById('translate-button').innerHTML = data.button;
    document.getElementById('main-header-title').textContent = data.header_title;
    document.getElementById('chat-input').placeholder = data.input_placeholder;
    document.getElementById('sidebar-search-input').placeholder = data.search_placeholder;
    document.getElementById('new-chat-link').textContent = data.new_chat;

    const suggestionTexts = [data.create_image, data.summarize_text, data.brainstorm, data.more];
    const suggestionButtons = document.querySelectorAll('#suggestion-buttons .prompt-button span');
    suggestionButtons.forEach((span, index) => {
        if (suggestionTexts[index]) {
            span.textContent = suggestionTexts[index];
        }
    });

    // Re-create lucide icons after updating the DOM structure or contents
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'EN' ? 'KU' : 'EN';
    updateUIForLanguage(currentLanguage);
}

function showFeatureNotAvailable(featureName) {
    const message = config.MESSAGES.action_feature_not_available(featureName);
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

function clearChat() {
    chatHistory = [];
    document.getElementById('chat-container-scrollable').innerHTML = '';
    document.getElementById('chat-container-scrollable').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('chat-input').value = '';
    checkInputStatus();
    updateUIForLanguage(currentLanguage);
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

function checkInputStatus() {
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const micButton = document.getElementById('mic-button');

    if (input.value.trim().length > 0) {
        sendButton.classList.remove('hidden');
        micButton.classList.add('hidden');
    } else {
        sendButton.classList.add('hidden');
        micButton.classList.remove('hidden');
    }
}

function scrollChatToBottom() {
    const container = document.getElementById('chat-container-scrollable');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function showToast(message) {
    let toast = document.getElementById('chat-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'chat-toast';
        toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-700 text-white text-sm rounded-full shadow-lg transition-opacity duration-300 z-50 opacity-0';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 3000);
}

function copyToClipboard(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(config.MESSAGES.action_copy_success);
}

// --- RENDERING FUNCTIONS ---

function renderMessage(role, content, isThinking = false) {
    const chatContainer = document.getElementById('chat-container-scrollable');

    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = `flex mb-4 max-w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    bubbleContainer.style.direction = 'ltr';

    const bubble = document.createElement('div');
    bubble.className = `rounded-xl p-3 max-w-[85%] sm:max-w-[70%] shadow-lg`;
    bubble.style.backgroundColor = role === 'user' ? 'var(--user-bubble)' : 'var(--ai-bubble)';
    bubble.style.color = 'var(--text-light)';

    if (role === 'user') {
        bubble.classList.add('rounded-tr-sm');
        bubble.innerHTML = `<p class="whitespace-pre-wrap">${content}</p>`;
    } else {
        bubble.classList.add('rounded-tl-sm', 'flex', 'flex-col');
        bubble.style.textAlign = 'left';

        const contentDiv = document.createElement('div');
        contentDiv.className = `markdown-content pb-2`;

        if (isThinking) {
            contentDiv.innerHTML = `<i data-lucide="ellipsis" class="w-6 h-6 animate-pulse"></i>`;
        } else {
            contentDiv.innerHTML = converter.makeHtml(content);
        }
        bubble.appendChild(contentDiv);

        const footerDiv = document.createElement('div');
        footerDiv.className = `ai-bubble-footer pt-2 flex justify-end text-xs space-x-3 text-gray-400 ${isThinking ? 'hidden' : ''}`;

        const actions = [
            { icon: 'copy', action: () => copyToClipboard(content) },
            { icon: 'volume-2', action: () => showFeatureNotAvailable('Text-to-Speech') },
            { icon: 'rotate-cw', action: () => showFeatureNotAvailable('Regenerate') },
            { icon: 'thumbs-up', action: () => showToast(config.MESSAGES.action_like) },
            { icon: 'thumbs-down', action: () => showToast(config.MESSAGES.action_dislike) },
        ];

        actions.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'hover:text-white transition-colors p-1';
            btn.innerHTML = `<i data-lucide="${item.icon}" class="w-4 h-4"></i>`;
            btn.onclick = item.action;
            footerDiv.appendChild(btn);
        });

        bubble.appendChild(footerDiv);
    }

    bubbleContainer.appendChild(bubble);
    chatContainer.appendChild(bubbleContainer);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    scrollChatToBottom();
    return bubbleContainer;
}

function renderSources(bubble, sources) {
    if (sources.length === 0) return;

    let sourceHTML = '<div class="source-citation">';
    sourceHTML += '<p class="font-semibold mb-1">Sources:</p>';
    sources.forEach((source, index) => {
        sourceHTML += `<a href="${source.uri}" target="_blank" class="block text-blue-400 hover:underline truncate" title="${source.title}">
            ${index + 1}. ${source.title}
        </a>`;
    });
    sourceHTML += '</div>';

    const bubbleContent = bubble.querySelector('.ai-bubble-footer');
    if (bubbleContent) {
        bubbleContent.insertAdjacentHTML('afterend', sourceHTML);
    }
}


// --- API LOGIC ---

/**
 * Handles the actual API call to Gemini with exponential backoff.
 */
async function callGeminiAPI(prompt, thinkingBubble, maxRetries = 5) {
    const inputElement = document.getElementById('chat-input');
    const systemInstruction = `You are KurdishGPT, an AI assistant focused on providing helpful, concise, and friendly responses. If the user asks for a simple question, answer directly. If the question involves current events, use the available search tool to ensure accuracy. Respond primarily in English, unless the user explicitly asks for Kurdish.`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        tools: [{ "google_search": {} }], // Enable Google Search Grounding by default
    };

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // If the response is not ok, attempt to retry (e.g., 429 rate limit)
                if (response.status === 429 && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // Retry the loop
                }
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            let generatedText = config.MESSAGES.error_api_call_failed;
            let sources = [];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                generatedText = candidate.content.parts[0].text;

                // Extract grounding sources
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
            }

            // Stream the final text and render sources
            await streamResponse(generatedText, thinkingBubble, sources);

            // Successfully returned, so re-enable input and return
            inputElement.removeAttribute('disabled');
            isTyping = false;
            inputElement.focus();
            return;

        } catch (error) {
            console.error("Gemini API Error:", error);
        }
    }

    // If all retries fail, display an error message
    await streamResponse(config.MESSAGES.error_api_call_failed, thinkingBubble, []);
    inputElement.removeAttribute('disabled');
    isTyping = false;
    inputElement.focus();
}

async function streamResponse(content, bubble, sources) {
    const contentDiv = bubble.querySelector('.markdown-content');
    const footerDiv = bubble.querySelector('.ai-bubble-footer');

    // Remove the loading ellipsis and add the typing cursor
    contentDiv.innerHTML = `<span class="typing-cursor"></span>`;

    // Simulate chunk delivery (for visual effect, although the API call is non-streaming here)
    let streamedText = '';
    for (let i = 0; i < content.length; i++) {
        streamedText += content[i];

        if (i % 10 === 0 || i === content.length - 1) {
            const htmlContent = converter.makeHtml(streamedText);
            contentDiv.innerHTML = htmlContent + `<span class="typing-cursor"></span>`;
            scrollChatToBottom();
        }
        await new Promise(resolve => setTimeout(resolve, 5));
    }

    // Finalize the content
    contentDiv.innerHTML = converter.makeHtml(content);
    const cursor = bubble.querySelector('.typing-cursor');
    if (cursor) cursor.remove();
    
    footerDiv.classList.remove('hidden');

    if (sources.length > 0) {
        renderSources(bubble, sources);
    }

    chatHistory.push({ role: 'model', content: content, sources: sources });

    scrollChatToBottom();
}


// --- MESSAGE HANDLING ---

function handleSendMessage() {
    const inputElement = document.getElementById('chat-input');
    const userPrompt = inputElement.value.trim();

    if (userPrompt === '' || isTyping) return;

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('chat-container-scrollable').classList.remove('hidden');

    chatHistory.push({ role: 'user', content: userPrompt });
    renderMessage('user', userPrompt);

    inputElement.value = '';
    checkInputStatus();
    inputElement.setAttribute('disabled', 'true');
    isTyping = true;

    const thinkingBubble = renderMessage('model', '', true);

    // Call the actual Gemini API function
    callGeminiAPI(userPrompt, thinkingBubble);
}


// --- INITIALIZATION ---
// Execute initialization logic directly since the script tag is the last element in the body.
const chatInput = document.getElementById('chat-input');
if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('send-button').click();
        }
    });
}

// 1. Create icons initially to ensure the header and sidebar load correctly.
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// 2. Set the default language and text labels.
updateUIForLanguage(currentLanguage);

// Expose functions globally so they can be called from index.html onclick attributes
window.toggleSidebar = toggleSidebar;
window.clearChat = clearChat;
window.showFeatureNotAvailable = showFeatureNotAvailable;
window.toggleLanguage = toggleLanguage;
window.setPrompt = setPrompt;
window.openAddToolsModal = openAddToolsModal;
window.closeAddToolsModal = closeAddToolsModal;
window.handleToolAction = handleToolAction;
window.checkInputStatus = checkInputStatus;
window.handleSendMessage = handleSendMessage;
