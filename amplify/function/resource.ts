import { defineFunction } from '@aws-amplify/backend';

export const myFunction = defineFunction({
  name: 'generateGovukPage',
  environment: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!
  },
  // Add external dependencies
  externalDependencies: ['@google/generative-ai', '@aws-sdk/client-s3']
});