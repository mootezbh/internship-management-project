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

    // Validate PDF URL is accessible
    try {
      console.log('Validating PDF URL:', cvUrl);
      const response = await fetch(cvUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`PDF not accessible: ${response.status}`);
      }
      console.log('PDF URL is accessible, content-type:', response.headers.get('content-type'));
    } catch (err) {
      console.error('PDF validation error:', err);
      return NextResponse.json({ error: 'Failed to access PDF', details: err.message }, { status: 500 })
    }

    // Call AI SDK with Azure provider using direct URL approach
    let aiResult;
    try {
      // Try direct URL approach first
      aiResult = await generateObject({
        model: azure(process.env.AZURE_DEPLOYMENT_NAME),
        system: `You are a CV parser. You will receive a URL to a PDF document. Access and analyze the PDF content carefully and extract all relevant information including personal details, education, experience, skills, and projects. Return a JSON object that matches the provided schema exactly. Be thorough and accurate in extracting all available information. DO NOT use placeholder or example data - only extract actual information from the provided document.`,
        prompt: `Please download and analyze the CV PDF from this URL and extract all relevant information: ${cvUrl}

Make sure to:
1. Actually download and read the PDF content
2. Extract real data from the document
3. Do not use placeholder values like "John Doe" 
4. Return accurate information based on what you find in the PDF`,
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
