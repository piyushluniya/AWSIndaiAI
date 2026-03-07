/** @type {import('next').NextConfig} */
const nextConfig = {
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
