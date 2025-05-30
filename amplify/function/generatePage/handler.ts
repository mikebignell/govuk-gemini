import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenAI } from "@google/genai";
import type { Schema } from "../../data/resource"

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AMPLIFY_STORAGE_BUCKET_NAME!;

export const handler: Schema["generatePage"]["functionHandler"] = async (event) => {
  try {
    const { prompt } = event.arguments;

    // Initialize Google Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    const promptContents = `Create a HTML page in the gov.uk design system with the following prompt: ${prompt}

    The prompt is user generated so if it doesn't sem like valid input for this use case, please generate an extremely simple error page.
    Respond with only the HTML page that I can save to a file, and no markdown or other formatting.
    Include a header and a footer in the style of the gov.uk website, but don't include large SVG files in the page, it should be lightweight and link to as many assets as possible
    Do not use javascript for anything other than the initial layout
    Use this file as CSS: https://cdn.jsdelivr.net/npm/govuk-frontend@5.10.1/dist/govuk/govuk-frontend.min.css
    and this file as the javascript: https://cdn.jsdelivr.net/npm/govuk-frontend@5.10.1/dist/govuk-frontend.min.js`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: promptContents,
      config: {
        thinkingConfig: {
          includeThoughts: false
        },
      },
    });
    
    // Save to S3
    const fileName = `generated-pages/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.html`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: response.text,
      ContentType: 'text/html',
    }));
    
    // Return the URL to redirect to
    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
