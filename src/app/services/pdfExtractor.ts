import { ExtractedContent } from '@/types/pdf-extract';
import { getUrl } from '@aws-amplify/storage';

export async function extractPdfContent(path: string): Promise<ExtractedContent> {
  const response = await fetch(process.env.PDF_EXTRACT_SERVICE_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract PDF content');
  }

  const { key } = await response.json();
  
  // Fetch the extracted content from S3
  const { url } = await getUrl({ path: key });
  const extractedResponse = await fetch(url.toString());
  
  if (!extractedResponse.ok) {
    throw new Error('Failed to fetch extracted content');
  }

  return extractedResponse.json();
}