import { defineFunction, secret } from '@aws-amplify/backend';

export const generatePage = defineFunction({
  name: 'generatePage',
  entry: './handler.ts',
  environment: {
    GOOGLE_API_KEY: secret(process.env.GOOGLE_API_KEY!)
  }
});
