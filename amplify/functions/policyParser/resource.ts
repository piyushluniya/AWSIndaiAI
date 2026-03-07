import { defineFunction } from "@aws-amplify/backend"

export const policyParser = defineFunction({
  name: "policy-parser",
  entry: "./handler.ts",
  environment: {
    GEMINI_API_KEY: "AIzaSyCjNK5X7K3r77ICeSAN8cVLDNWDeToLkic",
    GEMINI_MODEL: "gemini-2.5-flash-lite",
    DYNAMODB_POLICY_TABLE: "UserPolicy-inin2vs4crfsfm4isw6fmvkwui-NONE"
  },
  timeoutSeconds: 300
})
