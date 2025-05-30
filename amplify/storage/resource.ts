import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'pages',
  access: (allow) => ({
    'generated-pages/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read'])
    ]
  })
});
