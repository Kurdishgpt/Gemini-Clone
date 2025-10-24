const config = {
  API_KEYS: {
    GEMINI: {
      key: "AIzaSyCP5npS46tVtCdd9d0NSSinmLBca-5D0n0",
      apiBaseUrl: "https://generativelanguage.googleapis.com/v1",
      modelName: "gemini-2.0-flash",
      displayName: "Kgpt fast"
    },
    OPENAI: {
      key: "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",
      apiBaseUrl: "https://api.openai.com/v1",
      modelName: "gpt-4o-mini",
      displayName: "Kgpt smart"
    }
  },
  DEFAULT_PROVIDER: "GEMINI",
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  
  GEMINI_API_KEY: "AIzaSyCP5npS46tVtCdd9d0NSSinmLBca-5D0n0",
  API_BASE_URL: "https://generativelanguage.googleapis.com/v1",
  MODEL_NAME: "gemini-2.0-flash"
};

export default config; 
