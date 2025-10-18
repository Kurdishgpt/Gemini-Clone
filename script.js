


import form config "./config.js";

// Markdown Converter Setup (Global scope for all functions)
const converter = new showdown.Converter({
    tables: true,
    strikethrough: true,
    tasklists: true,
    simpleLineBreaks: true
});

// --- GLOBAL STATE ---
let chatHistory = [];
let isTyping = false;
let currentLanguage = 'en'; // Initial state: 'en' (English)


// --- LOCALIZATION & UI FUNCTIONS (Exported to window for HTML access) ---

/** Updates all static UI elements based on the currentLanguage state. */
window.updateUIForLanguage = function() {
    const lang = currentLanguage;
    const dict = L10N[lang];

    // 1. Update all elements with data-l10n-key
    document.querySelectorAll('[data-l10n-key]').forEach(el => {
        const key = el.getAttribute('data-l10n-key');
        if (dict[key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = dict[key];
            } else if (key.endsWith('_aria') || key.endsWith('_title')) {
                // Update aria-label/title attributes if necessary
                el.setAttribute('title', dict[key]);
                el.setAttribute('aria-label', dict[key]);
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // 2. Update the language toggle button display
    const langDisplay = document.getElementById('current-language-display');
    const langButton = document.getElementById('language-toggle-button');
    
    langDisplay.textContent = dict['lang_display'];
    
    // 3. Update title attribute
    const nextLang = currentLanguage === 'en' ? 'ku' : 'en';
    langButton.title = L10N[nextLang].lang_switch_title(dict['lang_display']);
}


/** Toggles the translation language. */
window.toggleLanguage = function() {
    const newLang = currentLanguage === 'en' ? 'ku' : 'en';
    currentLanguage = newLang;

    // 1. Update all UI text 
    updateUIForLanguage();
    
    // 2. Show confirmation toast
    const toastMessage = L10N[newLang].lang_set_to;
    showToast(toastMessage);
}

// --- RECENT CHATS IMPLEMENTATION ---

/** Loads and renders recent chats from local storage. */
window.loadRecentChats = function() {
    const chatListDiv = document.getElementById('recent-chats-list');
    const chatsJSON = localStorage.getItem(CONFIG.STORAGE_KEY.RECENT_CHATS);
    let chats = chatsJSON ? JSON.parse(chatsJSON) : [];

    chatListDiv.innerHTML = '';
    
    if (chats.length === 0) {
        const noChats = document.createElement('p');
        noChats.className = 'text-xs text-gray-600 px-3 py-1';
        noChats.setAttribute('data-l10n-key', 'no_recent_chats');
        chatListDiv.appendChild(noChats);
        // Re-run localization to ensure "No recent chats" is correct
        updateUIForLanguage(); 
    } else {
        chats.forEach((chat) => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'flex items-center p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors text-white text-sm truncate';
            link.textContent = chat.title;
            link.onclick = (e) => {
                e.preventDefault();
                // In a full app, this would load the chat by its ID/history.
                showFeatureNotAvailable(`Loading Chat: "${chat.title}"`);
                toggleSidebar();
            };
            chatListDiv.appendChild(link);
        });
    }
}

/** Saves the current chat (if new or updated) to local storage. */
window.saveCurrentChat = function() {
    // Ensure the chat has at least one user message to derive a title
    const firstUserMessage = chatHistory.find(msg => msg.role === 'user');
    if (!firstUserMessage) return;

    let chatTitle = firstUserMessage.content.substring(0, 40);
    if (firstUserMessage.content.length > 40) chatTitle += '...';

    const chatsJSON = localStorage.getItem(CONFIG.STORAGE_KEY.RECENT_CHATS);
    let chats = chatsJSON ? JSON.parse(chatsJSON) : [];

    // Check if a chat with this title already exists (and update its position to the top)
    chats = chats.filter(chat => chat.title !== chatTitle);

    // Add new chat to the top
    const newChatEntry = { id: Date.now(), title: chatTitle };
    chats.unshift(newChatEntry);

    // Limit the list size
    chats = chats.slice(0, CONFIG.STORAGE_KEY.MAX_CHATS);

    localStorage.setItem(CONFIG.STORAGE_KEY.RECENT_CHATS, JSON.stringify(chats));
    loadRecentChats(); // Re-render the sidebar list
}

// --- CHAT INTERFACE FUNCTIONS ---

/** Toggles the sidebar visibility. */
window.toggleSidebar = function() {
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

/** Clears the chat history and resets the view to the home screen. */
window.clearChat = function(shouldSave) {
    // Automatically save the current chat if it has history and a title.
    if (shouldSave && chatHistory.length > 1) {
        saveCurrentChat();
    }

    chatHistory = [];
    const chatContainer = document.getElementById('chat-container-scrollable');
    const homeScreen = document.getElementById('home-screen');
    chatContainer.innerHTML = '';
    chatContainer.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    document.getElementById('chat-input').value = '';
    checkInputStatus();
}

/** Main function to handle sending a message (user prompt). */
window.handleSendMessage = function() {
    const inputElement = document.getElementById('chat-input');
    const userPrompt = inputElement.value.trim();

    if (userPrompt === '' || isTyping) return;

    // 1. Setup view
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('chat-container-scrollable').classList.remove('hidden');

    // 2. Add user message
    chatHistory.push({ role: 'user', content: userPrompt });
    renderMessage('user', userPrompt);

    // 3. Clear input and disable
    inputElement.value = '';
    checkInputStatus();
    inputElement.setAttribute('disabled', 'true');
    isTyping = true;

    // 4. Render AI thinking/typing bubble
    const thinkingBubble = renderMessage('model', 'Thinking...', true);
    
    // 5. Determine if this is an image or text request
    const isImageRequest = userPrompt.startsWith(CONFIG.PROMPTS.image.trim());

    // 6. Define the translation instruction based on the current language
    const translationInstruction = L10N[currentLanguage].lang_api_instruction;

    // 7. Call the appropriate API
    if (isImageRequest) {
        generateImage(userPrompt, thinkingBubble, translationInstruction);
    } else {
        callGeminiTextAPI(userPrompt, thinkingBubble, translationInstruction);
    }
}

// --- API HANDLERS ---

/** Calls the Gemini API for TEXT generation. */
async function callGeminiTextAPI(prompt, thinkingBubble, systemInstruction) {
    const apiKey = GEMINI_CONFIG.API_KEY; 
    const model = GEMINI_CONFIG.MODEL_NAME;
    // Use the new v1 base URL and construct the full path
    const apiUrl = `${GEMINI_CONFIG.API_BASE_URL_TEXT}/models/${model}:generateContent?key=${apiKey}`;

    // Build the chat history for context
    const contents = chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', 
        parts: [{ text: msg.content }]
    })).slice(-10);

    const payload = {
        contents: contents,
        generationConfig: {
            maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
            temperature: GEMINI_CONFIG.TEMPERATURE,
        },
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        // Using the corrected tool name: google_search
        ...(GEMINI_CONFIG.ENABLE_SEARCH_GROUNDING && { tools: [{ "google_search": {} }] })
    };
    
    const maxRetries = 3;
    let attempt = 0;
    let finalResult = null;
    let success = false;
    let errorDetails = null;

    while (attempt < maxRetries && !success) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                // Log and capture detailed error response for debugging
                const errorBody = await response.json();
                errorDetails = JSON.stringify(errorBody, null, 2);
                console.error(`Gemini Text API HTTP Error ${response.status}:`, errorBody);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            finalResult = await response.json();
            success = true;

        } catch (error) {
            console.error(`Gemini Text API Attempt ${attempt + 1} failed:`, error.message, (errorDetails || ''));
            attempt++;
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    const candidate = finalResult?.candidates?.[0];
    
    let aiResponseText = CONFIG.MESSAGES.error_api_call_failed;
    let sources = [];

    if (success && candidate && candidate.content?.parts?.[0]?.text) {
        aiResponseText = candidate.content.parts[0].text;
        
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

    } else if (candidate?.safetyRatings?.length > 0) {
        aiResponseText = CONFIG.MESSAGES.error_api_blocked;
        console.warn("Response blocked by safety settings:", candidate.safetyRatings);
    } else if (!success) {
        // If all retries failed
        aiResponseText = CONFIG.MESSAGES.error_api_call_failed;
    }

    try {
        await streamResponse(aiResponseText, thinkingBubble, sources);
    } catch (e) {
        console.error("Error during response streaming:", e);
        showToast("An error occurred while displaying the response.");
    }
    
    // Save chat if this is the first response
    if (chatHistory.length === 2) {
        saveCurrentChat();
    }

    // Re-enable input
    enableInput();
}


/** Calls the Imagen API for IMAGE generation. */
async function generateImage(userPrompt, thinkingBubble) {
    const apiKey = GEMINI_CONFIG.API_KEY; 
    const model = GEMINI_CONFIG.IMAGE_MODEL_NAME;
    // Use the dedicated image API base URL
    const apiUrl = `${GEMINI_CONFIG.API_BASE_URL_IMAGE}${model}:predict?key=${apiKey}`;
    
    // Extract the actual image prompt part
    const imagePrompt = userPrompt.substring(CONFIG.PROMPTS.image.length).trim();

    const payload = { 
        instances: { prompt: imagePrompt }, 
        parameters: { "sampleCount": 1} 
    };

    const maxRetries = 3;
    let attempt = 0;
    let finalResult = null;
    let success = false;

    // Replace loading dots with spinner
    const contentDiv = thinkingBubble.querySelector('.markdown-content');
    contentDiv.innerHTML = `<div class="flex flex-col items-center justify-center p-4">
                                <div class="image-loading"></div>
                                <p class="mt-2 text-sm text-gray-400">Generating Image...</p>
                            </div>`;

    while (attempt < maxRetries && !success) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                console.error(`Imagen API HTTP Error ${response.status}:`, await response.text());
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            finalResult = await response.json();
            success = true;

        } catch (error) {
            console.error(`Imagen API Attempt ${attempt + 1} failed:`, error);
            attempt++;
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    const prediction = finalResult?.predictions?.[0];
    const base64Data = prediction?.bytesBase64Encoded;
    
    // Remove the old content and replace with image or error
    contentDiv.innerHTML = ''; 

    if (base64Data) {
        const imageUrl = `data:image/png;base64,${base64Data}`;
        renderImageResult(imageUrl, thinkingBubble, imagePrompt);
        // Add a mock text response to history for context
        chatHistory.push({ role: 'model', content: `[Generated image for: "${imagePrompt}"]` }); 
    } else {
        contentDiv.innerHTML = `<p class="text-red-400">${CONFIG.MESSAGES.error_image_failed}</p>`;
        // Add failure message to history
        chatHistory.push({ role: 'model', content: `[Image generation failed for: "${imagePrompt}"]` }); 
    }

    // Save chat if this is the first response
    if (chatHistory.length === 2) {
        saveCurrentChat();
    }

    thinkingBubble.querySelector('.ai-bubble-footer').classList.remove('hidden');
    enableInput();
}

// --- UTILITY & VIEW FUNCTIONS (Exported to window for HTML access) ---

/** Sets the text input value and focuses it. Used by suggestion buttons. */
window.setPrompt = function(prompt) {
    document.getElementById('chat-input').value = prompt;
    document.getElementById('chat-input').focus();
    checkInputStatus();
}

/** Switches the input bar buttons between Mic/Wave and Send based on input text. */
window.checkInputStatus = function() {
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

/** Opens the Add Tools modal. */
window.openAddToolsModal = function() { document.getElementById('add-tools-modal').classList.remove('hidden'); }

/** Closes the Add Tools modal. */
window.closeAddToolsModal = function() { document.getElementById('add-tools-modal').classList.add('hidden'); }

/** Handles an action from the tools modal (e.g., Camera, Create Image). */
window.handleToolAction = function(tool, prompt = '') {
    closeAddToolsModal();
    if (prompt) {
        setPrompt(prompt);
    } else {
        showFeatureNotAvailable(tool);
    }
}

/** Re-enables the input field and resets typing state. */
function enableInput() {
    const inputElement = document.getElementById('chat-input');
    inputElement.removeAttribute('disabled');
    isTyping = false;
    inputElement.focus();
}


/** Simulates the streaming effect of a TEXT response and handles source display. */
async function streamResponse(content, bubble, sources = []) {
    const contentDiv = bubble.querySelector('.markdown-content');
    const footerDiv = bubble.querySelector('.ai-bubble-footer');

    const totalChunks = content.length;
    let streamedText = '';

    // Clear loading ellipsis and insert the cursor
    contentDiv.innerHTML = `<span class="typing-cursor"></span>`;

    // Simulate chunk delivery
    for (let i = 0; i < totalChunks; i++) {
        streamedText += content[i];

        if (i % 5 === 0 || i === totalChunks - 1) {
            const htmlContent = converter.makeHtml(streamedText);
            contentDiv.innerHTML = htmlContent + `<span class="typing-cursor"></span>`;
            scrollChatToBottom();
        }
        // Reduced delay for faster streaming effect
        await new Promise(resolve => setTimeout(resolve, 3)); 
    }

    // Finalize the content
    contentDiv.innerHTML = converter.makeHtml(content);
    const cursor = bubble.querySelector('.typing-cursor');
    if (cursor) cursor.remove();
    
    // Add sources display if sources exist
    if (sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'text-xs text-gray-500 pt-2 border-t border-gray-800 mt-2 flex flex-wrap gap-1';
        sourcesDiv.innerHTML = '<span class="font-semibold mr-1 text-purple-400">Sources:</span>';
        sources.slice(0, 3).forEach((source, index) => {
            const link = document.createElement('a');
            link.href = source.uri;
            link.target = '_blank';
            link.className = 'text-blue-400 hover:text-blue-300 transition-colors underline rounded-full px-2 py-0.5 bg-gray-700';
            link.textContent = `#${index + 1} ${source.title.substring(0, 30)}${source.title.length > 30 ? '...' : ''}`;
            sourcesDiv.appendChild(link);
        });
        contentDiv.appendChild(sourcesDiv);
    }

    footerDiv.classList.remove('hidden');

    // Add final response to chat history
    chatHistory.push({ role: 'model', content: content });

    scrollChatToBottom();
}


/** Renders the generated image and success message into the bubble. */
function renderImageResult(imageUrl, bubble, prompt) {
    const contentDiv = bubble.querySelector('.markdown-content');
    contentDiv.classList.add('p-0');
    
    contentDiv.innerHTML = `
        <div class="p-3">
            <p class="text-sm font-semibold mb-2">${CONFIG.MESSAGES.image_success}</p>
            <img src="${imageUrl}" alt="${prompt}" class="w-full h-auto rounded-lg object-cover shadow-xl" />
            <p class="text-xs text-gray-500 mt-2 italic">${prompt}</p>
        </div>
    `;
}

/** Renders a single chat message bubble. */
function renderMessage(role, content, isThinking = false) {
    const chatContainer = document.getElementById('chat-container-scrollable');

    const bubbleContainer = document.createElement('div');
    // Layout is always LTR, so user justification is fixed to end/right
    bubbleContainer.className = `flex mb-4 max-w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `rounded-xl p-3 max-w-[85%] sm:max-w-[70%] shadow-lg`;
    bubble.style.backgroundColor = role === 'user' ? 'var(--user-bubble)' : 'var(--ai-bubble)';
    bubble.style.color = 'var(--text-light)';

    if (role === 'user') {
        bubble.classList.add('rounded-tr-sm');
        bubble.innerHTML = `<p class="whitespace-pre-wrap">${content}</p>`;
    } else {
        bubble.classList.add('rounded-tl-sm', 'flex', 'flex-col');
        
        const contentDiv = document.createElement('div');
        // Important: Use LTR direction for Markdown content, as it's designed that way, 
        // but align the text correctly for Kurdish (RTL language)
        const textDirection = (currentLanguage === 'ku') ? 'rtl' : 'ltr';
        contentDiv.style.direction = textDirection;

        contentDiv.className = `markdown-content pb-2`;

        if (isThinking) {
            // Simplified thinking animation
            contentDiv.innerHTML = `<i data-lucide="loader" class="w-6 h-6 animate-spin text-gray-500"></i>`;
        } else {
            contentDiv.innerHTML = converter.makeHtml(content);
        }
        bubble.appendChild(contentDiv);

        const footerDiv = document.createElement('div');
        footerDiv.className = `ai-bubble-footer pt-2 flex justify-end text-xs space-x-3 text-gray-400 ${isThinking ? 'hidden' : ''}`;

        const actions = [
            { icon: 'copy', action: () => copyToClipboard(content) },
            { icon: 'volume-2', action: () => showFeatureNotAvailable(CONFIG.MESSAGES.action_tts) },
            { icon: 'rotate-cw', action: () => showFeatureNotAvailable(CONFIG.MESSAGES.action_regenerate) },
            { icon: 'thumbs-up', action: () => showToast(CONFIG.MESSAGES.action_like) },
            { icon: 'thumbs-down', action: () => showToast(CONFIG.MESSAGES.action_dislike) },
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

    // Re-initialize lucide icons for the new element
    lucide.createIcons(); 
    scrollChatToBottom();
    return bubbleContainer;
}

/** Scrolls the chat container to the bottom. */
function scrollChatToBottom() {
    const container = document.getElementById('chat-container-scrollable');
    container.scrollTop = container.scrollHeight;
}

/** Displays a temporary toast notification. */
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

/** Copies text content to the clipboard and shows a toast. */
function copyToClipboard(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(CONFIG.MESSAGES.action_copy_success);
}

/** Displays a feature not available message using the toast notification. */
function showFeatureNotAvailable(featureName) {
    const message = CONFIG.MESSAGES.action_feature_not_available(featureName);
    showToast(message);
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Bind Enter key to send message
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('send-button').click();
        }
    });

    // 2. Load recent chats from local storage
    loadRecentChats();
    
    // 3. Set the initial language UI (English)
    updateUIForLanguage();

    // 4. Initialize Lucide icons
    lucide.createIcons();
});
