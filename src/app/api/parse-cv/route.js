import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { CVSchema } from '@/lib/validations/cv'
import pdf from 'pdf-parse'

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
  apiVersion: process.env.AZURE_API_VERSION,
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

    // Fetch and parse PDF to extract text
    let pdfText;
    try {
      const response = await fetch(cvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);
      pdfText = data.text;
      console.log('Extracted PDF text length:', pdfText.length);
    } catch (err) {
      console.error('PDF parsing error:', err);
      return NextResponse.json({ error: 'Failed to parse PDF', details: err.message }, { status: 500 })
    }

    // Call AI SDK with Azure provider to parse CV text
    let aiResult;
    try {
      aiResult = await generateObject({
        model: azure(process.env.AZURE_DEPLOYMENT_NAME),
        system: `You are a CV parser. Extract information from the provided CV text and return a JSON object that matches the provided schema exactly. Be thorough and accurate.`,
        prompt: `Parse the following CV text and extract all relevant information:\n\n${pdfText}`,
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
