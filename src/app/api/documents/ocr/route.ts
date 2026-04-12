import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 for VLM processing
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Use z-ai-web-dev-sdk for OCR via VLM
    const ZAI = await import('z-ai-web-dev-sdk');
    const zai = await ZAI.create();

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract ALL text from this document image. Preserve the structure, including field labels and values. Return only the extracted text, organized clearly. If this is a form, list each field label and its corresponding value. If you cannot identify any text, respond with "No text detected."'
            },
            {
              type: 'image_url',
              image_url: { url: dataUri }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const extractedText = response.choices[0]?.message?.content || 'No text detected.';

    return NextResponse.json({
      text: extractedText,
      confidence: 0.85,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Failed to process document. Please try again.' },
      { status: 500 }
    );
  }
}
