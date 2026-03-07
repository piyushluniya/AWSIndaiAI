import { NextRequest, NextResponse } from "next/server"
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, policyContext, cardContext, conversationHistory } = body

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 })
    }

    const lambdaFunctionName = process.env.COVERAGE_QA_FUNCTION_NAME
    if (!lambdaFunctionName) throw new Error("COVERAGE_QA_FUNCTION_NAME not set")

    const lambda = new LambdaClient({ region: "us-east-1" })

    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: lambdaFunctionName,
        Payload: JSON.stringify({ question, policyContext, cardContext, conversationHistory })
      })
    )

    const payload = JSON.parse(new TextDecoder().decode(response.Payload))

    if (response.FunctionError) {
      throw new Error(payload.errorMessage || "Lambda invocation failed")
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error("Coverage QA error:", error)
    return NextResponse.json(
      { error: "Coverage Q&A failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
