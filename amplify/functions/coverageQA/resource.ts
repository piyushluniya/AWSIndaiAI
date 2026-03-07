import { defineFunction, secret } from "@aws-amplify/backend"

export const coverageQA = defineFunction({
  name: "coverage-qa",
  entry: "./handler.ts",
  environment: {
    GEMINI_API_KEY: secret("GEMINI_API_KEY"),
    GEMINI_MODEL: "gemini-2.5-flash-lite"
  },
  timeoutSeconds: 60
})
