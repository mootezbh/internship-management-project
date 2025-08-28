import { NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { CVSchema } from '@/lib/validations/cv'

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

    // Call AI SDK with Azure provider to parse CV directly from URL
    let aiResult;
    try {
      aiResult = await generateObject({
        model: azure(process.env.AZURE_DEPLOYMENT_NAME),
        system: `You are a CV parser. You will receive a PDF document URL. Download and analyze the CV content, then extract all relevant information and return a JSON object that matches the provided schema exactly. Be thorough and accurate in extracting personal information, education, experience, and skills.`,
        prompt: `Please analyze the CV document at this URL and extract all relevant information: ${cvUrl}`,
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
