import { type ClientSchema, a, defineData } from "@aws-amplify/backend"
import { generatePage } from '../function/generatePage/resource';

const schema = a.schema({
    generatePage: a
    .query()
    .arguments({
      prompt: a.string(),
    })
    .returns(a.string())
    .authorization(allow => [allow.guest()])
    .handler(a.handler.function(generatePage)),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
})