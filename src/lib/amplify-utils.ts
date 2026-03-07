import { createServerRunner } from "@aws-amplify/adapter-nextjs"
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth/server"
import { cookies } from "next/headers"
import outputs from "../../amplify_outputs.json"

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs
})

export async function getServerAuthSession() {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec)
  })
}

export async function getServerCurrentUser() {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => getCurrentUser(contextSpec)
  })
}
