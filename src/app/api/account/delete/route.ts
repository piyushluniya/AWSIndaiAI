import { NextRequest, NextResponse } from "next/server"
import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb"
import { getAwsClientConfig } from "@/lib/aws-credentials"

const dynamo = new DynamoDBClient(getAwsClientConfig())

const PROFILE_TABLE = process.env.DYNAMODB_PROFILE_TABLE!
const POLICY_TABLE = process.env.DYNAMODB_POLICY_TABLE!
const CARD_TABLE = "UserCard-inin2vs4crfsfm4isw6fmvkwui-NONE"
const CHAT_TABLE = "ChatMessage-inin2vs4crfsfm4isw6fmvkwui-NONE"

async function deleteAllByUserId(tableName: string, userId: string) {
  const result = await dynamo.send(new ScanCommand({
    TableName: tableName,
    FilterExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": { S: userId } },
    ProjectionExpression: "id"
  }))

  const items = result.Items || []
  await Promise.all(
    items.map((item) =>
      dynamo.send(new DeleteItemCommand({
        TableName: tableName,
        Key: { id: item["id"] }
      }))
    )
  )
  return items.length
}

// POST /api/account/delete
// Body: { userId }
// Deletes all DynamoDB records for this user across all tables.
// The Cognito user deletion is handled client-side via deleteUser() from aws-amplify/auth.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    console.log(`[account/delete] Deleting all data for userId: ${userId}`)

    const [profiles, policies, cards, chats] = await Promise.all([
      deleteAllByUserId(PROFILE_TABLE, userId),
      deleteAllByUserId(POLICY_TABLE, userId),
      deleteAllByUserId(CARD_TABLE, userId),
      deleteAllByUserId(CHAT_TABLE, userId).catch(() => 0) // non-fatal if table empty
    ])

    console.log(`[account/delete] Deleted: ${profiles} profiles, ${policies} policies, ${cards} cards, ${chats} chats`)
    return NextResponse.json({ ok: true, deleted: { profiles, policies, cards, chats } })
  } catch (err) {
    console.error("[account/delete] Error:", err)
    return NextResponse.json({ error: "Failed to delete account data" }, { status: 500 })
  }
}
