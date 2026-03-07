import { defineFunction } from "@aws-amplify/backend"

export const coverageQA = defineFunction({
  name: "coverage-qa",
  entry: "./handler.ts",
  environment: {
    GEMINI_API_KEY: "AIzaSyCjNK5X7K3r77ICeSAN8cVLDNWDeToLkic",
    GEMINI_MODEL: "gemini-2.5-flash-lite"
  },
  timeoutSeconds: 60
})
