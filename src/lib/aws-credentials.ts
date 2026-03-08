// Provides explicit AWS credentials for Amplify Hosting SSR environment,
// which lacks IAM permissions for DynamoDB/Lambda by default.
export function getAwsClientConfig() {
  const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY
  return {
    region: "us-east-1" as const,
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {})
  }
}
