import type { Schema } from "../../amplify/data/resource"
import { generateClient } from 'aws-amplify/api';

export const generatePage = async (input: { prompt: string }) => {
  const client = generateClient<Schema>();

  const result = await client.queries.generatePage({
    prompt: input.prompt
  });
  
  return result;
};