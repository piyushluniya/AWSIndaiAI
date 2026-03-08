import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"
import { getAwsClientConfig } from "@/lib/aws-credentials"

const dynamo = new DynamoDBClient(getAwsClientConfig())
const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE!

// GET /api/whatsapp/status?phone=%2B919876543210
// Returns { connected: boolean } by scanning DynamoDB directly.
// This bypasses AppSync so it works before sandbox redeploy.
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")
  if (!phone) return NextResponse.json({ connected: false })

  try {
    const result = await dynamo.send(new ScanCommand({
      TableName: PROFILE_TABLE,
      FilterExpression: "whatsappNumber = :phone",
      ExpressionAttributeValues: { ":phone": { S: phone } },
      ProjectionExpression: "whatsappConnected"
    }))

    const item = result.Items?.[0]
    const connected = item?.["whatsappConnected"]?.BOOL === true
    return NextResponse.json({ connected })
  } catch (err) {
    console.error("[whatsapp/status] DynamoDB error:", err)
    return NextResponse.json({ connected: false })
  }
}
