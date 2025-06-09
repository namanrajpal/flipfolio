import { NextRequest, NextResponse } from 'next/server';
import { getUrl, uploadData } from '@aws-amplify/storage';
import { ExtractedContent } from '@/types/pdf-extract';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json(); // Updated from pdfKey
    
    if (!path) {
      return NextResponse.json({ error: 'No PDF path provided' }, { status: 400 });
    }

    // Get signed URL for the PDF
    const { url } = await getUrl({ path });
    
    // Call Python extraction service
    const response = await fetch(process.env.PDF_EXTRACT_SERVICE_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfUrl: url.toString() })
    });

    if (!response.ok) {
      throw new Error('PDF extraction failed');
    }

    const extractedContent: ExtractedContent = await response.json();

    // Store the extracted content alongside the PDF using the new Amplify Storage API
    const extractedPath = `${path}.extracted.json`;
    const blob = new Blob([JSON.stringify(extractedContent)], { type: 'application/json' });
    
    await uploadData({
      path: extractedPath,
      data: blob,
      options: {
        contentType: 'application/json'
      }
    }).result;

    return NextResponse.json({ success: true, key: extractedPath });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract PDF content' },
      { status: 500 }
    );
  }
}