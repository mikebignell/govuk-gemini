import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export const generatePage = async (input: { prompt: string }) => {
  const result = await client.graphql({
    query: `
      mutation GeneratePage($prompt: String!) {
        generatePage(prompt: $prompt)
      }
    `,
    variables: input
  });
  
  return result;
};