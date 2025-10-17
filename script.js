<script>
    // --- GLOBAL STATE AND CONFIG ---
    let chatHistory = [];
    let isTyping = false;
    let authReady = false;

    // Configuration for static text and prompts
    const CONFIG = {
        PROMPTS: {
            image: 'Generate a high-quality image of a Kurdish landscape.',
            summarize: 'Summarize the plot of the novel "The Captive" by Rebin Hardi.',
            brainstorm: 'Brainstorm 5 ideas for a startup in Erbil.',
            more: 'What are some fun facts about the Kurdistan Region of Iraq?',
            thinking: 'Analyze the historical significance of the Medes.',
            research: 'Write a deep report on the future of Kurdish language technology.',
            search: 'What is the current exchange rate for the Iraqi Dinar to the US Dollar?',
            study: 'Explain the concept of neural networks in simple terms.',
        },
        MESSAGES: {
            action_copy_success: 'Content copied to clipboard!',
            action_tts: 'TTS feature not yet available.',
            action_regenerate: 'Regenerate feature not yet available.',
            action_like: 'Thanks for the feedback!',
            action_dislike: 'Thanks for the feedback. We will improve.',
            action_feature_not_available: (feature) => `${feature} is not yet available in this clone.`,
            error_api_call_failed: 'Failed to get a response from the API.',
            error_api_response_empty: 'The AI generated an empty response.',
            error_auth_fail: 'Firebase initialization failed. Chat functionality is disabled.',
        }
    };

    // Markdown Converter Setup
    const converter = new showdown.Converter({
        tables: true,
        strikethrough: true,
        tasklists: true,
        simpleLineBreaks: true
    });


    // --- FIREBASE/AUTH SETUP (MANDATORY) ---
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    let app, auth, db, currentUserId;

    /** Initializes Firebase and authenticates the user. */
    async function initFirebase() {
        if (!firebaseConfig || typeof firebaseImports === 'undefined') {
            console.error(CONFIG.MESSAGES.error_auth_fail);
            return;
        }

        try {
            app = firebaseImports.initializeApp(firebaseConfig);
            auth = firebaseImports.getAuth(app);
            db = firebaseImports.getFirestore(app);

            // Authentication
            if (initialAuthToken) {
                await firebaseImports.signInWithCustomToken(auth, initialAuthToken);
            } else {
                await firebaseImports.signInAnonymously(auth);
            }
            
            currentUserId = auth.currentUser?.uid || crypto.randomUUID();
            authReady = true;
            console.log('Firebase initialized and authenticated. User ID:', currentUserId);
            // Ensure input status is checked after auth is ready
            checkInputStatus();
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            showToast(CONFIG.MESSAGES.error_auth_fail);
        }
    }


    // --- CHAT INTERFACE FUNCTIONS ---

    /**
     * Displays a feature not available message using the toast notification.
     * @param {string} featureName - The name of the feature (e.g., 'Library').
     */
    function showFeatureNotAvailable(featureName) {
        const message = CONFIG.MESSAGES.action_feature_not_available(featureName);
        showToast(message);
    }

    /** Toggles the sidebar visibility. */
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
            lucide.createIcons(); // Ensure icons in sidebar are rendered
        }
    }

    /** Clears the chat history and resets the view to the home screen. */
    function clearChat() {
        chatHistory = [];
        const chatContainer = document.getElementById('chat-container-scrollable');
        const homeScreen = document.getElementById('home-screen');
        chatContainer.innerHTML = '';
        chatContainer.classList.add('hidden');
        homeScreen.classList.remove('hidden');
        document.getElementById('chat-input').value = '';
        checkInputStatus();
    }

    /**
     * Sets the text input value and focuses it. Used by suggestion buttons.
     * @param {string} prompt - The text to put into the input field.
     */
    function setPrompt(prompt) {
        document.getElementById('chat-input').value = prompt;
        document.getElementById('chat-input').focus();
        checkInputStatus();
        closeAddToolsModal();
    }

    /** Opens the Add Tools modal. */
    function openAddToolsModal() {
        const modal = document.getElementById('add-tools-modal');
        modal.classList.remove('hidden');
        lucide.createIcons();
    }

    /** Closes the Add Tools modal. */
    function closeAddToolsModal() {
        document.getElementById('add-tools-modal').classList.add('hidden');
    }

    /**
     * Handles an action from the tools modal (e.g., Camera, Create Image).
     * @param {string} tool - The name of the tool.
     * @param {string} [prompt=''] - Optional prompt to set in the chat input.
     */
    function handleToolAction(tool, prompt = '') {
        closeAddToolsModal();
        if (prompt) {
            setPrompt(prompt);
        } else {
            // For features like Camera/Photos/Files/Explore Tools, show toast
            showFeatureNotAvailable(tool);
        }
    }

    /** FIX: Correctly switches the input bar buttons between Mic/Wave and Send based on input text and typing status. */
    function checkInputStatus() {
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const micButton = document.getElementById('mic-button');

        const hasText = input.value.trim().length > 0;
        
        if (hasText && !isTyping && authReady) {
            sendButton.classList.remove('hidden');
            sendButton.removeAttribute('disabled');
            micButton.classList.add('hidden');
        } else {
            sendButton.classList.add('hidden');
            sendButton.setAttribute('disabled', 'true');
            micButton.classList.remove('hidden');
        }
    }

    /** Main function to handle sending a message (user prompt). */
    async function handleSendMessage() {
        const inputElement = document.getElementById('chat-input');
        const userPrompt = inputElement.value.trim();

        if (userPrompt === '' || isTyping || !authReady) {
             console.log(`Blocked send: Prompt empty (${userPrompt === ''}), Typing (${isTyping}), Auth not ready (${!authReady})`);
             return;
        }

        // 1. Hide home screen and show chat container
        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('chat-container-scrollable').classList.remove('hidden');

        // 2. Add user message to history and render
        chatHistory.push({ role: 'user', content: userPrompt });
        renderMessage('user', userPrompt);

        // 3. Clear input and disable
        inputElement.value = '';
        inputElement.setAttribute('disabled', 'true');
        isTyping = true;
        checkInputStatus(); // Update button immediately

        // 4. Render AI thinking/typing bubble
        const thinkingBubble = renderMessage('model', '', true);

        try {
            // 5. Fetch response from Gemini
            await fetchGeminiResponse(userPrompt, thinkingBubble);
        } catch (error) {
            console.error('Gemini API final error:', error);
            // Stream the error message to the user bubble
            const errorText = `**Error:** ${error.message || CONFIG.MESSAGES.error_api_call_failed}. Please try again later.`;
            streamResponse(errorText, [], thinkingBubble);
        } finally {
            // 6. Re-enable input and button (FIX: ensures button state is reset)
            inputElement.removeAttribute('disabled');
            isTyping = false;
            checkInputStatus();
            inputElement.focus();
        }
    }


    /**
     * Executes the Gemini API call with exponential backoff and handles the response.
     * @param {string} prompt - The user's prompt.
     * @param {HTMLElement} thinkingBubble - The bubble element to stream into.
     */
    async function fetchGeminiResponse(prompt, thinkingBubble) {
        const model = 'gemini-2.5-flash-preview-09-2025';
        const apiKey = ""; // Leave as empty string
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            // Enable Google Search grounding (Web search)
            tools: [{ "google_search": {} }],
            // System instruction to guide the persona
            systemInstruction: {
                parts: [{ text: "You are KurdishGPT, a helpful and friendly AI assistant focused on providing factual, relevant, and engaging information about the world, with special emphasis on Kurdish culture, history, and news where applicable. Respond concisely and use Markdown for formatting." }]
            }
        };

        const maxRetries = 3;
        let response;
        let delay = 1000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const result = await response.json();
                    const candidate = result.candidates?.[0];

                    if (candidate && candidate.content?.parts?.[0]?.text) {
                        const text = candidate.content.parts[0].text;
                        
                        // Extract grounding sources
                        let sources = [];
                        const groundingMetadata = candidate.groundingMetadata;
                        if (groundingMetadata && groundingMetadata.groundingAttributions) {
                            sources = groundingMetadata.groundingAttributions
                                .map(attribution => ({
                                    uri: attribution.web?.uri,
                                    title: attribution.web?.title,
                                }))
                                .filter(source => source.uri && source.title);
                        }

                        // Start streaming simulation of the real response
                        streamResponse(text, sources, thinkingBubble);
                        return;

                    } else {
                        throw new Error(CONFIG.MESSAGES.error_api_response_empty);
                    }
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

            } catch (error) {
                console.error(`Attempt ${i + 1} failed: ${error.message}`);
                if (i === maxRetries - 1) {
                    // Propagate final failure to the calling function
                    throw new Error(CONFIG.MESSAGES.error_api_call_failed);
                }
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }


    /**
     * Simulates the streaming effect of a response.
     * @param {string} content - The full response text.
     * @param {Array<Object>} sources - Array of citation sources.
     * @param {HTMLElement} bubbleContainer - The target bubble container element.
     */
    async function streamResponse(content, sources, bubbleContainer) {
        const contentDiv = bubbleContainer.querySelector('.markdown-content');
        const footerDiv = bubbleContainer.querySelector('.ai-bubble-footer');

        const totalChunks = content.length;
        let streamedText = '';

        // Clear initial content and add typing cursor
        contentDiv.innerHTML = `<span class="typing-cursor"></span>`;

        // Simulate chunk delivery
        for (let i = 0; i < totalChunks; i++) {
            streamedText += content[i];

            // Only update DOM every N characters or if it's the last character
            if (i % 8 === 0 || i === totalChunks - 1) {
                const htmlContent = converter.makeHtml(streamedText);
                contentDiv.innerHTML = htmlContent + `<span class="typing-cursor"></span>`;
                scrollChatToBottom();
            }
            await new Promise(resolve => setTimeout(resolve, 3)); // Fast typing
        }

        // Finalize the content
        contentDiv.innerHTML = converter.makeHtml(content);
        
        // Safely remove the cursor
        const cursor = bubbleContainer.querySelector('.typing-cursor');
        if (cursor) cursor.remove();
        
        // Add citations if available
        if (sources.length > 0) {
            const sourcesHtml = sources.map((s, index) => 
                `<a href="${s.uri}" target="_blank" class="text-xs text-blue-400 hover:text-blue-300 transition-colors block leading-tight truncate">
                    <i data-lucide="link" class="w-3 h-3 inline-block mr-1"></i>
                    Source ${index + 1}: ${s.title}
                </a>`
            ).join('');
            
            const citationDiv = document.createElement('div');
            citationDiv.className = 'mt-3 pt-3 border-t border-gray-700 space-y-1';
            citationDiv.innerHTML = sourcesHtml;
            contentDiv.appendChild(citationDiv);
            lucide.createIcons();
        }

        // Show the footer actions
        footerDiv.classList.remove('hidden');

        // Add to chat history
        chatHistory.push({ role: 'model', content: content, sources: sources });

        scrollChatToBottom();
    }


    /**
     * Renders a single chat message bubble.
     * @param {string} role - 'user' or 'model'.
     * @param {string} content - The message content.
     * @param {boolean} isThinking - If true, displays a typing/loading state.
     * @returns {HTMLElement} - The newly created bubble element.
     */
    function renderMessage(role, content, isThinking = false) {
        const chatContainer = document.getElementById('chat-container-scrollable');

        // Main Bubble Container
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = `flex mb-6 max-w-full ${role === 'user' ? 'justify-end' : 'justify-start'}`;

        // Content Wrapper
        const bubble = document.createElement('div');
        bubble.className = `rounded-2xl p-3 max-w-[85%] sm:max-w-[70%] shadow-lg transition-all duration-100`;
        bubble.style.backgroundColor = role === 'user' ? 'var(--user-bubble)' : 'var(--ai-bubble)';
        bubble.style.color = 'var(--text-light)';

        if (role === 'user') {
            bubble.classList.add('rounded-tr-md', 'font-medium');
            bubble.innerHTML = `<p class="whitespace-pre-wrap">${content}</p>`;
        } else {
            bubble.classList.add('rounded-tl-md', 'flex', 'flex-col');
            bubble.style.textAlign = 'left';

            // Content Area
            const contentDiv = document.createElement('div');
            contentDiv.className = `markdown-content pb-1`;

            if (isThinking) {
                // Initial content for thinking state
                contentDiv.innerHTML = `<i data-lucide="loader-circle" class="w-6 h-6 animate-spin text-gray-500"></i>`;
            } else {
                contentDiv.innerHTML = converter.makeHtml(content);
            }
            bubble.appendChild(contentDiv);

            // Footer (Actions)
            const footerDiv = document.createElement('div');
            footerDiv.className = `ai-bubble-footer pt-2 flex justify-end text-xs space-x-3 text-gray-400 ${isThinking ? 'hidden' : ''}`;

            const actions = [
                { icon: 'copy', action: () => copyToClipboard(content) },
                { icon: 'volume-2', action: () => showFeatureNotAvailable(CONFIG.MESSAGES.action_tts) },
                { icon: 'rotate-cw', action: () => showFeatureNotAvailable(CONFIG.MESSAGES.action_regenerate) },
                { icon: 'thumbs-up', action: () => showToast(CONFIG.MESSAGES.action_like) },
                { icon: 'thumbs-down', action: () => showToast(CONFIG.MESSAGES.action_dislike) },
            ];

            // Render action buttons
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

        // Re-render Lucide icons
        lucide.createIcons();
        scrollChatToBottom();
        return bubbleContainer; // Return container for streaming/thinking updates
    }


    /** Scrolls the chat container to the bottom. */
    function scrollChatToBottom() {
        const container = document.getElementById('chat-container-scrollable');
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Displays a temporary toast notification.
     * @param {string} message - The message to display.
     */
    function showToast(message) {
        let toast = document.getElementById('chat-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'chat-toast';
            toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-700 text-white text-sm rounded-full shadow-xl transition-opacity duration-300 z-50 opacity-0';
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

    /**
     * Copies text content to the clipboard and shows a toast.
     * @param {string} text - The text to copy.
     */
    function copyToClipboard(text) {
        // Exclude citation links from the copied text
        const bubbleContent = text.replace(/<a[^>]*>(.*?)<\/a>/g, '').trim();
        const el = document.createElement('textarea');
        el.value = bubbleContent;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast(CONFIG.MESSAGES.action_copy_success);
    }

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        // Bind Enter key to send message
        document.getElementById('chat-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('send-button').click();
            }
        });
        
        // Initialize Lucide icons on load
        lucide.createIcons();

        // Initialize Firebase
        initFirebase();
    });
</script>
