// amplify/function/generateGovukPage/handler.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { URL } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AMPLIFY_STORAGE_BUCKET_NAME!;

interface Event {
  arguments: {
    prompt: string;
  };
}

export const handler = async (event: Event) => {
  try {
    const prompt = event.arguments.prompt;
    
    // Initialize Google Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    // Call Google Gemini API
    const result = await model.generateContent(
        `Create a detailed response in the style of a UK government advice page about: ${prompt}. 
          Use formal, clear language and structure it with appropriate headings. Follow these guidelines:
          1. Use clear, concise sentences
          2. Structure with H2 and H3 headings
          3. Use bullet points for lists
          4. Include relevant warnings or cautions if applicable
          5. Maintain a professional, authoritative tone`
    );
    
    const response = await result.response;
    const text = response.text();
    
    // Generate GOV.UK styled HTML
    const htmlContent = generateGovukHtml(text);
    
    // Save to S3
    const fileName = `generated-pages/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.html`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: htmlContent,
      ContentType: 'text/html'
    }));
    
    // Return the URL to redirect to
    const fileUrl = new URL(`https://${bucketName}.s3.amazonaws.com/${fileName}`);
    return fileUrl.toString();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

function generateGovukHtml(content: string): string {
  // Convert markdown-style formatting to HTML
  const formattedContent = content
    .replace(/##\s(.+?)\n/g, '<h2 class="govuk-heading-l">$1</h2>')
    .replace(/###\s(.+?)\n/g, '<h3 class="govuk-heading-m">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\s*-\s(.+?)(?=\n)/g, '<li>$1</li>')
    .replace(/(<li>.+?<\/li>)+/g, '<ul class="govuk-list govuk-list--bullet">$&</ul>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Advice</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/govuk-frontend@4.7.0/govuk/all.css">
</head>
<body>
  <div class="govuk-width-container">
    <main class="govuk-main-wrapper govuk-main-wrapper--auto-spacing" id="main-content" role="main">
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          ${formattedContent}
        </div>
      </div>
    </main>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/govuk-frontend@4.7.0/govuk/all.js"></script>
  <script>window.GOVUKFrontend.initAll()</script>
</body>
</html>`;
}