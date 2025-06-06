import { type ClientSchema, defineData, a } from '@aws-amplify/backend';
import { generatePage } from '../function/generatePage/resource';

const schema = a.schema({
  dummy: a.query().returns(a.string()), // Remove handler, use default resolver
  generatePage: a
    .mutation()
    .arguments({ prompt: a.string() })
    .returns(a.string())
    .authorization(allow => [allow.publicApiKey()]) // Use publicApiKey for API key auth
    .handler(a.handler.function(generatePage))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});
