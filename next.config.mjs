/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
    DYNAMODB_PROFILE_TABLE: process.env.DYNAMODB_PROFILE_TABLE,
    DYNAMODB_POLICY_TABLE: process.env.DYNAMODB_POLICY_TABLE,
    STORAGE_BIMASETU_BUCKET_NAME: process.env.STORAGE_BIMASETU_BUCKET_NAME,
    POLICY_PARSER_FUNCTION_NAME: process.env.POLICY_PARSER_FUNCTION_NAME,
    APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID,
    APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@aws-sdk/client-bedrock-runtime",
      "@aws-sdk/client-textract",
      "@aws-sdk/client-lambda"
    ]
  },
  // Reduce bundle size: treat all AWS SDK packages as external on server
  serverExternalPackages: [
    "@aws-sdk/client-lambda",
    "@aws-sdk/client-bedrock-runtime",
    "@aws-sdk/client-textract"
  ]
}

export default nextConfig
