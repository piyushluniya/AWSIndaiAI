import { defineStorage } from "@aws-amplify/backend"

export const storage = defineStorage({
  name: "bimaSetuStorage",
  access: (allow) => ({
    "policies/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"])
    ]
  })
})
