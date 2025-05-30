import { defineFunction, secret } from '@aws-amplify/backend';

export const generatePage = defineFunction({
  name: 'generatePage',
  entry: './handler.ts',
  environment: {
    GOOGLE_API_KEY: secret('GOOGLE_API_KEY'),
    AMPLIFY_STORAGE_BUCKET_NAME: secret('AMPLIFY_STORAGE_BUCKET_NAME'),
  },
  memoryMB: 128,
  timeoutSeconds: 60
});
