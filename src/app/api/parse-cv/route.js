import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { CVSchema } from '@/lib/validations/cv'

const azure = createAzure({
  apiKey: process.env.AZURE_API_KEY,
  baseURL: process.env.AZURE_API_ENDPOINT
})

// POST /api/parse-cv
export async function POST(request) {
  try {
  const { cvUrl } = await request.json()
  console.log('Received cvUrl:', cvUrl)
    if (!cvUrl) {
      return NextResponse.json({ error: 'CV URL required' }, { status: 400 })
    }

    // Convert PDF to base64 and pass to AI model
    let pdfBase64;
    try {
      console.log('Fetching PDF from:', cvUrl);
      const response = await fetch(cvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfBase64 = buffer.toString('base64');
      console.log('PDF converted to base64, length:', pdfBase64.length);
    } catch (err) {
      console.error('PDF fetch error:', err);
      return NextResponse.json({ error: 'Failed to fetch PDF', details: err.message }, { status: 500 })
    }

    // Call AI SDK with Azure provider to parse CV from base64
    let aiResult;
    try {
      aiResult = await generateObject({
        model: azure(process.env.AZURE_DEPLOYMENT_NAME),
        system: `You are a CV parser. You will receive a PDF document in base64 format. Analyze the PDF content carefully and extract all relevant information including personal details, education, experience, skills, and projects. Return a JSON object that matches the provided schema exactly. Be thorough and accurate in extracting all available information.`,
        prompt: `Please analyze this CV PDF (base64) and extract all relevant information:\n\ndata:application/pdf;base64,${pdfBase64}`,
        schema: CVSchema
      })
    } catch (err) {
      console.error('AI SDK error:', err);
      return NextResponse.json({ error: 'AI SDK error', details: err?.message || err }, { status: 500 })
    }
    console.log('AI SDK result:', aiResult);

    // Validate with Zod
    const parsed = CVSchema.safeParse(aiResult.object)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, { status: 400 })
    }

    return NextResponse.json({ cvParsed: parsed.data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
