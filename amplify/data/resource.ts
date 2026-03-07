import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.string().required(),
      name: a.string().required(),
      age: a.integer(),
      city: a.string(),
      familyMembers: a.string(), // JSON stringified
      whatsappNumber: a.string(), // e.g. "+919876543210"
      whatsappConnected: a.boolean(), // true once Twilio webhook confirms join
      createdAt: a.string()
    })
    .authorization((allow) => [allow.owner()]),

  UserCard: a
    .model({
      userId: a.string().required(),
      cardName: a.string().required(),
      bankName: a.string(),
      cardType: a.string(),
      coverageData: a.string(), // JSON stringified
      hiddenValue: a.integer()
    })
    .authorization((allow) => [allow.owner()]),

  UserPolicy: a
    .model({
      userId: a.string().required(),
      fileName: a.string().required(),
      s3Key: a.string().required(),
      parsedCoverage: a.string(), // JSON stringified
      insurer: a.string(),
      status: a.string() // "uploading" | "parsing" | "ready" | "error"
    })
    .authorization((allow) => [allow.owner()]),

  ChatMessage: a
    .model({
      sessionId: a.string().required(),
      userId: a.string().required(),
      role: a.string().required(), // "user" | "assistant"
      content: a.string().required(),
      timestamp: a.string()
    })
    .authorization((allow) => [allow.owner()])
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool"
  }
})
