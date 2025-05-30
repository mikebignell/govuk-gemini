import { type ClientSchema, defineData, a } from '@aws-amplify/backend';
import { generatePage } from '../function/generatePage/resource';

const schema = a.schema({
    generatePage: a
      .mutation()
      .arguments({ prompt: a.string() })
      .returns(a.string())
      //.authorization(allow => [allow.guest()])
      .handler(a.handler.function(generatePage))
  })

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey', // or 'apiKey' for public, or 'userPool' for auth
  },
});
