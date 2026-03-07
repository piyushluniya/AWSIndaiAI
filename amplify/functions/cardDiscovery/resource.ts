import { defineFunction, secret } from "@aws-amplify/backend"

export const cardDiscovery = defineFunction({
  name: "card-discovery",
  entry: "./handler.ts",
  environment: {
    GEMINI_API_KEY: secret("GEMINI_API_KEY"),
    GEMINI_MODEL: "gemini-2.5-flash-lite"
  },
  timeoutSeconds: 30
})
