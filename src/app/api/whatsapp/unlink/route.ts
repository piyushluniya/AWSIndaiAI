import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb"
import { getAwsClientConfig } from "@/lib/aws-credentials"

const dynamo = new DynamoDBClient(getAwsClientConfig())
const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE!

// POST /api/whatsapp/unlink
// Body: { profileId }
// Clears all WhatsApp-related fields from the profile.
export async function POST(req: NextRequest) {
  try {
    const { profileId } = await req.json()
    if (!profileId) {
      return NextResponse.json({ error: "profileId required" }, { status: 400 })
    }

    await dynamo.send(new UpdateItemCommand({
      TableName: PROFILE_TABLE,
      Key: { id: { S: profileId } },
      UpdateExpression: "REMOVE whatsappNumber, whatsappConnected, waSessionState SET updatedAt = :ua",
      ExpressionAttributeValues: {
        ":ua": { S: new Date().toISOString() }
      }
    }))

    console.log(`[whatsapp/unlink] Unlinked WhatsApp for profileId ${profileId}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[whatsapp/unlink] Error:", err)
    return NextResponse.json({ error: "Failed to unlink" }, { status: 500 })
  }
}
