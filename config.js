// Load configuration from environment variables
const config = {
  // 🔹 Gemini API settings
  GEMINI_API_KEY: "AIzaSyCw7nVjXZ9sWu9M8zdwjb5jFVJsV5AXEbg",
  API_BASE_URL: "https://generativelanguage.googleapis.com/v1",
  MODEL_NAME: "gemini-2.0-flash",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,

  // 🔹 Kurdish TTS settings
  KURDISHTTS_API_KEY: "ed527b648f5b06abc7e2a566c9501c795467a1e4",
  KURDISHTTS_URL: "https://api.kurdishtts.com/v1/tts",
};

export default config;
