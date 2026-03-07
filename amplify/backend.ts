import { defineBackend } from "@aws-amplify/backend"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"
import { CfnUserPool } from "aws-cdk-lib/aws-cognito"
// Note: Bedrock removed — AI is now handled via Gemini API (external HTTP call from Lambda)
import { auth } from "./auth/resource"
import { data } from "./data/resource"
import { storage } from "./storage/resource"
import { cardDiscovery } from "./functions/cardDiscovery/resource"
import { policyParser } from "./functions/policyParser/resource"
import { coverageQA } from "./functions/coverageQA/resource"

const backend = defineBackend({
  auth,
  data,
  storage,
  cardDiscovery,
  policyParser,
  coverageQA
})

// Disable email verification requirement
const { cfnResources } = backend.auth.resources
const cfnUserPool = cfnResources.cfnUserPool as CfnUserPool
cfnUserPool.autoVerifiedAttributes = []
cfnUserPool.userAttributeUpdateSettings = {
  attributesRequireVerificationBeforeUpdate: []
}

// Grant Textract permissions to policyParser
backend.policyParser.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      "textract:StartDocumentTextDetection",
      "textract:GetDocumentTextDetection",
      "textract:StartDocumentAnalysis",
      "textract:GetDocumentAnalysis"
    ],
    resources: ["*"]
  })
)

// Grant S3 read permissions to policyParser
const { bucketName } = backend.storage.resources.bucket
backend.policyParser.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["s3:GetObject"],
    resources: [`arn:aws:s3:::${bucketName}/*`]
  })
)

// Grant DynamoDB write permissions to policyParser (to update parsed results)
backend.policyParser.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ["dynamodb:UpdateItem"],
    resources: ["arn:aws:dynamodb:us-east-1:*:table/UserPolicy-inin2vs4crfsfm4isw6fmvkwui-NONE"]
  })
)
