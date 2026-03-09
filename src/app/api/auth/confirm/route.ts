import { NextRequest, NextResponse } from "next/server"
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider"

const USER_POOL_ID = "us-east-1_qGKQgpWfw"

const cognito = new CognitoIdentityProviderClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || ""
  }
})

// POST /api/auth/confirm
// Auto-confirms a Cognito user immediately after signup.
// Required because autoVerifiedAttributes is empty — accounts start UNCONFIRMED.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

    await cognito.send(new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: email
    }))

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Confirm failed"
    // NotAuthorizedException means user is already confirmed — treat as success
    if (message.includes("NotAuthorizedException") || message.includes("already confirmed")) {
      return NextResponse.json({ ok: true })
    }
    console.error("[auth/confirm] Error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
