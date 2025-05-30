import { defineStorage } from '@aws-amplify/backend';
import { generatePage } from '../function/generatePage/resource';

export const storage = defineStorage({
  name: 'pages',
  access: (allow) => ({
    'generated-pages/*': [
      allow.resource(generatePage).to(['read','write']),
      allow.guest.to(['read']),
      allow.authenticated.to(['read'])
    ]
  })
});
