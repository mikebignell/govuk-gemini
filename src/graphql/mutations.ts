import type { Schema } from "../../amplify/data/resource"
import { generateClient } from "aws-amplify/api"

const client = generateClient<Schema>();

export const generatePage = async (input: { prompt: string }) => {
  const result = await client.mutations.generatePage({ prompt: input.prompt });
  return result; // result will be the URL string
};