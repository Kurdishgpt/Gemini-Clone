// script.js for AI Chat mockup

// Language toggle buttons const englishBtn = document.getElementById('englishBtn'); const kurdishBtn = document.getElementById('kurdishBtn');

if (englishBtn && kurdishBtn) { englishBtn.addEventListener('click', () => { englishBtn.classList.add('active'); kurdishBtn.classList.remove('active'); setLanguage('en'); });

kurdishBtn.addEventListener('click', () => { kurdishBtn.classList.add('active'); englishBtn.classList.remove('active'); setLanguage('ku'); }); }

// Handle send button click const sendBtn = document.querySelector('.send'); const input = document.querySelector('.input');

if (sendBtn && input) { sendBtn.addEventListener('click', sendMessage); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); }); }

function sendMessage() { const message = input.value.trim(); if (!message) return; console.log(User message: ${message}); input.value = ''; // Here you can add code to send to AI API or display on screen }

// Microphone button toggle const micBtn = document.querySelector('.mic'); let micActive = false;

if (micBtn) { micBtn.addEventListener('click', () => { micActive = !micActive; micBtn.style.color = micActive ? '#2b6df6' : '#9aa6bb'; console.log(micActive ? 'Microphone activated' : 'Microphone muted'); }); }

// Light/Dark toggle simulation (optional) const brightnessBtn = document.querySelector('[title="brightness"]'); let darkMode = true;

if (brightnessBtn) { brightnessBtn.addEventListener('click', () => { darkMode = !darkMode; document.body.style.background = darkMode ? '#0f1724' : '#f8f9fb'; document.body.style.color = darkMode ? '#fff' : '#111'; }); }

// Example of switching language text (extend as needed) function setLanguage(lang) { const title = document.querySelector('h1'); const subtitle = document.querySelector('.sub'); const cta = document.querySelector('.cta span');

if (lang === 'ku') { title.textContent = 'بەخێربێیت بۆ گەپەکانی AI'; subtitle.textContent = 'گفتوگۆ بکە بە ئینگلیزی یان کوردی، بە دەنگ یان وێنە دروست بکە'; cta.textContent = 'پێم بڵێ دەربارەی کەلتوری کوردی'; } else { title.textContent = 'Welcome to AI Chat'; subtitle.textContent = 'Start a conversation in English or Kurdish, use voice commands, or generate images'; cta.textContent = 'Tell me about Kurdish culture'; } }

