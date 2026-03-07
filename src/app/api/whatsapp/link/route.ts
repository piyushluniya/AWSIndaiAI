import { NextRequest, NextResponse } from "next/server"
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb"

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" })
const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE!

// POST /api/whatsapp/link
// Body: { profileId, phone }
// Writes whatsappNumber directly to DynamoDB, bypassing AppSync schema restrictions.
export async function POST(req: NextRequest) {
  try {
    const { profileId, phone } = await req.json()
    if (!profileId || !phone) {
      return NextResponse.json({ error: "profileId and phone required" }, { status: 400 })
    }

    await dynamo.send(new UpdateItemCommand({
      TableName: PROFILE_TABLE,
      Key: { id: { S: profileId } },
      UpdateExpression: "SET whatsappNumber = :phone, whatsappConnected = :f, waSessionState = :s, updatedAt = :ua",
      ExpressionAttributeValues: {
        ":phone": { S: phone },
        ":f": { BOOL: false },
        ":s": { S: "" },
        ":ua": { S: new Date().toISOString() }
      }
    }))

    console.log(`[whatsapp/link] Saved number ${phone} for profileId ${profileId}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[whatsapp/link] Error:", err)
    return NextResponse.json({ error: "Failed to save number" }, { status: 500 })
  }
}
